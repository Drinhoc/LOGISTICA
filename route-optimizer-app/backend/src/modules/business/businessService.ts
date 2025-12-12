import { Prisma, type Business } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { AppError } from '../../middlewares/errorHandler';

export interface BusinessInput {
  name?: string;
  description?: string | null;
  baseAddress?: string | null;
  baseLatitude?: number | null;
  baseLongitude?: number | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

const toDecimalOrUndefined = (value?: number | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Prisma.Decimal(value);
};

const mapBusinessData = (data: BusinessInput) => ({
  name: data.name,
  description: data.description,
  baseAddress: data.baseAddress,
  baseLatitude: toDecimalOrUndefined(data.baseLatitude),
  baseLongitude: toDecimalOrUndefined(data.baseLongitude),
  contactEmail: data.contactEmail,
  contactPhone: data.contactPhone,
});

export class BusinessService {
  private static async fetchUserWithBusiness(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { business: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async getBusinessOrThrow(userId: string): Promise<Business> {
    const user = await this.fetchUserWithBusiness(userId);

    if (!user.business) {
      throw new AppError('Business not found for user', 404);
    }

    return user.business;
  }

  static async getBusiness(userId: string): Promise<Business> {
    return this.getBusinessOrThrow(userId);
  }

  static async upsertBusinessForUser(userId: string, data: BusinessInput): Promise<Business> {
    const user = await this.fetchUserWithBusiness(userId);

    if (user.business) {
      return prisma.business.update({
        where: { id: user.business.id },
        data: mapBusinessData(data),
      });
    }

    if (!data.name) {
      throw new AppError('Business name is required to create a business', 400);
    }

    return prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          ...mapBusinessData(data),
          name: data.name as string,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { businessId: business.id },
      });

      return business;
    });
  }
}
