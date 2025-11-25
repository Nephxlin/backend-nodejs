import { z } from 'zod';
import { validateCPF } from '../utils/cpf';

/**
 * Schema de registro
 */
export const registerSchema = z.object({
  body: z.object({
    cpf: z
      .string()
      .min(11, 'CPF deve ter 11 dígitos')
      .refine((cpf) => validateCPF(cpf), {
        message: 'CPF inválido',
      }),
    phone: z.string().min(10, 'Telefone inválido'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    name: z.string().optional(),
    referenceCode: z.string().optional(),
    spinToken: z.string().optional(),
    term_a: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos de uso',
    }),
  }),
});

/**
 * Schema de login
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
  }),
});

/**
 * Schema de esqueci minha senha
 */
export const forgetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
  }),
});

/**
 * Schema de reset de senha
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    token: z.string().min(1, 'Token é obrigatório'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    password_confirmation: z.string(),
  }).refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation'],
  }),
});

