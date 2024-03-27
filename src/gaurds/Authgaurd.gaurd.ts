import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSchemaDTO } from 'src/Models/users.model';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @InjectModel('Users') private ClientModel: Model<UserSchemaDTO>
    ) { }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        const request = context.switchToHttp().getRequest();
        const headers = request.headers;
        const token = headers?.authorization?.split(' ')[1];
        if (!token) return false
        try {
            let isVerified = jwt.verify(token, "niggaballs69")
            let userName = isVerified['username']
            if (isVerified) {
                let user = await this.ClientModel.findOne({ username: userName })
                if (user.isSuperAdmin) {
                    request.superAdmin = true
                }
                user.lastActive = new Date()
                user.save()
                request.user = (user['username']);
                return true
            }
        } catch (error) {
            return false
        }

    }
}


@Injectable()
export class SuperAuthGarud implements CanActivate {
    constructor(
        @InjectModel('Users') private ClientModel: Model<UserSchemaDTO>
    ) { }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {

        const request = context.switchToHttp().getRequest();
        const headers = request.headers;
        const token = headers?.authorization?.split(' ')[1];
        if (!token) return false
        try {
            let isVerified = jwt.verify(token, "niggaballs69")
            let userName = isVerified['username']
            if (isVerified) {
                let user = await this.ClientModel.findOne({ username: userName })
                if (!user.isSuperAdmin) return false
                user.lastActive = new Date()
                user.save()
                request.user = (user['username']);
                request.superAdmin = true
                return true
            }
        } catch (error) {
            return false
        }

    }
}




