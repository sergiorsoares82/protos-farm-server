import { InvoiceType } from '../../domain/enums/InvoiceType.js';
import type { IInvoiceRepository } from '../../domain/repositories/IInvoiceRepository.js';
import type { IInvoiceShipmentRepository } from '../../domain/repositories/IInvoiceShipmentRepository.js';
import { InvoiceShipment } from '../../domain/entities/InvoiceShipment.js';
import { InvoiceShipmentItem } from '../../domain/entities/InvoiceShipmentItem.js';
import type {
  CreateInvoiceShipmentDTO,
  InvoiceShipmentDTO,
  InvoiceShipmentItemDTO,
} from '../dtos/InvoiceShipmentDTOs.js';
import type { StockMovementService } from './StockMovementService.js';
import type { StockMovementTypeService } from './StockMovementTypeService.js';

const VENDA_TYPE_CODE = 'VENDA';
const ENTRADA_AJUSTE_TYPE_CODE = 'ENTRADA_AJUSTE';

export class InvoiceShipmentService {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly shipmentRepository: IInvoiceShipmentRepository,
    private readonly stockMovementService: StockMovementService,
    private readonly stockMovementTypeService: StockMovementTypeService,
  ) {}

  async createShipment(
    tenantId: string,
    invoiceId: string,
    data: CreateInvoiceShipmentDTO,
  ): Promise<InvoiceShipmentDTO> {
    const invoice = await this.invoiceRepository.findById(invoiceId, tenantId);
    if (!invoice) {
      throw new Error('Nota fiscal não encontrada');
    }
    if (invoice.getType() !== InvoiceType.RECEITA) {
      throw new Error('Saída de produtos só é permitida para notas fiscais de receita');
    }

    const shipmentDate = new Date(data.shipmentDate);
    if (Number.isNaN(shipmentDate.getTime())) {
      throw new Error('Data da saída inválida');
    }

    const invoiceItems = invoice.getItems();
    const invoiceItemIds = new Set(invoiceItems.map((i) => i.getId()));
    const invoiceItemMap = new Map(invoiceItems.map((i) => [i.getId(), i]));

    const existingShipments = await this.shipmentRepository.findByInvoiceId(invoiceId, tenantId);
    const shippedByInvoiceItemId = new Map<string, number>();
    for (const sh of existingShipments) {
      for (const line of sh.getItems()) {
        const id = line.getInvoiceItemId();
        const current = shippedByInvoiceItemId.get(id) ?? 0;
        shippedByInvoiceItemId.set(id, current + line.getQuantityShipped());
      }
    }

    const shipmentItemsByInvoiceItemId = new Map<string, number>();
    for (const dto of data.items) {
      if (!invoiceItemIds.has(dto.invoiceItemId)) {
        throw new Error(`Item da nota não encontrado: ${dto.invoiceItemId}`);
      }
      if (typeof dto.quantityShipped !== 'number' || dto.quantityShipped <= 0) {
        continue;
      }
      const current = shipmentItemsByInvoiceItemId.get(dto.invoiceItemId) ?? 0;
      shipmentItemsByInvoiceItemId.set(dto.invoiceItemId, current + dto.quantityShipped);
    }
    for (const [invItemId, qtyThisShipment] of shipmentItemsByInvoiceItemId) {
      const alreadyShipped = shippedByInvoiceItemId.get(invItemId) ?? 0;
      const invoiceItem = invoiceItemMap.get(invItemId)!;
      const orderedQty = invoiceItem.getQuantity();
      if (alreadyShipped + qtyThisShipment > orderedQty) {
        throw new Error(
          `Quantidade da saída excede a quantidade faturada para o item (faturado: ${orderedQty}, já entregue: ${alreadyShipped}, esta saída: ${qtyThisShipment})`,
        );
      }
    }

    const shipment = InvoiceShipment.create(
      tenantId,
      invoiceId,
      shipmentDate,
      data.notes ?? null,
    );
    for (const dto of data.items) {
      if (dto.quantityShipped > 0) {
        const item = InvoiceShipmentItem.create(
          shipment.getId(),
          dto.invoiceItemId,
          dto.quantityShipped,
        );
        shipment.addItem(item);
      }
    }

    const saved = await this.shipmentRepository.save(shipment, tenantId);

    const types = await this.stockMovementTypeService.getAllTypes(tenantId);
    const vendaType = types.find((t) => t.getCode() === VENDA_TYPE_CODE);
    if (!vendaType) {
      throw new Error(
        'Tipo de movimento "Venda" não encontrado. Execute o seed de tipos de movimento de estoque.',
      );
    }
    const shipmentDateStr = saved.getShipmentDate().toISOString().slice(0, 10);
    for (const line of saved.getItems()) {
      const invoiceItem = invoiceItemMap.get(line.getInvoiceItemId());
      if (invoiceItem && invoiceItem.getGoesToStock() && line.getQuantityShipped() > 0) {
        await this.stockMovementService.createMovement(tenantId, {
          movementDate: shipmentDateStr,
          stockMovementTypeId: vendaType.getId(),
          itemId: invoiceItem.getItemId(),
          unit: invoiceItem.getUnit(),
          quantity: line.getQuantityShipped(),
          workLocationId: null,
          seasonId: invoiceItem.getSeasonId() ?? null,
          costCenterId: invoiceItem.getCostCenterId(),
          managementAccountId: invoiceItem.getManagementAccountId(),
        });
      }
    }

    return this.toDTO(saved);
  }

  async getShipmentsByInvoiceId(tenantId: string, invoiceId: string): Promise<InvoiceShipmentDTO[]> {
    const invoice = await this.invoiceRepository.findById(invoiceId, tenantId);
    if (!invoice) {
      throw new Error('Nota fiscal não encontrada');
    }
    const shipments = await this.shipmentRepository.findByInvoiceId(invoiceId, tenantId);
    return shipments.map((s) => this.toDTO(s));
  }

  async getShippedTotalsByInvoiceId(
    tenantId: string,
    invoiceId: string,
  ): Promise<Record<string, number>> {
    const shipments = await this.shipmentRepository.findByInvoiceId(invoiceId, tenantId);
    const map: Record<string, number> = {};
    for (const sh of shipments) {
      for (const line of sh.getItems()) {
        const id = line.getInvoiceItemId();
        map[id] = (map[id] ?? 0) + line.getQuantityShipped();
      }
    }
    return map;
  }

  async getShippedTotalsByInvoiceIds(
    tenantId: string,
    invoiceIds: string[],
  ): Promise<Map<string, Record<string, number>>> {
    if (invoiceIds.length === 0) return new Map();
    const shipments = await this.shipmentRepository.findByInvoiceIds(tenantId, invoiceIds);
    const byInvoice = new Map<string, Record<string, number>>();
    for (const sh of shipments) {
      const invId = sh.getInvoiceId();
      let map = byInvoice.get(invId);
      if (!map) {
        map = {};
        byInvoice.set(invId, map);
      }
      for (const line of sh.getItems()) {
        const itemId = line.getInvoiceItemId();
        map[itemId] = (map[itemId] ?? 0) + line.getQuantityShipped();
      }
    }
    return byInvoice;
  }

  async deleteShipment(tenantId: string, invoiceId: string, shipmentId: string): Promise<void> {
    const shipment = await this.shipmentRepository.findById(shipmentId, tenantId);
    if (!shipment || shipment.getInvoiceId() !== invoiceId) {
      throw new Error('Saída não encontrada');
    }
    const invoice = await this.invoiceRepository.findById(invoiceId, tenantId);
    if (!invoice) {
      throw new Error('Nota fiscal não encontrada');
    }
    const invoiceItemMap = new Map(invoice.getItems().map((i) => [i.getId(), i]));
    const types = await this.stockMovementTypeService.getAllTypes(tenantId);
    const entradaAjusteType = types.find((t) => t.getCode() === ENTRADA_AJUSTE_TYPE_CODE);
    if (!entradaAjusteType) {
      throw new Error(
        'Tipo de movimento "Entrada de ajuste" não encontrado. Execute o seed de tipos de movimento de estoque.',
      );
    }
    const shipmentDateStr = shipment.getShipmentDate().toISOString().slice(0, 10);
    for (const line of shipment.getItems()) {
      const invoiceItem = invoiceItemMap.get(line.getInvoiceItemId());
      if (invoiceItem && invoiceItem.getGoesToStock() && line.getQuantityShipped() > 0) {
        await this.stockMovementService.createMovement(tenantId, {
          movementDate: shipmentDateStr,
          stockMovementTypeId: entradaAjusteType.getId(),
          itemId: invoiceItem.getItemId(),
          unit: invoiceItem.getUnit(),
          quantity: line.getQuantityShipped(),
          workLocationId: null,
          seasonId: invoiceItem.getSeasonId() ?? null,
          costCenterId: invoiceItem.getCostCenterId(),
          managementAccountId: invoiceItem.getManagementAccountId(),
        });
      }
    }
    await this.shipmentRepository.delete(shipmentId, tenantId);
  }

  private toDTO(shipment: InvoiceShipment): InvoiceShipmentDTO {
    return {
      id: shipment.getId(),
      invoiceId: shipment.getInvoiceId(),
      shipmentDate: shipment.getShipmentDate().toISOString().slice(0, 10),
      notes: shipment.getNotes(),
      items: shipment.getItems().map((i) => this.itemToDTO(i)),
      createdAt: shipment.getCreatedAt().toISOString(),
      updatedAt: shipment.getUpdatedAt().toISOString(),
    };
  }

  private itemToDTO(item: InvoiceShipmentItem): InvoiceShipmentItemDTO {
    return {
      id: item.getId(),
      invoiceItemId: item.getInvoiceItemId(),
      quantityShipped: item.getQuantityShipped(),
    };
  }
}
