import { z } from 'zod';

// ============================================
// USERS
// ============================================

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
    lastName: z.string().optional(),
    email: z.string().email('Email inválido').optional(),
    phone: z.string().optional(),
    banned: z.boolean().optional(),
    isAdmin: z.boolean().optional(),
  }),
});

export const adjustWalletSchema = z.object({
  body: z.object({
    amount: z.number(),
    type: z.enum(['add', 'subtract']),
    description: z.string().optional(),
  }),
});

// ============================================
// DEPOSITS
// ============================================

export const updateDepositStatusSchema = z.object({
  body: z.object({
    status: z.number().min(0).max(2), // 0 = pending, 1 = approved, 2 = rejected
  }),
});

// ============================================
// WITHDRAWALS
// ============================================

export const updateWithdrawalStatusSchema = z.object({
  body: z.object({
    status: z.number().min(0).max(2), // 0 = pending, 1 = approved, 2 = rejected
    proof: z.string().optional(),
  }),
});

// ============================================
// GAMES
// ============================================

export const createGameSchema = z.object({
  body: z.object({
    providerId: z.number(),
    gameServerUrl: z.string().optional(),
    gameId: z.string().optional(),
    gameName: z.string().min(1, 'Nome do jogo é obrigatório'),
    gameCode: z.string().min(1, 'Código do jogo é obrigatório'),
    gameType: z.string().optional(),
    description: z.string().optional(),
    cover: z.string().optional(),
    status: z.number().default(1),
    technology: z.string().optional(),
    hasLobby: z.number().default(0),
    isMobile: z.number().default(0),
    hasFreespins: z.number().default(0),
    hasTables: z.number().default(0),
    onlyDemo: z.number().default(0),
    rtp: z.number().optional(),
    distribution: z.string().optional(),
    isFeatured: z.number().default(0),
    showHome: z.number().default(1),
    categories: z.array(z.number()).optional(),
  }),
});

export const updateGameSchema = z.object({
  body: z.object({
    providerId: z.number().optional(),
    gameServerUrl: z.string().optional(),
    gameId: z.string().optional(),
    gameName: z.string().min(1, 'Nome do jogo é obrigatório').optional(),
    gameCode: z.string().min(1, 'Código do jogo é obrigatório').optional(),
    gameType: z.string().optional(),
    description: z.string().optional(),
    cover: z.string().optional(),
    status: z.number().optional(),
    technology: z.string().optional(),
    hasLobby: z.number().optional(),
    isMobile: z.number().optional(),
    hasFreespins: z.number().optional(),
    hasTables: z.number().optional(),
    onlyDemo: z.number().optional(),
    rtp: z.number().optional(),
    distribution: z.string().optional(),
    isFeatured: z.number().optional(),
    showHome: z.number().optional(),
    categories: z.array(z.number()).optional(),
  }),
});

// ============================================
// PROVIDERS
// ============================================

export const createProviderSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Código é obrigatório'),
    name: z.string().min(1, 'Nome é obrigatório'),
    rtp: z.number().optional(),
    status: z.number().default(1),
    distribution: z.string().optional(),
  }),
});

export const updateProviderSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Código é obrigatório').optional(),
    name: z.string().min(1, 'Nome é obrigatório').optional(),
    rtp: z.number().optional(),
    status: z.number().optional(),
    distribution: z.string().optional(),
  }),
});

// ============================================
// CATEGORIES
// ============================================

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().optional(),
    image: z.string().optional(),
    slug: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome é obrigatório').optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    slug: z.string().optional(),
  }),
});

export const addGamesToCategorySchema = z.object({
  body: z.object({
    gameIds: z.array(z.number().int()).min(1, 'Selecione pelo menos um jogo para adicionar'),
  }),
});

// ============================================
// BANNERS
// ============================================

export const createBannerSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().optional(),
    image: z.string().min(1, 'Imagem é obrigatória'),
    link: z.string().optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateBannerSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Título é obrigatório').optional(),
    description: z.string().optional(),
    image: z.string().min(1, 'Imagem é obrigatória').optional(),
    link: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ============================================
// MISSIONS
// ============================================

export const createMissionSchema = z.object({
  body: z.object({
    challengeName: z.string().min(1, 'Nome do desafio é obrigatório'),
    challengeDescription: z.string().optional(),
    challengeRules: z.string().optional(),
    challengeType: z.string().min(1, 'Tipo do desafio é obrigatório'),
    challengeLink: z.string().optional(),
    challengeStartDate: z.string().or(z.date()),
    challengeEndDate: z.string().or(z.date()),
    challengeBonus: z.number(),
    challengeTotal: z.number(),
    influencerWinLength: z.number().optional(),
    influencerLoseLength: z.number().optional(),
    challengeCurrency: z.string().default('BRL'),
    challengeProvider: z.string().optional(),
    challengeGameid: z.string().optional(),
  }),
});

export const updateMissionSchema = z.object({
  body: z.object({
    challengeName: z.string().min(1, 'Nome do desafio é obrigatório').optional(),
    challengeDescription: z.string().optional(),
    challengeRules: z.string().optional(),
    challengeType: z.string().min(1, 'Tipo do desafio é obrigatório').optional(),
    challengeLink: z.string().optional(),
    challengeStartDate: z.string().or(z.date()).optional(),
    challengeEndDate: z.string().or(z.date()).optional(),
    challengeBonus: z.number().optional(),
    challengeTotal: z.number().optional(),
    influencerWinLength: z.number().optional(),
    influencerLoseLength: z.number().optional(),
    challengeCurrency: z.string().optional(),
    challengeProvider: z.string().optional(),
    challengeGameid: z.string().optional(),
  }),
});

// ============================================
// VIP
// ============================================

export const createVipSchema = z.object({
  body: z.object({
    level: z.number(),
    name: z.string().min(1, 'Nome é obrigatório'),
    minPoints: z.number(),
    maxPoints: z.number(),
    benefits: z.string().optional(),
  }),
});

export const updateVipSchema = z.object({
  body: z.object({
    level: z.number().optional(),
    name: z.string().min(1, 'Nome é obrigatório').optional(),
    minPoints: z.number().optional(),
    maxPoints: z.number().optional(),
    benefits: z.string().optional(),
  }),
});

// ============================================
// SETTINGS
// ============================================

export const updateSettingsSchema = z.object({
  body: z.object({
    softwareName: z.string().optional(),
    softwareDescription: z.string().optional(),
    softwareLogo: z.string().nullable().optional(),
    softwareFavicon: z.string().nullable().optional(),
    currencyCode: z.string().optional(),
    prefix: z.string().optional(),
    minDeposit: z.number().optional(),
    maxDeposit: z.number().optional(),
    minWithdrawal: z.number().optional(),
    maxWithdrawal: z.number().optional(),
    depositBonus: z.number().optional(),
    depositBonusRollover: z.number().optional(),
    depositBonusFirstOnly: z.boolean().optional(),
    rolloverProtection: z.boolean().optional(),
    disableSpin: z.boolean().optional(),
    asaasIsEnable: z.boolean().optional(),
    affiliateBaseline: z.union([z.number(), z.string().transform(Number)]).optional(),
    signupBonus: z.number().optional(),
    referralBonus: z.number().optional(),
  }),
});

// ============================================
// GATEWAYS
// ============================================

export const createGatewaySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    code: z.string().min(1, 'Código é obrigatório'),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    apiUrl: z.string().optional(),
    walletId: z.string().optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateGatewaySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Nome é obrigatório').optional(),
    code: z.string().min(1, 'Código é obrigatório').optional(),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    apiUrl: z.string().optional(),
    walletId: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ============================================
// GAMES KEYS
// ============================================

export const updateGamesKeysSchema = z.object({
  body: z.object({
    apiEndpoint: z.string().nullish(),
    agentCode: z.string().nullish(),
    agentToken: z.string().nullish(),
    salsa: z.string().nullish(),
    salsaSecretKey: z.string().nullish(),
    vibra: z.string().nullish(),
    vibraPlayerPrefix: z.string().nullish(),
    evergame: z.string().nullish(),
    worldslot: z.string().nullish(),
    worldslotSecretKey: z.string().nullish(),
    games2: z.string().nullish(),
    games2SecretKey: z.string().nullish(),
    venix: z.string().nullish(),
    venixSecretKey: z.string().nullish(),
    playgaming: z.string().nullish(),
    playgamingMerchant: z.string().nullish(),
    pgsoft: z.string().nullish(),
    pgsoftGameUrl: z.string().nullish(),
    pgsoftSecretKey: z.string().nullish(),
  }),
});
