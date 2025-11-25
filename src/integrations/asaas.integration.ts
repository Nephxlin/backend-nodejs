import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import logger from '../config/logger';

export interface AsaasPaymentData {
  userId: number;
  amount: number;
  externalId: string;
  description: string;
}

export interface AsaasPaymentResponse {
  success: boolean;
  qrcode?: {
    payload: string;
    encodedImage: string;
    expirationDate: string;
  };
  paymentId?: string;
  message?: string;
}

export class AsaasIntegration {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.asaas.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        access_token: config.asaas.apiKey,
      },
    });
  }

  /**
   * Gerar QR Code PIX
   */
  async generatePixQrCode(data: AsaasPaymentData): Promise<AsaasPaymentResponse> {
    try {
      logger.info('Gerando QR Code PIX via Asaas', { externalId: data.externalId });

      const response = await this.client.post('/payments', {
        customer: config.asaas.walletId,
        billingType: 'PIX',
        value: data.amount,
        dueDate: this.getNextDay(),
        externalReference: data.externalId,
        description: data.description,
        postalService: false,
      });

      if (response.data && response.data.id) {
        const paymentId = response.data.id;

        // Gerar QR Code PIX
        const qrCodeResponse = await this.client.get(`/payments/${paymentId}/pixQrCode`);

        if (qrCodeResponse.data) {
          return {
            success: true,
            qrcode: {
              payload: qrCodeResponse.data.payload,
              encodedImage: qrCodeResponse.data.encodedImage,
              expirationDate: qrCodeResponse.data.expirationDate,
            },
            paymentId,
          };
        }
      }

      logger.error('Erro ao gerar QR Code Asaas', response.data);
      return {
        success: false,
        message: 'Erro ao gerar QR Code',
      };
    } catch (error: any) {
      logger.error('Erro na integração Asaas:', {
        message: error.message,
        response: error.response?.data,
      });

      return {
        success: false,
        message: 'Erro ao conectar com gateway de pagamento',
      };
    }
  }

  /**
   * Verificar status do pagamento
   */
  async verifyPayment(externalId: string): Promise<{ paid: boolean; status: string }> {
    try {
      const response = await this.client.get('/payments', {
        params: {
          externalReference: externalId,
        },
      });

      if (response.data && response.data.data && response.data.data.length > 0) {
        const payment = response.data.data[0];

        return {
          paid: payment.status === 'RECEIVED' || payment.status === 'CONFIRMED',
          status: payment.status,
        };
      }

      return {
        paid: false,
        status: 'PENDING',
      };
    } catch (error: any) {
      logger.error('Erro ao verificar pagamento Asaas:', error.message);

      return {
        paid: false,
        status: 'ERROR',
      };
    }
  }

  /**
   * Webhook para receber notificações de pagamento
   */
  async processWebhook(payload: any): Promise<boolean> {
    try {
      logger.info('Processando webhook Asaas', payload);

      // A Asaas envia o evento de pagamento confirmado
      if (payload.event === 'PAYMENT_RECEIVED' || payload.event === 'PAYMENT_CONFIRMED') {
        const externalReference = payload.payment?.externalReference;

        if (externalReference) {
          return true;
        }
      }

      return false;
    } catch (error: any) {
      logger.error('Erro ao processar webhook Asaas:', error.message);
      return false;
    }
  }

  /**
   * Obter próximo dia (para vencimento)
   */
  private getNextDay(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
}

