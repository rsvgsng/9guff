import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/gaurds/Authgaurd.gaurd";
import { MainService } from "./main.service";
import { requestobjectdto } from "src/dto/requestobject.dto";

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


}