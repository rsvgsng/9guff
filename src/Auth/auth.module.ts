import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { authService } from "./auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Users } from "src/Models/users.model";
import { AuthGuard } from "src/gaurds/Authgaurd.gaurd";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Users',
                schema: Users
            }
        ])
    ],
    controllers: [AuthController],
    providers: [authService],
})
export class AuthModule { }
