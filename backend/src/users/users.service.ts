import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

//  when client calls register, it will call this function to check if the user already exists
    async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput,): Promise<Partial<User> | null> {
        return await this.prisma.user.findUnique({
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
            },
            where: { email: userWhereUniqueInput.email }, // email is unique in the database
        });
    }

    async finduserByEmail(email: string): Promise<Partial<User>> {
        const user = await this.prisma.user.findFirst({
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
            },
            where: { email: email },
        });

        if (!user) {
            throw new UnprocessableEntityException('User not found!');
        }

        return user;
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