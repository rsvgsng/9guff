import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from "express";
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/storage/:id")
  fetchImage(
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.appService.fetchImage(id, res);
  }

  @Get("/storage/dp/:id")
  fetchDPImage(
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.appService.fetchDPImage(id, res);
  }

  @Get("/storage/cp/:id")
  fetchCoverImage(
    @Param("id") id: string,
    @Res() res: Response
  ) {
    return this.appService.fetchCoverImage(id, res);
  }
}
