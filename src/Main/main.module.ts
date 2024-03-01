import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import exp from "constants";
import { Notifications } from "src/Models/notifications.model";
import { MainController } from "./main.controller";
import { MainService } from "./main.service";
import { Users } from "src/Models/users.model";
import { Posts } from "src/Models/post.model";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Notifications',
                schema: Notifications
            },
            {
                name: 'Users',
                schema: Users
            },
            {
                name: 'Posts',
                schema: Posts
            }
        ])
    ],
    controllers: [MainController],
    providers: [MainService],


})
export class MainModule { }