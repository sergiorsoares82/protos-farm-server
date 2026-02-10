import type { Request, Response } from 'express';
import { AssetService } from '../../application/services/AssetService.js';
import { MachineService } from '../../application/services/MachineService.js';
import { CostCenterService } from '../../application/services/CostCenterService.js';
import { AssetKind } from '../../domain/enums/AssetKind.js';
import type { CreateFullMachineDTO } from '../../application/dtos/AssetDTOs.js';

export class FullMachineController {
  constructor(
    private readonly assetService: AssetService,
    private readonly machineService: MachineService,
    private readonly costCenterService: CostCenterService,
  ) {}

  async createFullMachine(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.user!.tenantId;
      const data: CreateFullMachineDTO = req.body;

      const code =
        (data.code && data.code.trim()) ||
        (data.name ? data.name.replace(/\s+/g, '').slice(0, 20) : undefined);

      const createAssetDto: Parameters<AssetService['createAsset']>[1] = {
        name: data.name,
        assetKind: AssetKind.MACHINE,
      };
      if (code) createAssetDto.code = code;

      const asset = await this.assetService.createAsset(tenantId, createAssetDto);

      const machine = await this.machineService.createMachine(tenantId, {
        name: asset.getName(),
        machineTypeId: data.machineTypeId,
        assetId: asset.getId(),
      });

      const costCenterCode =
        (data.costCenterCode && data.costCenterCode.trim()) ||
        code ||
        asset.getId().slice(0, 8);
      const costCenterDesc =
        (data.costCenterDescription && data.costCenterDescription.trim()) ||
        asset.getName();
      const kindCategoryId = await this.costCenterService.getKindCategoryIdByCode(tenantId, 'MACHINE');
      const createCcDto: Parameters<CostCenterService['createCostCenter']>[1] = {
        code: costCenterCode,
        description: costCenterDesc,
        kindCategoryId,
        type: data.costCenterType,
        assetId: asset.getId(),
      };
      if (data.costCenterCategoryId) createCcDto.categoryId = data.costCenterCategoryId;

      const costCenter = await this.costCenterService.createCostCenter(tenantId, createCcDto);

      res.status(201).json({
        asset: asset.toJSON(),
        machine: { id: machine.getId(), name: machine.getName(), machineTypeId: machine.getMachineTypeId(), assetId: machine.getAssetId(), isActive: machine.getIsActive(), createdAt: machine.getCreatedAt(), updatedAt: machine.getUpdatedAt() },
        costCenter: costCenter.toJSON(),
      });
    } catch (error) {
      console.error('Error creating full machine:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Invalid request',
      });
    }
  }
}
