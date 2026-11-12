import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let calls = 0;
  const appService = {
    getHello: () => {
      calls += 1;
      return Promise.resolve({
        message: 'DevProfile API funcionando!',
        database: 'PostgreSQL conectado',
        users: [],
      });
    },
  };

  beforeEach(async () => {
    calls = 0;
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns the service response for the root route', async () => {
    const response = {
      message: 'DevProfile API funcionando!',
      database: 'PostgreSQL conectado',
      users: [],
    };
    await expect(appController.getHello()).resolves.toEqual(response);
    expect(calls).toBe(1);
  });
});
