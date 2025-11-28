import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/env';

export class UploadService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Criar pasta uploads se não existir
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Criar subpastas
    const subfolders = ['banners', 'games', 'categories', 'profiles'];
    subfolders.forEach((folder) => {
      const folderPath = path.join(this.uploadDir, folder);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    });
  }

  /**
   * Upload de imagem em base64
   */
  async uploadBase64Image(
    base64Data: string,
    folder: string = 'banners'
  ): Promise<string> {
    try {
      // Remover prefixo data:image/...;base64,
      const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Image, 'base64');

      // Gerar nome único
      const filename = `${crypto.randomBytes(16).toString('hex')}.png`;
      const filepath = path.join(this.uploadDir, folder, filename);

      // Salvar arquivo
      fs.writeFileSync(filepath, buffer);

      // Retornar URL completa
      const relativePath = `${folder}/${filename}`;
      return `${config.appUrl}/uploads/${relativePath}`;
    } catch (error: any) {
      throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
    }
  }

  /**
   * Deletar imagem
   */
  async deleteImage(imagePathOrUrl: string): Promise<void> {
    try {
      // Se for uma URL completa, extrair apenas o caminho relativo
      let relativePath = imagePathOrUrl;
      if (imagePathOrUrl.includes('/uploads/')) {
        relativePath = imagePathOrUrl.split('/uploads/')[1];
      }
      
      const fullPath = path.join(this.uploadDir, relativePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error: any) {
      console.error(`Erro ao deletar imagem: ${error.message}`);
    }
  }

  /**
   * Upload de múltiplas imagens
   */
  async uploadMultipleImages(
    images: string[],
    folder: string = 'banners'
  ): Promise<string[]> {
    const uploadPromises = images.map((img) =>
      this.uploadBase64Image(img, folder)
    );
    return await Promise.all(uploadPromises);
  }
}

