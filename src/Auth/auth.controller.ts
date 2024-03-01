import { Body, Controller, Put } from "@nestjs/common";
import { UserDto } from "src/dto/users.dto";
import { authService } from "./auth.service";

@Controller("auth")
export class AuthController {
    constructor(
        private authService: authService
    ) { }

    @Put("login")
    async login(
        @Body() body: UserDto
    ) {
        return this.authService.login(body)
    }
    @Put("signup")
    async signup(
        @Body() body: UserDto
    ) {
        return this.authService.signup(body)
    }


}