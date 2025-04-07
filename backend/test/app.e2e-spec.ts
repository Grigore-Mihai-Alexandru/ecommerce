import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth E2E (AppController)', () => {
  let app: INestApplication;
  let server: any;

  const testUser = {
    email: 'e2etest@example.com',
    password: 'testpass123',
    name: 'E2E Tester',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / should return Hello World!', () => {
    return request(server).get('/').expect(200).expect('Hello World!');
  });

  let accessToken: string;

  it('POST /auth/register - should register user', async () => {
    const response = await request(server)
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body).toHaveProperty('email', testUser.email);
    expect(response.body).not.toHaveProperty('password'); // Good practice
  });

  it('POST /auth/login - should return JWT token', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    accessToken = response.body.accessToken;
  });

  it('GET /auth/me - should return user info', async () => {
    const response = await request(server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('email', testUser.email);
  });

  it('POST /auth/login - wrong password should fail', () => {
    return request(server)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpass',
      })
      .expect(401);
  });
});
