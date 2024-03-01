import { Body, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { UserSchema } from "src/Models/users.model";
import { UserDto } from "src/dto/users.dto";
import { SuccessDTO } from "src/dto/response.dto";
import * as jwt from 'jsonwebtoken'

@Injectable()
export class authService {
    constructor(
        @InjectModel('Users') private ClientModel: Model<UserSchema>
    ) { }

    async login(
        user: UserDto
    ): Promise<SuccessDTO | UnauthorizedException> {
        try {
            const { username, pincode } = user
            if (!username || !pincode) throw new UnauthorizedException('Please provide a username and pincode')
            const userExists = await this.ClientModel.findOne({ username })
            if (!userExists) throw new UnauthorizedException('Invalid  username or pincode')
            if (userExists.pincode !== pincode) throw new UnauthorizedException('Invalid username or pincode')
            let token = jwt.sign({
                username: userExists.username,
                id: userExists._id,
            }, "niggaballs69")
            return new SuccessDTO('Login successful', {
                token: token,
            })
        } catch (error) {
            throw new UnauthorizedException(error.message)
        }
    }

    async signup(
        user: UserDto
    ): Promise<SuccessDTO | ForbiddenException> {
        try {
            const { username, pincode } = user
            if (!username || !pincode) throw new ForbiddenException('Please provide a username and pincode')
            if (pincode.length !== 4) throw new ForbiddenException('Pincode must be 4 digits')
            if (username.length < 3) throw new ForbiddenException('Username must be at least 3 characters')
            if (username.length > 20) throw new ForbiddenException('Username must be less than 20 characters')
            const userExists = await this.ClientModel.findOne({ username })
            if (userExists) throw new ForbiddenException('Username already exists')
            const newUser = new this.ClientModel(user)
            await newUser.save()
            return new SuccessDTO('User created successfully')
        } catch (error) {
            throw new ForbiddenException(error.message)
        }

    }


}