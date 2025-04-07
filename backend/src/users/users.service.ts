import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { User, Prisma } from '@prisma/client';


@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

//  when client calls register, it will call this function to check if the user already exists
    async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput,): Promise<User | null> {
        return await this.prisma.user.findUnique({ 
          where: { email: userWhereUniqueInput.email }, // email is unique in the database
        });
    }

    async finduserByEmail(email: string): Promise<User> {
        const user = await this.prisma.user.findFirst({
            where: { email: email },
        });

        if (!user) {
            throw new UnprocessableEntityException('User not found!');
        }

        return { id: user.id, email:user.email, name: user.name, password: user.password };
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        return await this.prisma.user.create({
            data: data,
        });
    }

    // !!!! only for testing purposes, remove in production !!!!!
    async getAllUsers(): Promise<User[]> {
        return await this.prisma.user.findMany();
    }

}