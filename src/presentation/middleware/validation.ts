import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import type { ZodSchema } from 'zod';
import { PersonRole } from '../../domain/enums/PersonRole.js';

/**
 * Validation middleware factory
 * Validates request body against a Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data',
      });
    }
  };
};

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Person validation schemas
const clientRoleSchema = z.object({
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  preferredPaymentMethod: z.string().optional(),
  creditLimit: z.number().nonnegative().optional(),
});

const supplierRoleSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  taxId: z.string().min(1, 'Tax ID is required'),
  supplyCategories: z.string().optional(),
  paymentTerms: z.string().optional(),
});

const workerRoleSchema = z.object({
  position: z.string().min(1, 'Position is required'),
  hireDate: z.string().or(z.date()),
  hourlyRate: z.number().nonnegative().optional(),
  employmentType: z.string().min(1, 'Employment type is required'),
});

const farmOwnerRoleSchema = z.object({
  farmName: z.string().min(1, 'Farm name is required'),
  farmLocation: z.string().optional(),
  totalArea: z.number().nonnegative().optional(),
  ownershipType: z.string().optional(),
});

const roleDataSchema = z.union([
  clientRoleSchema,
  supplierRoleSchema,
  workerRoleSchema,
  farmOwnerRoleSchema,
]);

const roleAssignmentSchema = z.object({
  type: z.nativeEnum(PersonRole),
  data: roleDataSchema,
});

export const createPersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  phone: z.string().optional(),
  userId: z.string().uuid().optional(),
  roles: z.array(roleAssignmentSchema).min(1, 'At least one role is required'),
});

export const updatePersonSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
});

export const assignRoleSchema = z.object({
  role: z.nativeEnum(PersonRole),
  roleData: roleDataSchema,
});
