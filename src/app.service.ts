import { Injectable, NotFoundException } from '@nestjs/common';
import { Response } from "express";
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  fetchImage(
    id: string,
    res: Response
  ) {
    const imagePath = path?.join(__dirname, '..', 'Uploads', id);
    try {
      if (!fs.existsSync(imagePath)) {
        throw new NotFoundException('Image not found');
      }
      res.sendFile(imagePath);
    } catch (error) {
      throw new NotFoundException('Image not found');
    }
  }
}