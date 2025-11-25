/**
 * Valida um CPF brasileiro
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) {
    checkDigit = 0;
  }
  if (checkDigit !== parseInt(cpf.charAt(9))) {
    return false;
  }

  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) {
    checkDigit = 0;
  }
  if (checkDigit !== parseInt(cpf.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Formata um CPF
 */
export function formatCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

