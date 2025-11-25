import { z } from 'zod';

/**
 * Schema de solicitação de saque
 */
export const requestWithdrawalSchema = z.object({
  body: z.object({
    amount: z.number().positive('Valor deve ser positivo'),
    pix_key: z.string().min(1, 'Chave PIX é obrigatória'),
    pix_type: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random'], {
      errorMap: () => ({ message: 'Tipo de chave PIX inválido' }),
    }),
  }),
});

/**
 * Schema de rejeição de saque
 */
export const rejectWithdrawalSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
});

