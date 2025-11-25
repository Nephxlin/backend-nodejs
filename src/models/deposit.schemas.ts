import { z } from 'zod';
import { validateCPF } from '../utils/cpf';

/**
 * Schema de criação de depósito
 */
export const createDepositSchema = z.object({
  body: z.object({
    amount: z.number().positive('Valor deve ser positivo'),
    cpf: z
      .string()
      .min(11, 'CPF inválido')
      .refine((cpf) => validateCPF(cpf), {
        message: 'CPF inválido',
      }),
    accept_bonus: z.boolean().optional().default(false),
    gateway: z.string().optional().default('asaas'),
  }),
});

/**
 * Schema de verificação de depósito
 */
export const verifyDepositSchema = z.object({
  body: z.object({
    idTransaction: z.string().min(1, 'ID da transação é obrigatório'),
  }),
});

