import prisma from '../config/database';
import { AsaasPaymentApiIntegration } from '../integrations/asaas-payment-api.integration';
import { WalletService } from './wallet.service';
import logger from '../config/logger';

const asaasPaymentApiIntegration = new AsaasPaymentApiIntegration();
const walletService = new WalletService();

export class DepositService {
  /**
   * Criar um novo depósito via PIX
   */
  async createPixDeposit(
    userId: number,
    amount: number,
    _cpf: string,
    acceptBonus: boolean = false
  ) {
    // Validar valor mínimo e máximo
    const setting = await this.getSetting();

    if (amount < Number(setting.minDeposit)) {
      throw new Error(`Valor mínimo de depósito é ${setting.prefix}${setting.minDeposit}`);
    }

    if (amount > Number(setting.maxDeposit)) {
      throw new Error(`Valor máximo de depósito é ${setting.prefix}${setting.maxDeposit}`);
    }

    // Gerar ID único
    const externalId = `DEP_${userId}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
    const description = `Depósito - ${setting.prefix} ${amount.toFixed(2)}`;

    // Gerar QR Code via Asaas Payment API (microservice)
    const qrCodeResult = await asaasPaymentApiIntegration.generateQrCode(
      userId,
      amount,
      externalId,
      description
    );

    if (!qrCodeResult.success) {
      throw new Error(qrCodeResult.error || 'Erro ao gerar QR Code');
    }

    // Criar transação no nosso banco
    await this.createTransaction(userId, externalId, amount, acceptBonus);

    // Criar depósito no nosso banco
    await this.createDeposit(userId, externalId, amount);

    return {
      success: true,
      idTransaction: externalId,
      qrcode: qrCodeResult.qrcode,
      qrcodeImage: qrCodeResult.qrcodeImage,
    };
  }

  /**
   * Verificar status do depósito
   */
  async verifyDeposit(userId: number, externalId: string) {
    // Verificar se a transação pertence ao usuário
    const transaction = await prisma.transaction.findFirst({
      where: {
        paymentId: externalId,
        userId,
      },
    });

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    // Se já está confirmada, retornar
    if (transaction.status === 1) {
      return { status: 1, paid: true };
    }

    // Verificar na Asaas Payment API
    const paymentStatus = await asaasPaymentApiIntegration.verifyPayment(externalId);

    if (paymentStatus.paid) {
      // Finalizar pagamento
      await this.finalizePayment(externalId);
      return { status: 1, paid: true };
    }

    return { status: 0, paid: false };
  }

  /**
   * Finalizar pagamento
   */
  async finalizePayment(externalId: string): Promise<boolean> {
    const transaction = await prisma.transaction.findFirst({
      where: {
        paymentId: externalId,
        status: 0,
      },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!transaction || !transaction.user) {
      return false;
    }

    const user = transaction.user;
    const wallet = user.wallet;

    if (!wallet) {
      return false;
    }

    const setting = await this.getSetting();

    try {
      // Verificar se é o primeiro depósito
      const completedTransactions = await prisma.transaction.count({
        where: {
          userId: user.id,
          status: 1,
        },
      });

      const isFirstDeposit = completedTransactions === 0;
      let bonusAmount = 0;

      // Aplicar bônus se for primeiro depósito e accept_bonus = true
      if (isFirstDeposit && transaction.acceptBonus) {
        bonusAmount = (Number(transaction.price) * Number(setting.depositBonus)) / 100;

        await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balanceBonus: {
              increment: bonusAmount,
            },
            balanceBonusRollover: bonusAmount * Number(setting.depositBonusRollover),
          },
        });
      }

      // Rollover de depósito
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balanceDepositRollover:
            Number(transaction.price) * Number(setting.depositBonusRollover),
        },
      });

      // Adicionar saldo principal (jogável)
      await walletService.addBalance(
        user.id,
        Number(transaction.price),
        'balance',
        `Depósito via PIX - ${externalId}`
      );

      // Adicionar saldo disponível para saque
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balanceWithdrawal: {
            increment: Number(transaction.price),
          },
        },
      });

      // Atualizar transação
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 1 },
      });

      // Atualizar depósito
      await prisma.deposit.updateMany({
        where: {
          paymentId: externalId,
          status: 0,
        },
        data: { status: 1 },
      });

      // Processar CPA de afiliado
      await this.processAffiliateCPA(user, Number(transaction.price));

      logger.info('Depósito finalizado com sucesso', {
        userId: user.id,
        amount: transaction.price,
        bonus: bonusAmount,
      });

      return true;
    } catch (error: any) {
      logger.error('Erro ao finalizar pagamento:', error);
      return false;
    }
  }

  /**
   * Listar depósitos do usuário
   */
  async listDeposits(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.deposit.count({
        where: { userId },
      }),
    ]);

    return {
      deposits,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Criar transação
   */
  private async createTransaction(
    userId: number,
    paymentId: string,
    amount: number,
    acceptBonus: boolean
  ) {
    const setting = await this.getSetting();

    await prisma.transaction.create({
      data: {
        paymentId,
        userId,
        paymentMethod: 'pix',
        price: amount,
        currency: setting.currencyCode,
        acceptBonus,
        status: 0,
      },
    });
  }

  /**
   * Criar depósito
   */
  private async createDeposit(userId: number, paymentId: string, amount: number) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new Error('Carteira não encontrada');
    }

    await prisma.deposit.create({
      data: {
        paymentId,
        userId,
        amount,
        type: 'pix',
        currency: wallet.currency,
        symbol: wallet.symbol,
        status: 0,
      },
    });
  }

  /**
   * Processar CPA do afiliado
   */
  private async processAffiliateCPA(user: any, depositAmount: number) {
    if (!user.inviter) {
      return;
    }

    const affHistoryCPA = await prisma.affiliateHistory.findFirst({
      where: {
        userId: user.id,
        commissionType: 'cpa',
        isPaid: false,
      },
    });

    if (!affHistoryCPA) {
      return;
    }

    const sponsor = await prisma.user.findUnique({
      where: { id: user.inviter },
      include: {
        wallet: true,
      },
    });

    if (!sponsor) {
      return;
    }

    const baseline = Number(sponsor.affiliateBaseline);
    const cpaValue = Number(sponsor.affiliateCpa);

    // Verificar se atingiu a baseline
    if (depositAmount >= baseline) {
      // Pagar CPA
      await prisma.wallet.update({
        where: { userId: sponsor.id },
        data: {
          referRewards: {
            increment: cpaValue,
          },
        },
      });

      // Marcar como pago
      await prisma.affiliateHistory.update({
        where: { id: affHistoryCPA.id },
        data: {
          isPaid: true,
          commissionValue: cpaValue,
        },
      });

      logger.info('CPA pago ao afiliado', {
        affiliateId: sponsor.id,
        userId: user.id,
        amount: cpaValue,
      });
    }
  }

  /**
   * Obter configurações do sistema
   */
  private async getSetting() {
    let setting = await prisma.setting.findFirst();

    if (!setting) {
      setting = await prisma.setting.create({
        data: {},
      });
    }

    return setting;
  }
}

