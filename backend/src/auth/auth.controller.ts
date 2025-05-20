import { Body, Controller, Get, HttpCode, HttpStatus, NotImplementedException, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth-guard';
import { AuthInputDto } from './dto/auth-input.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() input: AuthInputDto) {
        return this.authService.authenticate(input);
    }

    @UseGuards(AuthGuard)
    @Get('me')
    async getUserInfo(@Request() req) {
        console.log(req.user);
        return req.user; // Return the user information from the request object
    }

    @Post('register')
    async register(@Body() input: RegisterUserDto) {
        return this.authService.register(input);
    }

//  !!!! only for testing purposes, remove in production !!!!!
    @Get('all-users')
    async getAllUsers() {
        return this.authService.getAllUsers();
    }
}
