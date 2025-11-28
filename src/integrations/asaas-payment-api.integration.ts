import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import logger from '../config/logger';

export interface GenerateQrCodeRequest {
  userId: number;
  amount: number;
  externalId: string;
  description: string;
}

export interface GenerateQrCodeResponse {
  success: boolean;
  qrcode: string;
  qrcodeImage: string;
  transactionId: string;
  asaasQrCodeId: string;
  valor: number;
  error?: string;
}

export interface VerifyPaymentResponse {
  paid: boolean;
  amount?: number;
  paidAt?: string;
  status: string;
  error?: string;
}

export class AsaasPaymentApiIntegration {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.asaasPaymentApi.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Gerar QR Code PIX via Asaas Payment API
   */
  async generateQrCode(
    userId: number,
    amount: number,
    externalId: string,
    description: string
  ): Promise<GenerateQrCodeResponse> {
    try {
      logger.info('Gerando QR Code via Asaas Payment API', { 
        userId, 
        amount, 
        externalId 
      });

      const response = await this.client.post<GenerateQrCodeResponse>(
        '/api/payment/generate-qr',
        {
          userId,
          amount,
          externalId,
          description,
        }
      );

      if (!response.data.success) {
        logger.error('Erro ao gerar QR Code:', response.data);
        throw new Error(response.data.error || 'Erro ao gerar QR Code');
      }

      logger.info('QR Code gerado com sucesso', {
        transactionId: response.data.transactionId,
        asaasQrCodeId: response.data.asaasQrCodeId,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Erro na integração com Asaas Payment API:', {
        message: error.message,
        response: error.response?.data,
      });

      throw new Error(
        error.response?.data?.error || 
        'Erro ao conectar com o serviço de pagamento'
      );
    }
  }

  /**
   * Verificar status do pagamento via Asaas Payment API
   */
  async verifyPayment(externalId: string): Promise<VerifyPaymentResponse> {
    try {
      logger.info('Verificando pagamento via Asaas Payment API', { externalId });

      const response = await this.client.get<VerifyPaymentResponse>(
        `/api/payment/verify/${externalId}`
      );

      logger.info('Status do pagamento verificado', {
        externalId,
        paid: response.data.paid,
        status: response.data.status,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Erro ao verificar pagamento:', {
        message: error.message,
        response: error.response?.data,
      });

      // Retornar resposta padrão em caso de erro
      return {
        paid: false,
        status: 'ERROR',
        error: error.response?.data?.error || 'Erro ao verificar pagamento',
      };
    }
  }

  /**
   * Health check do serviço de pagamento
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data.status === 'ok';
    } catch (error) {
      logger.error('Asaas Payment API indisponível');
      return false;
    }
  }
}

