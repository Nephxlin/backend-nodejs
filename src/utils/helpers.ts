import crypto from 'crypto';

/**
 * Gera um código único (para inviter_code, etc)
 */
export function generateUniqueCode(length: number = 8): string {
  return crypto.randomBytes(length).toString('hex').substring(0, length).toUpperCase();
}

/**
 * Gera um token aleatório
 */
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Cria um token codificado em base64
 */
export function makeToken(data: any): string {
  const json = JSON.stringify(data);
  return Buffer.from(json).toString('base64');
}

/**
 * Decodifica um token em base64
 */
export function decodeToken(token: string): any {
  try {
    const json = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

/**
 * Calcula a porcentagem
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Formata valor monetário
 */
export function formatCurrency(value: number, symbol: string = 'R$'): string {
  return `${symbol} ${value.toFixed(2).replace('.', ',')}`;
}

/**
 * Gera nome a partir do email
 */
export function generateNameFromEmail(email: string): string {
  const emailName = email.split('@')[0];
  return emailName.charAt(0).toUpperCase() + emailName.slice(1);
}

/**
 * Sanitiza string para slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

