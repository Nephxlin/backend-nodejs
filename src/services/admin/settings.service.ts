import prisma from '../../config/database';

export class AdminSettingsService {
  /**
   * Obter configurações atuais
   */
  async getSettings() {
    const settings = await prisma.setting.findFirst();

    if (!settings) {
      // Criar configurações padrão se não existir
      return await prisma.setting.create({
        data: {
          currencyCode: 'BRL',
          prefix: 'R$',
          minDeposit: 5,
          maxDeposit: 10000,
          minWithdrawal: 20,
          maxWithdrawal: 5000,
          depositBonus: 0,
          depositBonusRollover: 0,
          rolloverProtection: false,
          disableSpin: false,
          asaasIsEnable: false,
          affiliateBaseline: 0,
        },
      });
    }

    return settings;
  }

  /**
   * Atualizar configurações
   */
  async updateSettings(data: any) {
    let settings = await prisma.setting.findFirst();

    if (!settings) {
      // Criar se não existir
      settings = await prisma.setting.create({
        data: {
          currencyCode: 'BRL',
          prefix: 'R$',
          minDeposit: 5,
          maxDeposit: 10000,
          minWithdrawal: 20,
          maxWithdrawal: 5000,
          depositBonus: 0,
          depositBonusRollover: 0,
          rolloverProtection: false,
          disableSpin: false,
          asaasIsEnable: false,
          affiliateBaseline: 0,
        },
      });
    }

    // Verificar se o rollover foi alterado
    const oldRolloverMultiplier = Number(settings.depositBonusRollover);
    const newRolloverMultiplier = data.depositBonusRollover !== undefined 
      ? Number(data.depositBonusRollover) 
      : oldRolloverMultiplier;

    // Filtrar campos undefined, null ou vazios
    const filteredData = Object.entries(data).reduce((acc: any, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    const updatedSettings = await prisma.setting.update({
      where: { id: settings.id },
      data: filteredData,
    });

    // Se o multiplicador de rollover foi alterado, atualizar todos os usuários
    if (newRolloverMultiplier !== oldRolloverMultiplier) {
      await this.updateAllUsersRollover(oldRolloverMultiplier, newRolloverMultiplier);
    }

    return updatedSettings;
  }

  /**
   * Atualizar rollover de todos os usuários quando o multiplicador muda
   */
  private async updateAllUsersRollover(oldMultiplier: number, newMultiplier: number) {
    console.log(`🔄 Atualizando rollover de usuários: ${oldMultiplier}x → ${newMultiplier}x`);

    // Buscar usuários com rollover pendente
    const walletsWithRollover = await prisma.wallet.findMany({
      where: {
        OR: [
          { balanceBonusRollover: { gt: 0 } },
          { balanceDepositRollover: { gt: 0 } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (walletsWithRollover.length === 0) {
      console.log('✅ Nenhum usuário com rollover pendente');
      return;
    }

    console.log(`📊 Encontrados ${walletsWithRollover.length} usuário(s) com rollover pendente`);

    let updatedCount = 0;

    for (const wallet of walletsWithRollover) {
      const oldBonusRollover = Number(wallet.balanceBonusRollover);
      const oldDepositRollover = Number(wallet.balanceDepositRollover);

      // Calcular novos valores de rollover baseado na proporção
      let newBonusRollover = oldBonusRollover;
      let newDepositRollover = oldDepositRollover;

      // Se tinha rollover e o multiplicador mudou, recalcular proporcionalmente
      if (oldBonusRollover > 0 && oldMultiplier > 0) {
        // Encontrar o valor base do bônus (rollover / multiplicador antigo)
        const bonusBase = oldBonusRollover / oldMultiplier;
        // Aplicar novo multiplicador
        newBonusRollover = bonusBase * newMultiplier;
      }

      if (oldDepositRollover > 0 && oldMultiplier > 0) {
        // Encontrar o valor base do depósito (rollover / multiplicador antigo)
        const depositBase = oldDepositRollover / oldMultiplier;
        // Aplicar novo multiplicador
        newDepositRollover = depositBase * newMultiplier;
      }

      // Atualizar apenas se houve mudança
      if (newBonusRollover !== oldBonusRollover || newDepositRollover !== oldDepositRollover) {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balanceBonusRollover: newBonusRollover,
            balanceDepositRollover: newDepositRollover,
          },
        });

        console.log(`   ✅ ${wallet.user.name}: Bônus ${oldBonusRollover.toFixed(2)} → ${newBonusRollover.toFixed(2)}, Depósito ${oldDepositRollover.toFixed(2)} → ${newDepositRollover.toFixed(2)}`);
        updatedCount++;
      }
    }

    console.log(`🎉 ${updatedCount} usuário(s) atualizados com sucesso!`);
  }

  /**
   * Obter chaves de jogos
   */
  async getGamesKeys() {
    const gamesKeys = await prisma.gamesKey.findFirst();

    if (!gamesKeys) {
      // Criar registro padrão se não existir
      return await prisma.gamesKey.create({
        data: {},
      });
    }

    return gamesKeys;
  }

  /**
   * Atualizar chaves de jogos
   */
  async updateGamesKeys(data: any) {
    let gamesKeys = await prisma.gamesKey.findFirst();

    if (!gamesKeys) {
      gamesKeys = await prisma.gamesKey.create({
        data: {},
      });
    }

    // Filtrar campos undefined, null ou vazios
    const filteredData = Object.entries(data).reduce((acc: any, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    const updatedKeys = await prisma.gamesKey.update({
      where: { id: gamesKeys.id },
      data: filteredData,
    });

    return updatedKeys;
  }

  /**
   * Listar gateways
   */
  async listGateways() {
    return await prisma.gateway.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Criar gateway
   */
  async createGateway(data: any) {
    return await prisma.gateway.create({
      data,
    });
  }

  /**
   * Atualizar gateway
   */
  async updateGateway(gatewayId: number, data: any) {
    const gateway = await prisma.gateway.findUnique({
      where: { id: gatewayId },
    });

    if (!gateway) {
      throw new Error('Gateway não encontrado');
    }

    return await prisma.gateway.update({
      where: { id: gatewayId },
      data,
    });
  }

  /**
   * Deletar gateway
   */
  async deleteGateway(gatewayId: number) {
    const gateway = await prisma.gateway.findUnique({
      where: { id: gatewayId },
    });

    if (!gateway) {
      throw new Error('Gateway não encontrado');
    }

    await prisma.gateway.delete({
      where: { id: gatewayId },
    });

    return { success: true, message: 'Gateway deletado com sucesso' };
  }
}

