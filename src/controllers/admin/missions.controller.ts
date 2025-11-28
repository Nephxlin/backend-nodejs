import { Request, Response } from 'express';
import { AdminMissionsService } from '../../services/admin/missions.service';
import { successResponse, errorResponse } from '../../utils/response';

const missionsService = new AdminMissionsService();

export class AdminMissionsController {
  async listMissions(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await missionsService.listMissions(page, limit);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getMission(req: Request, res: Response): Promise<Response> {
    try {
      const missionId = parseInt(req.params.id);
      const result = await missionsService.getMission(missionId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
    }
  }

  async createMission(req: Request, res: Response): Promise<Response> {
    try {
      const result = await missionsService.createMission(req.body);
      return successResponse(res, result, 'Missão criada com sucesso', 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async updateMission(req: Request, res: Response): Promise<Response> {
    try {
      const missionId = parseInt(req.params.id);
      const result = await missionsService.updateMission(missionId, req.body);
      return successResponse(res, result, 'Missão atualizada com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }

  async deleteMission(req: Request, res: Response): Promise<Response> {
    try {
      const missionId = parseInt(req.params.id);
      const result = await missionsService.deleteMission(missionId);
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  }
}

