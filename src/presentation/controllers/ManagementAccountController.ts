import type { Request, Response } from 'express';
import { ManagementAccountService } from '../../application/services/ManagementAccountService.js';
import type { CreateManagementAccountDTO, UpdateManagementAccountDTO } from '../../application/dtos/ManagementAccountDTOs.js';

export class ManagementAccountController {
    constructor(private accountService: ManagementAccountService) { }

    async getAllAccounts(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const items = await this.accountService.getAllAccounts(tenantId);
            res.json(items);
        } catch (error) {
            console.error('Error fetching management accounts:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getAccountsForCostCenter(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { costCenterId } = req.params;
            if (!costCenterId || typeof costCenterId !== 'string') {
                res.status(400).json({ error: 'Invalid cost center id' });
                return;
            }

            const accounts = await this.accountService.getAccountsForCostCenter(tenantId, costCenterId);
            res.json(accounts);
        } catch (error) {
            console.error('Error fetching management accounts for cost center:', error);
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Failed to get management accounts',
            });
        }
    }

    async createAccount(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const data: CreateManagementAccountDTO = req.body;
            const newItem = await this.accountService.createAccount(tenantId, data);
            res.status(201).json(newItem);
        } catch (error) {
            console.error('Error creating management account:', error);
            if (error instanceof Error && error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
            }
        }
    }

    async getAccountTypes(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { id } = req.params;
            const types = await this.accountService.getTypesForAccount(id as string, tenantId);
            res.json({ success: true, data: types });
        } catch (error) {
            console.error('Error fetching management account types:', error);
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get management account types',
            });
        }
    }

    async linkAccountType(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { id } = req.params;
            const { type } = req.body as { type?: string };
            if (!type) {
                res.status(400).json({ success: false, error: 'Type is required' });
                return;
            }
            await this.accountService.linkAccountToCostCenterType(tenantId, id as string, type);
            res.status(204).send();
        } catch (error) {
            console.error('Error linking management account type:', error);
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to link management account type',
            });
        }
    }

    async unlinkAccountType(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { id, type } = req.params as { id?: string; type?: string };
            if (!type) {
                res.status(400).json({ success: false, error: 'Type is required' });
                return;
            }
            await this.accountService.unlinkAccountFromCostCenterType(tenantId, id as string, type);
            res.status(204).send();
        } catch (error) {
            console.error('Error unlinking management account type:', error);
            res.status(400).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to unlink management account type',
            });
        }
    }

    async getAccount(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { id } = req.params;
            const item = await this.accountService.getAccount(tenantId, id as string);
            res.json(item);
        } catch (error) {
            console.error('Error fetching management account:', error);
            res.status(404).json({ error: 'Management Account not found' });
        }
    }

    async updateAccount(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { id } = req.params;
            const data: UpdateManagementAccountDTO = req.body;
            const updatedItem = await this.accountService.updateAccount(tenantId, id as string, data);
            res.json(updatedItem);
        } catch (error) {
            console.error('Error updating management account:', error);
            if (error instanceof Error && error.message.includes('already exists')) {
                res.status(409).json({ error: error.message });
            } else {
                res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
            }
        }
    }

    async deleteAccount(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.user!.tenantId;
            const { id } = req.params;
            await this.accountService.deleteAccount(tenantId, id as string);
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting management account:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
