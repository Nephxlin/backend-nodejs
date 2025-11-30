import { Request, Response } from 'express';
import axios from 'axios';
import prisma from '../../config/database';
import logger from '../../config/logger';
import { config } from '../../config/env';

export class AdminPGSoftAgentsController {
  /**
   * Listar todos os agents do motor PGSoft
   * GET /api/admin/pgsoft/agents
   */
  async listAgents(_req: Request, res: Response): Promise<Response> {
    try {
      // Buscar URL da API PGSoft das configurações
      const gamesKeys = await prisma.gamesKey.findFirst();

      // Prioriza variável de ambiente (útil para desenvolvimento)
      const pgsoftUrl = config.pgsoft.apiUrl || gamesKeys?.pgsoft;

      if (!pgsoftUrl) {
        return res.status(400).json({
          error: 'URL da API PGSoft não configurada',
          message: 'Configure a URL da API PGSoft nas configurações de jogos ou defina PGSOFT_API_URL no .env'
        });
      }

      // Fazer request para API PGSoft
      const response = await axios.get(`${pgsoftUrl}/api/v1/agents`, {
        timeout: 10000
      });

      logger.info('[PGSOFT AGENTS] Lista de agents obtida com sucesso');

      return res.json(response.data);
    } catch (error: any) {
      logger.error('[PGSOFT AGENTS] Erro ao listar agents:', error);
      
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'API PGSoft indisponível',
          message: 'Não foi possível conectar com a API PGSoft. Verifique se está rodando.'
        });
      }

      return res.status(500).json({
        error: 'Erro ao listar agents',
        message: error.message
      });
    }
  }

  /**
   * Buscar agent por ID
   * GET /api/admin/pgsoft/agents/:id
   */
  async getAgent(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const gamesKeys = await prisma.gamesKey.findFirst();

      if (!gamesKeys || !gamesKeys.pgsoft) {
        return res.status(400).json({
          error: 'URL da API PGSoft não configurada'
        });
      }

      const response = await axios.get(`${gamesKeys.pgsoft}/api/v1/agents/${id}`, {
        timeout: 10000
      });

      return res.json(response.data);
    } catch (error: any) {
      logger.error('[PGSOFT AGENTS] Erro ao buscar agent:', error);

      if (error.response?.status === 404) {
        return res.status(404).json({
          error: 'Agent não encontrado'
        });
      }

      return res.status(500).json({
        error: 'Erro ao buscar agent',
        message: error.message
      });
    }
  }

  /**
   * Criar novo agent
   * POST /api/admin/pgsoft/agents
   */
  async createAgent(req: Request, res: Response): Promise<Response> {
    try {
      const gamesKeys = await prisma.gamesKey.findFirst();

      const pgsoftUrl = config.pgsoft.apiUrl || gamesKeys?.pgsoft;

      if (!pgsoftUrl) {
        return res.status(400).json({
          error: 'URL da API PGSoft não configurada'
        });
      }

      // Se callbackurl não for fornecida, usar apiEndpoint
      if (!req.body.callbackurl && gamesKeys?.apiEndpoint) {
        req.body.callbackurl = gamesKeys.apiEndpoint.endsWith('/')
          ? `${gamesKeys.apiEndpoint}api/`
          : `${gamesKeys.apiEndpoint}/api/`;
      }

      const response = await axios.post(
        `${pgsoftUrl}/api/v1/agents`,
        req.body,
        { timeout: 10000 }
      );

      logger.info('[PGSOFT AGENTS] Agent criado com sucesso:', req.body.agentcode);

      return res.status(201).json(response.data);
    } catch (error: any) {
      logger.error('[PGSOFT AGENTS] Erro ao criar agent:', error);

      if (error.response?.data) {
        return res.status(error.response.status).json(error.response.data);
      }

      return res.status(500).json({
        error: 'Erro ao criar agent',
        message: error.message
      });
    }
  }

  /**
   * Atualizar agent
   * PUT /api/admin/pgsoft/agents/:id
   */
  async updateAgent(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const gamesKeys = await prisma.gamesKey.findFirst();

      const pgsoftUrl = config.pgsoft.apiUrl || gamesKeys?.pgsoft;

      if (!pgsoftUrl) {
        return res.status(400).json({
          error: 'URL da API PGSoft não configurada'
        });
      }

      logger.info(`[PGSOFT AGENTS] Atualizando agent ${id} em: ${pgsoftUrl}`);

      const response = await axios.put(
        `${pgsoftUrl}/api/v1/agents/${id}`,
        req.body,
        { timeout: 10000 }
      );

      logger.info('[PGSOFT AGENTS] Agent atualizado com sucesso:', id);

      return res.json(response.data);
    } catch (error: any) {
      logger.error('[PGSOFT AGENTS] Erro ao atualizar agent:', error);

      if (error.response?.data) {
        return res.status(error.response.status).json(error.response.data);
      }

      return res.status(500).json({
        error: 'Erro ao atualizar agent',
        message: error.message
      });
    }
  }

  /**
   * Deletar agent
   * DELETE /api/admin/pgsoft/agents/:id
   */
  async deleteAgent(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const gamesKeys = await prisma.gamesKey.findFirst();

      const pgsoftUrl = config.pgsoft.apiUrl || gamesKeys?.pgsoft;

      if (!pgsoftUrl) {
        return res.status(400).json({
          error: 'URL da API PGSoft não configurada'
        });
      }

      const response = await axios.delete(
        `${pgsoftUrl}/api/v1/agents/${id}`,
        { timeout: 10000 }
      );

      logger.info('[PGSOFT AGENTS] Agent deletado com sucesso:', id);

      return res.json(response.data);
    } catch (error: any) {
      logger.error('[PGSOFT AGENTS] Erro ao deletar agent:', error);

      if (error.response?.data) {
        return res.status(error.response.status).json(error.response.data);
      }

      return res.status(500).json({
        error: 'Erro ao deletar agent',
        message: error.message
      });
    }
  }
}

