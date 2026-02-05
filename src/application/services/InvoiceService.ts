import type { IInvoiceRepository } from '../../domain/repositories/IInvoiceRepository.js';
import { Invoice } from '../../domain/entities/Invoice.js';
import { InvoiceItem } from '../../domain/entities/InvoiceItem.js';
import { InvoiceFinancial } from '../../domain/entities/InvoiceFinancial.js';
import { InvoiceFinancialStatus } from '../../domain/enums/InvoiceFinancialStatus.js';
import { ItemType } from '../../domain/enums/ItemType.js';
import { InvoiceType } from '../../domain/enums/InvoiceType.js';
import type { CreateInvoiceDTO, UpdateInvoiceDTO, InvoiceItemDTO, InvoiceFinancialDTO } from '../dtos/InvoiceDTOs.js';

export class InvoiceService {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async createInvoice(tenantId: string, data: CreateInvoiceDTO): Promise<Invoice> {
    const exists = await this.invoiceRepository.existsByNumber(data.number, tenantId);
    if (exists) {
      throw new Error('Já existe uma nota fiscal com este número');
    }

    const issueDate = new Date(data.issueDate);
    if (Number.isNaN(issueDate.getTime())) {
      throw new Error('Data de emissão inválida');
    }

    if (data.type === InvoiceType.RECEITA) {
      if (!data.emitterPartyId?.trim()) throw new Error('Emitente (produtor/empresa) é obrigatório em nota de venda');
      if (!data.recipientClientId?.trim()) throw new Error('Destinatário (cliente) é obrigatório em nota de venda');
    } else {
      if (!data.emitterSupplierId?.trim()) throw new Error('Emitente (fornecedor) é obrigatório em nota de compra');
      if (!data.recipientPartyId?.trim()) throw new Error('Destinatário (produtor/empresa) é obrigatório em nota de compra');
    }

    const invoice = Invoice.create(tenantId, data.number, issueDate, data.type, {
      emitterSupplierId: data.emitterSupplierId ?? null,
      emitterPartyId: data.emitterPartyId ?? null,
      recipientClientId: data.recipientClientId ?? null,
      recipientPartyId: data.recipientPartyId ?? null,
      ...(data.series !== undefined && data.series !== '' && { series: data.series }),
      ...(data.documentTypeId !== undefined && data.documentTypeId !== '' && { documentTypeId: data.documentTypeId }),
      ...(data.notes !== undefined && data.notes !== '' && { notes: data.notes }),
    });

    let lineOrder = 0;
    for (const dto of data.items ?? []) {
      const item = InvoiceItem.create(
        invoice.getId(),
        dto.itemId,
        dto.itemType as ItemType,
        dto.quantity,
        dto.unit,
        dto.unitPrice,
        lineOrder++,
        dto.description,
        dto.costCenterId ?? null,
        dto.managementAccountId ?? null,
        dto.seasonId ?? null,
        dto.goesToStock ?? false
      );
      invoice.addItem(item);
    }

    for (const dto of data.financials ?? []) {
      const dueDate = new Date(dto.dueDate);
      if (Number.isNaN(dueDate.getTime())) {
        throw new Error('Data de vencimento inválida');
      }
      const financial = InvoiceFinancial.create(invoice.getId(), dueDate, dto.amount, {
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
        clearedAt: dto.clearedAt ? new Date(dto.clearedAt) : undefined,
        penalty: dto.penalty ?? 0,
        interest: dto.interest ?? 0,
        bankAccountId: dto.bankAccountId ?? null,
        invoiceFinancialsTypeId: dto.invoiceFinancialsTypeId ?? null,
      });
      if (dto.paidAt) {
        financial.markAsPaid(new Date(dto.paidAt));
      }
      invoice.addFinancial(financial);
    }

    return await this.invoiceRepository.save(invoice, tenantId);
  }

  async getInvoice(tenantId: string, id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id, tenantId);
    if (!invoice) {
      throw new Error('Nota fiscal não encontrada');
    }
    return invoice;
  }

  async getAllInvoices(tenantId: string): Promise<Invoice[]> {
    return await this.invoiceRepository.findAll(tenantId);
  }

  async updateInvoice(tenantId: string, id: string, data: UpdateInvoiceDTO): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id, tenantId);
    if (!invoice) {
      throw new Error('Nota fiscal não encontrada');
    }

    if (data.number && data.number !== invoice.getNumber()) {
      const exists = await this.invoiceRepository.existsByNumber(data.number, tenantId, id);
      if (exists) {
        throw new Error('Já existe uma nota fiscal com este número');
      }
    }

    const number = data.number ?? invoice.getNumber();
    const issueDate = data.issueDate ? new Date(data.issueDate) : invoice.getIssueDate();
    const type = data.type ?? invoice.getType();
    const series = data.series !== undefined ? data.series : invoice.getSeries();
    const documentTypeId = data.documentTypeId !== undefined ? data.documentTypeId : invoice.getDocumentTypeId();
    const notes = data.notes !== undefined ? data.notes : invoice.getNotes();
    const emitterSupplierId = data.emitterSupplierId !== undefined ? data.emitterSupplierId : invoice.getEmitterSupplierId();
    const emitterPartyId = data.emitterPartyId !== undefined ? data.emitterPartyId : invoice.getEmitterPartyId();
    const recipientClientId = data.recipientClientId !== undefined ? data.recipientClientId : invoice.getRecipientClientId();
    const recipientPartyId = data.recipientPartyId !== undefined ? data.recipientPartyId : invoice.getRecipientPartyId();

    invoice.updateHeader(number, issueDate, type, {
      emitterSupplierId,
      emitterPartyId,
      recipientClientId,
      recipientPartyId,
      ...(series !== undefined && { series }),
      ...(documentTypeId !== undefined && { documentTypeId }),
      ...(notes !== undefined && { notes }),
    });

    if (data.items !== undefined) {
      for (const existing of invoice.getItems()) {
        invoice.removeItem(existing.getId());
      }
      let lineOrder = 0;
      for (const dto of data.items) {
        const item = InvoiceItem.create(
          invoice.getId(),
          dto.itemId,
          dto.itemType as ItemType,
          dto.quantity,
          dto.unit,
          dto.unitPrice,
          lineOrder++,
          dto.description,
          dto.costCenterId ?? null,
          dto.managementAccountId ?? null,
          dto.seasonId ?? null,
          dto.goesToStock ?? false
        );
        invoice.addItem(item);
      }
    }

    if (data.financials !== undefined) {
      for (const existing of invoice.getFinancials()) {
        invoice.removeFinancial(existing.getId());
      }
      for (const dto of data.financials) {
        const dueDate = new Date(dto.dueDate);
        if (Number.isNaN(dueDate.getTime())) {
          throw new Error('Data de vencimento inválida');
        }
        const financial = InvoiceFinancial.create(invoice.getId(), dueDate, dto.amount, {
          paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
          clearedAt: dto.clearedAt ? new Date(dto.clearedAt) : undefined,
          penalty: dto.penalty ?? 0,
          interest: dto.interest ?? 0,
          bankAccountId: dto.bankAccountId ?? null,
          invoiceFinancialsTypeId: dto.invoiceFinancialsTypeId ?? null,
        });
        if (dto.paidAt) {
          financial.markAsPaid(new Date(dto.paidAt));
        }
        invoice.addFinancial(financial);
      }
    }

    return await this.invoiceRepository.save(invoice, tenantId);
  }

  async deleteInvoice(tenantId: string, id: string): Promise<void> {
    const invoice = await this.invoiceRepository.findById(id, tenantId);
    if (!invoice) {
      throw new Error('Nota fiscal não encontrada');
    }
    await this.invoiceRepository.delete(id, tenantId);
  }

  async markFinancialAsPaid(
    tenantId: string,
    invoiceId: string,
    financialId: string,
    paidAt?: Date
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId, tenantId);
    if (!invoice) {
      throw new Error('Nota fiscal não encontrada');
    }
    const financial = invoice.getFinancials().find((f) => f.getId() === financialId);
    if (!financial) {
      throw new Error('Parcela financeira não encontrada');
    }
    financial.markAsPaid(paidAt);
    return await this.invoiceRepository.save(invoice, tenantId);
  }
}
