import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authorizationHeader = request.headers.authorization; // Bearer <token>
        const token = authorizationHeader && authorizationHeader.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException; // No token provided
        }

        try {
            const tokenPayload = await this.jwtService.verifyAsync(token); // Verify the token
            // console.log(tokenPayload)
            request.user = {
                userId: tokenPayload.sub, // Extract userId from the token payload
                email: tokenPayload.email, // Extract email from the token payload
            }
            return true; // Allow access to the route
        }catch (error) {
            throw new UnauthorizedException('Invalid token'); // Token verification failed
        }

    }
}