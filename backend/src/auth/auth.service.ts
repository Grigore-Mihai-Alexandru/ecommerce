import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt'
import { AuthInputDto } from './dto/auth-input.dto';
import { AuthResultDto } from './dto/auth-result.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from '@prisma/client';

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

    async validateUser(input: AuthInputDto): Promise<Partial<User> | null> {
        const user = await this.usersService.finduserByEmail(input.email);
        if (user && user.password && await bcrypt.compare(input.password, user.password) ) {
            const { password, name, createdAt , ...result } = user;
            return result;
        }
        return null;
    }

    async signIn(user: Partial<User>): Promise<AuthResultDto> {
        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = await this.jwtService.signAsync(payload);
        
        // Assuming AuthResultDto has accessToken and user fields, otherwise spread user fields as needed
        return { accessToken, ...user };
    }
    // end of login logic

    async register(user: RegisterUserDto): Promise<RegisterUserDto> {
        const { name, password, email } = user;
        const existingUser = await this.usersService.user(user);
        
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
