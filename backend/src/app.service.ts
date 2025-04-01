import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { mesaj: string } {
    return {mesaj:"Hello World!"};
  }
}
