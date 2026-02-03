import type { Request, Response } from 'express';
import { BankAccountService } from '../../application/services/BankAccountService.js';
import type {
  CreateBankAccountDTO,
  UpdateBankAccountDTO,
} from '../../application/dtos/BankAccountDTOs.js';

export class BankAccountController {
  constructor(private bankAccountService: BankAccountService) {}

  async getAllAccounts(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const items = await this.bankAccountService.getAllAccounts(tenantId);
      res.json(items.map((a) => a.toJSON()));
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateBankAccountDTO = req.body;
      const created = await this.bankAccountService.createAccount(tenantId, data);
      res.status(201).json(created.toJSON());
    } catch (error) {
      console.error('Error creating bank account:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async getAccount(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const item = await this.bankAccountService.getAccount(tenantId, id as string);
      res.json(item.toJSON());
    } catch (error) {
      console.error('Error fetching bank account:', error);
      res.status(404).json({ error: 'Bank account not found' });
    }
  }

  async updateAccount(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      const data: UpdateBankAccountDTO = req.body;
      const updated = await this.bankAccountService.updateAccount(
        tenantId,
        id as string,
        data,
      );
      res.json(updated.toJSON());
    } catch (error) {
      console.error('Error updating bank account:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const { id } = req.params;
      await this.bankAccountService.deleteAccount(tenantId, id as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting bank account:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
