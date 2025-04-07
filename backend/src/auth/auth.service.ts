import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt'
import { AuthInputDto } from './dto/auth-input.dto';
import { AuthResultDto } from './dto/auth-result.dto';
import { SignInDataDto } from './dto/sign-in-data.dto';
import { RegisterUserDto } from './dto/register-user.dto';


@Injectable()
export class AuthService {
    constructor(
        private usersService:UsersService,
        private jwtService: JwtService
    ) {}  
    
    //login logic
    async authenticate(input: AuthInputDto): Promise<AuthResultDto> {
        const user = await this.validateUser(input);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        return this.signIn(user);
    }

    async validateUser(input: AuthInputDto): Promise<SignInDataDto | null> {
        const user = await this.usersService.finduserByEmail(input.email);
        if (user && await bcrypt.compare(input.password, user.password) ) {
            const { password, id, ...result } = user;
            return result;
        }
        return null;
    }

    async signIn(user: SignInDataDto): Promise<AuthResultDto> {
        const payload = { email: user.email, sub: user.name };
        const accessToken = await this.jwtService.signAsync(payload);

        return {accessToken, ...user};
    }
    // end of login logic

    async register(user: RegisterUserDto): Promise<RegisterUserDto> {
        const { name, password, email } = user;
        const existingUser = await this.usersService.user(user);
        // console.log(existingUser)
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        return this.usersService.createUser({ name, password:hashedPassword, email });
    }

    // !!!! only for testing purposes, remove in production !!!!!
    async getAllUsers(): Promise<User[]> {
        return this.usersService.getAllUsers();
    }
}
