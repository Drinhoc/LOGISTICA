import { Prisma, type CostSettings } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { AppError } from '../../middlewares/errorHandler';
import { BusinessService } from '../business/businessService';

export interface CostSettingsInput {
  costPerKm: number;
  costPerHour: number;
  currency?: string;
}

export class CostSettingsService {
  static async getCostSettings(userId: string): Promise<CostSettings> {
    const business = await BusinessService.getBusinessOrThrow(userId);
    const settings = await prisma.costSettings.findUnique({ where: { businessId: business.id } });

    if (!settings) {
      throw new AppError('Cost settings not found', 404);
    }

    return settings;
  }

  static async upsertCostSettings(userId: string, data: CostSettingsInput): Promise<CostSettings> {
    const business = await BusinessService.getBusinessOrThrow(userId);

    if (data.costPerKm === undefined || data.costPerHour === undefined) {
      throw new AppError('costPerKm and costPerHour are required', 400);
    }

    const payload = {
      costPerKm: new Prisma.Decimal(data.costPerKm),
      costPerHour: new Prisma.Decimal(data.costPerHour),
      currency: data.currency ?? 'BRL',
      businessId: business.id,
    };

    return prisma.costSettings.upsert({
      where: { businessId: business.id },
      create: payload,
      update: payload,
    });
  }
}
