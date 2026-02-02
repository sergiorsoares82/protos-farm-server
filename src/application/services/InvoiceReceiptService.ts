import type { IInvoiceRepository } from '../../domain/repositories/IInvoiceRepository.js';
import type { IInvoiceReceiptRepository } from '../../domain/repositories/IInvoiceReceiptRepository.js';
import { InvoiceReceipt } from '../../domain/entities/InvoiceReceipt.js';
import { InvoiceReceiptItem } from '../../domain/entities/InvoiceReceiptItem.js';
import type { CreateInvoiceReceiptDTO, InvoiceReceiptDTO, InvoiceReceiptItemDTO } from '../dtos/InvoiceReceiptDTOs.js';
import type { StockMovementService } from './StockMovementService.js';
import type { StockMovementTypeService } from './StockMovementTypeService.js';

const COMPRA_TYPE_CODE = 'COMPRA';

export class InvoiceReceiptService {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly receiptRepository: IInvoiceReceiptRepository,
    private readonly stockMovementService: StockMovementService,
    private readonly stockMovementTypeService: StockMovementTypeService,
  ) {}

  async createReceipt(tenantId: string, invoiceId: string, data: CreateInvoiceReceiptDTO): Promise<InvoiceReceiptDTO> {
    const invoice = await this.invoiceRepository.findById(invoiceId, tenantId);
    if (!invoice) {
      throw new Error('Nota fiscal não encontrada');
    }

    const receiptDate = new Date(data.receiptDate);
    if (Number.isNaN(receiptDate.getTime())) {
      throw new Error('Data do recebimento inválida');
    }

    const invoiceItems = invoice.getItems();
    const invoiceItemIds = new Set(invoiceItems.map((i) => i.getId()));
    const invoiceItemMap = new Map(invoiceItems.map((i) => [i.getId(), i]));

    const existingReceipts = await this.receiptRepository.findByInvoiceId(invoiceId, tenantId);
    const receivedByInvoiceItemId = new Map<string, number>();
    for (const rec of existingReceipts) {
      for (const line of rec.getItems()) {
        const id = line.getInvoiceItemId();
        const current = receivedByInvoiceItemId.get(id) ?? 0;
        receivedByInvoiceItemId.set(id, current + line.getQuantityReceived());
      }
    }

    const receiptItemsByInvoiceItemId = new Map<string, number>();
    for (const dto of data.items) {
      if (!invoiceItemIds.has(dto.invoiceItemId)) {
        throw new Error(`Item da nota não encontrado: ${dto.invoiceItemId}`);
      }
      if (typeof dto.quantityReceived !== 'number' || dto.quantityReceived <= 0) {
        continue;
      }
      const current = receiptItemsByInvoiceItemId.get(dto.invoiceItemId) ?? 0;
      receiptItemsByInvoiceItemId.set(dto.invoiceItemId, current + dto.quantityReceived);
    }
    for (const [invItemId, qtyThisReceipt] of receiptItemsByInvoiceItemId) {
      const alreadyReceived = receivedByInvoiceItemId.get(invItemId) ?? 0;
      const invoiceItem = invoiceItemMap.get(invItemId)!;
      const orderedQty = invoiceItem.getQuantity();
      if (alreadyReceived + qtyThisReceipt > orderedQty) {
        throw new Error(
          `Quantidade recebida excede a quantidade faturada para o item (faturado: ${orderedQty}, já recebido: ${alreadyReceived}, este recebimento: ${qtyThisReceipt})`
        );
      }
    }

    const receipt = InvoiceReceipt.create(tenantId, invoiceId, receiptDate, data.notes ?? null);
    for (const dto of data.items) {
      if (dto.quantityReceived > 0) {
        const item = InvoiceReceiptItem.create(receipt.getId(), dto.invoiceItemId, dto.quantityReceived);
        receipt.addItem(item);
      }
    }

    const saved = await this.receiptRepository.save(receipt, tenantId);

    const types = await this.stockMovementTypeService.getAllTypes(tenantId);
    const compraType = types.find((t) => t.getCode() === COMPRA_TYPE_CODE);
    if (!compraType) {
      throw new Error('Tipo de movimento "Compra" não encontrado. Execute o seed de tipos de movimento de estoque.');
    }
    const receiptDateStr = saved.getReceiptDate().toISOString().slice(0, 10);
    for (const line of saved.getItems()) {
      const invoiceItem = invoiceItemMap.get(line.getInvoiceItemId());
      if (invoiceItem && invoiceItem.getGoesToStock() && line.getQuantityReceived() > 0) {
        await this.stockMovementService.createMovement(tenantId, {
          movementDate: receiptDateStr,
          stockMovementTypeId: compraType.getId(),
          itemId: invoiceItem.getItemId(),
          unit: invoiceItem.getUnit(),
          quantity: line.getQuantityReceived(),
          workLocationId: null,
          seasonId: invoiceItem.getSeasonId() ?? null,
          costCenterId: invoiceItem.getCostCenterId(),
          managementAccountId: invoiceItem.getManagementAccountId(),
        });
      }
    }

    return this.toDTO(saved);
  }

  async getReceiptsByInvoiceId(tenantId: string, invoiceId: string): Promise<InvoiceReceiptDTO[]> {
    const invoice = await this.invoiceRepository.findById(invoiceId, tenantId);
    if (!invoice) {
      throw new Error('Nota fiscal não encontrada');
    }
    const receipts = await this.receiptRepository.findByInvoiceId(invoiceId, tenantId);
    return receipts.map((r) => this.toDTO(r));
  }

  /**
   * Returns total quantity received per invoice item ID for a given invoice (for display in GET invoice).
   */
  async getReceivedTotalsByInvoiceId(tenantId: string, invoiceId: string): Promise<Record<string, number>> {
    const receipts = await this.receiptRepository.findByInvoiceId(invoiceId, tenantId);
    const map: Record<string, number> = {};
    for (const rec of receipts) {
      for (const line of rec.getItems()) {
        const id = line.getInvoiceItemId();
        map[id] = (map[id] ?? 0) + line.getQuantityReceived();
      }
    }
    return map;
  }

  private toDTO(receipt: InvoiceReceipt): InvoiceReceiptDTO {
    return {
      id: receipt.getId(),
      invoiceId: receipt.getInvoiceId(),
      receiptDate: receipt.getReceiptDate().toISOString().slice(0, 10),
      notes: receipt.getNotes(),
      items: receipt.getItems().map((i) => this.itemToDTO(i)),
      createdAt: receipt.getCreatedAt().toISOString(),
      updatedAt: receipt.getUpdatedAt().toISOString(),
    };
  }

  private itemToDTO(item: InvoiceReceiptItem): InvoiceReceiptItemDTO {
    return {
      id: item.getId(),
      invoiceItemId: item.getInvoiceItemId(),
      quantityReceived: item.getQuantityReceived(),
    };
  }
}
