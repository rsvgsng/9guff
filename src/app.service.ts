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

  fetchDPImage(
    id: string,
    res: Response
  ) {
    const profilePicturesFolder = path?.join(__dirname, '..', 'Uploads/dp/');
    let username = id;

    fs.readdir(profilePicturesFolder, (err, files) => {
      if (err) {
        return res.status(500).send('Error reading directory');
      }
      const file = files.find(filename => filename.startsWith(`${username}.`));
      if (!file) {
        return res.sendFile(path.join(profilePicturesFolder, 'default.png'));
      }
      const filePath = path.join(profilePicturesFolder, file);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return res.status(500).send('Error reading file');
        }
        const extension = path.extname(filePath).substring(1); // Get extension without the dot
        res.set('Content-Type', `image/${extension}`);
        res.send(data);
      });
    });
  }
}