import { Module, Post } from "@nestjs/common";
import { PostController } from "./post.controller";
import { postService } from "./post.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Posts } from "src/Models/post.model";
import { Users } from "src/Models/users.model";
import { Notifications } from "src/Models/notifications.model";

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: "Posts",
                    schema: Posts
                },
                {
                    name: "Users",
                    schema: Users
                },
                {
                    name: 'Notifications',
                    schema: Notifications
                }
            ]
        )
    ],
    controllers: [PostController],
    providers: [postService],
    exports: []
})
export class postModule { }