import { Body, Controller, Get, Param, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "src/gaurds/Authgaurd.gaurd";
import { MainService } from "./main.service";
import { requestobjectdto } from "src/dto/requestobject.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("main")
export class MainController {
    constructor(
        private readonly mainService: MainService
    ) { }




    @UseGuards(AuthGuard)
    @Get("notifications")
    async getNotifications(
        @Req() req: requestobjectdto,
    ) {
        return this.mainService.getNotifications(req);
    }


    @Get("c/:id")
    async getPostByCategory(
        @Req() req: requestobjectdto,
        @Param("id") id: string
    ) {
        return this.mainService.getPostByCategory(req, id);
    }

    @UseGuards(AuthGuard)
    @Get("ping")
    async ping(
        @Req() req: requestobjectdto,
    ) {
        return this.mainService.ping(req);
    }

    @UseGuards(AuthGuard)
    @Put("markAsRead/:id")
    async markAsRead(
        @Req() req: requestobjectdto,
        @Param("id") id: string
    ) {
        return this.mainService.markSeenNoti(req, id);
    }

    @UseGuards(AuthGuard)
    @Get("user/:id")
    async getUserProfile(
        @Param("id") id: string,
        @Query("type") type: 'posts' | 'details',
    ) {
        return this.mainService.getUserProfile(id, type);
    }

    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Put("changedp")
    async changeDp(
        @Req() req: requestobjectdto,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.mainService.changeDp(req, file);
    }

    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Put("changeCover")
    async changeCover(
        @Req() req: requestobjectdto,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.mainService.changeCover(req, file);
    }


    @UseGuards(AuthGuard)
    @Get("recentlyActiveUsers")
    async getRecentlyActiveUsers(
        @Req() req: requestobjectdto,
    ) {
        return this.mainService.getRecentlyActiveUsers(req);
    }



}