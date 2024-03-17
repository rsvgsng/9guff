import { Body, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { UserSchema } from "src/Models/users.model";
import { UserDto } from "src/dto/users.dto";
import { SuccessDTO } from "src/dto/response.dto";
import * as jwt from 'jsonwebtoken'
const { verify } = require('hcaptcha');

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
            const userExists = await this.ClientModel.findOne({ username: username.toLowerCase().trim() })
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
        let secret = '0x1A9c0316c55Cf982497F1Be6b275Ed0A654d947d'
        try {
            const { username, pincode, htoken } = user
            if (!htoken) throw new ForbiddenException('Please provide a valid token')
            if (!username || !pincode) throw new ForbiddenException('Please provide a username and pincode')
            if (pincode.length !== 4) throw new ForbiddenException('Pincode must be 4 digits')
            if (username.length < 3) throw new ForbiddenException('Username must be at least 3 characters')
            if (username.length > 10) throw new ForbiddenException('Username must be less than 10 characters')
            if (username === 'admin') throw new ForbiddenException('Username not allowed')
            if (username === 'default') throw new ForbiddenException('Username not allowed')
            if (!/^[a-zA-Z0-9_]*$/.test(username)) throw new ForbiddenException('Username must contain only letters, numbers and underscores')
            let isValid = await verify(secret, htoken)
            if (isValid.success === false) throw new ForbiddenException('Invalid token')
            const userExists = await this.ClientModel.findOne({ username })
            if (userExists) throw new ForbiddenException('Username already exists')
            user.username = username.toLowerCase()
            const newUser = new this.ClientModel(user)
            let totalUsers = await this.ClientModel.countDocuments()
            fetch('https://ntfy.sh/confess24channel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: `
                    New user created: ${username},
                    Pincode: ${pincode},
                    Total users: ${totalUsers + 1},
                `
            })
            await newUser.save()
            return new SuccessDTO('User created successfully')
        } catch (error) {
            console.log(error)
            throw new ForbiddenException(error.message)
        }
    }
}