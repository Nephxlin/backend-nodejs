import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { generateUniqueCode, generateNameFromEmail } from '../utils/helpers';
import { validateCPF } from '../utils/cpf';
import { config } from '../config/env';

interface RegisterData {
  cpf: string;
  phone: string;
  email: string;
  password: string;
  name?: string;
  referenceCode?: string;
  spinToken?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Registrar novo usuário
   */
  async register(data: RegisterData) {
    // Validar CPF
    if (!validateCPF(data.cpf)) {
      throw new Error('CPF inválido');
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Verificar se CPF já existe
    const existingCpf = await prisma.user.findUnique({
      where: { cpf: data.cpf.replace(/[^\d]/g, '') },
    });

    if (existingCpf) {
      throw new Error('CPF já cadastrado');
    }

    // Gerar nome se não fornecido
    const name = data.name || generateNameFromEmail(data.email);

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Gerar código de convite único
    let inviterCode = generateUniqueCode(8);
    let codeExists = true;

    while (codeExists) {
      const existingCode = await prisma.user.findUnique({
        where: { inviterCode },
      });
      if (!existingCode) {
        codeExists = false;
      } else {
        inviterCode = generateUniqueCode(8);
      }
    }

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        cpf: data.cpf.replace(/[^\d]/g, ''),
        phone: data.phone,
        email: data.email,
        password: hashedPassword,
        inviterCode,
        language: 'pt',
      },
    });

    // Processar código de referência (afiliado)
    if (data.referenceCode) {
      const affiliate = await prisma.user.findUnique({
        where: { inviterCode: data.referenceCode },
      });

      if (affiliate) {
        await prisma.user.update({
          where: { id: user.id },
          data: { inviter: affiliate.id },
        });

        // Salvar histórico de afiliado
        await this.saveAffiliateHistory(user.id, affiliate);
      }
    }

    // Criar carteira
    await this.createWallet(user.id);

    // Processar spin token (se houver)
    if (data.spinToken) {
      await this.processSpinToken(user.id, data.spinToken);
    }

    // Gerar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    // Buscar usuário completo com wallet
    const userWithWallet = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        wallet: true,
      },
    });

    return {
      accessToken: token,
      tokenType: 'bearer',
      expiresIn: config.jwtExpiresIn,
      user: this.sanitizeUser(userWithWallet!),
    };
  }

  /**
   * Login de usuário
   */
  async login(data: LoginData) {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar se está banido
    if (user.banned) {
      throw new Error('Usuário banido');
    }

    // Atualizar logged_in
    await prisma.user.update({
      where: { id: user.id },
      data: { loggedIn: true },
    });

    // Gerar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    return {
      accessToken: token,
      tokenType: 'bearer',
      expiresIn: config.jwtExpiresIn,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Logout
   */
  async logout(userId: number) {
    await prisma.user.update({
      where: { id: userId },
      data: { loggedIn: false },
    });

    return { message: 'Logout realizado com sucesso' };
  }

  /**
   * Obter usuário autenticado
   */
  async me(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Verificar se usuário está autenticado
   */
  async verify(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Solicitar reset de senha
   */
  async submitForgetPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Email não encontrado');
    }

    // Gerar token
    const token = generateUniqueCode(32);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Expira em 5 minutos

    // Deletar tokens antigos
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Criar novo token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // TODO: Enviar email com o link de reset
    // const resetLink = `${config.frontendUrl}/reset-password/${token}`;

    return {
      message: 'Link de recuperação enviado para o email',
      token, // Apenas para desenvolvimento
    };
  }

  /**
   * Resetar senha
   */
  async submitResetPassword(email: string, token: string, password: string) {
    // Buscar token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        token,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      throw new Error('Token inválido ou expirado');
    }

    // Atualizar senha
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Deletar token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Criar carteira para o usuário
   */
  private async createWallet(userId: number) {
    const setting = await this.getSetting();

    await prisma.wallet.create({
      data: {
        userId,
        currency: setting.currencyCode,
        symbol: setting.prefix,
        active: true,
      },
    });
  }

  /**
   * Salvar histórico de afiliado
   */
  private async saveAffiliateHistory(userId: number, affiliate: any) {
    // Revenue Share
    if (affiliate.affiliateRevenueShare > 0) {
      await prisma.affiliateHistory.create({
        data: {
          userId,
          affiliateId: affiliate.id,
          commissionType: 'revshare',
          commissionValue: affiliate.affiliateRevenueShare,
        },
      });
    }

    // CPA (Cost Per Acquisition)
    if (affiliate.affiliateCpa > 0) {
      await prisma.affiliateHistory.create({
        data: {
          userId,
          affiliateId: affiliate.id,
          commissionType: 'cpa',
          commissionValue: affiliate.affiliateCpa,
        },
      });
    }
  }

  /**
   * Processar token do spin
   */
  private async processSpinToken(userId: number, spinToken: string) {
    try {
      const decoded = Buffer.from(spinToken, 'base64').toString('utf-8');
      const obj = JSON.parse(decoded);

      const spinRun = await prisma.spinRun.findFirst({
        where: {
          key: obj.signature,
          nonce: obj.nonce,
          claimed: false,
        },
      });

      if (spinRun && spinRun.prize) {
        const prizeData = JSON.parse(spinRun.prize);
        const value = prizeData.value || 0;

        // Adicionar bônus à carteira
        await prisma.wallet.update({
          where: { userId },
          data: {
            balanceBonus: {
              increment: value,
            },
          },
        });

        // Marcar spin como usado
        await prisma.spinRun.update({
          where: { id: spinRun.id },
          data: { claimed: true },
        });
      }
    } catch (error) {
      // Ignora erros no spin token
      console.error('Erro ao processar spin token:', error);
    }
  }

  /**
   * Obter configurações do sistema
   */
  private async getSetting() {
    let setting = await prisma.setting.findFirst();

    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          currencyCode: config.currencyCode,
          prefix: config.currencySymbol,
        },
      });
    }

    return setting;
  }

  /**
   * Remove dados sensíveis do usuário
   */
  private sanitizeUser(user: any) {
    const { password, rememberToken, ...sanitized } = user;
    
    // Calcular total_balance se houver wallet
    if (sanitized.wallet) {
      sanitized.wallet.totalBalance = 
        Number(sanitized.wallet.balance) + 
        Number(sanitized.wallet.balanceBonus) + 
        Number(sanitized.wallet.balanceWithdrawal);
      
      sanitized.wallet.totalBalanceWithoutBonus = 
        Number(sanitized.wallet.balance) + 
        Number(sanitized.wallet.balanceWithdrawal);
    }

    return sanitized;
  }
}

