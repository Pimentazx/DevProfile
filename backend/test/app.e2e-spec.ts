import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('DevProfile API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let testEmails: string[];
  let testSkillNames: string[];

  async function registerUser(fullName = 'Usuário de Integração') {
    const email = `e2e-${randomUUID()}@devprofile.test`;
    testEmails.push(email);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, fullName, password: 'SenhaForte123' })
      .expect(201);

    return {
      email,
      userId: response.body.user.id as string,
      accessToken: response.body.accessToken as string,
    };
  }

  function authenticated(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(() => {
    testEmails = [];
    testSkillNames = [];
  });

  afterEach(async () => {
    if (testEmails.length) {
      await prisma.user.deleteMany({ where: { email: { in: testEmails } } });
    }
    if (testSkillNames.length) {
      await prisma.skill.deleteMany({
        where: { name: { in: testSkillNames } },
      });
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('authentication', () => {
    it('registers a user, creates a profile, and stores only a password hash', async () => {
      const email = `e2e-${randomUUID()}@devprofile.test`;
      testEmails.push(email);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          fullName: 'Usuário de Integração',
          password: 'SenhaForte123',
        })
        .expect(201);

      expect(response.body.user).toMatchObject({
        email,
        profile: { fullName: 'Usuário de Integração' },
      });
      expect(response.body.user.passwordHash).toBeUndefined();
      expect(response.body.accessToken).toEqual(expect.any(String));

      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });
      expect(user?.passwordHash).not.toBe('SenhaForte123');
      expect(user?.profile?.fullName).toBe('Usuário de Integração');
    });

    it('normalizes email and rejects a duplicate registration', async () => {
      const { email } = await registerUser();

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: email.toUpperCase(),
          fullName: 'Outro Nome',
          password: 'SenhaForte123',
        })
        .expect(409);
    });

    it('accepts valid credentials and rejects an invalid password', async () => {
      const { email } = await registerUser();

      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'SenhaForte123' })
        .expect(200);

      expect(login.body.accessToken).toEqual(expect.any(String));
      expect(login.body.user.email).toBe(email);
      expect(login.body.user.passwordHash).toBeUndefined();

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'senha-incorreta' })
        .expect(401);
    });

    it('rejects invalid registration data', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'email-inválido', fullName: '', password: '123' })
        .expect(400);
    });
  });

  describe('authenticated profile routes', () => {
    it('protects private routes and returns only the authenticated user', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
      await request(app.getHttpServer()).get('/profile/me').expect(401);

      const { email, accessToken } = await registerUser();
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set(authenticated(accessToken))
        .expect(200);

      expect(response.body).toMatchObject({
        email,
        profile: { fullName: 'Usuário de Integração' },
      });
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('reads and updates the authenticated user profile', async () => {
      const { userId, accessToken } = await registerUser();

      const initial = await request(app.getHttpServer())
        .get('/profile/me')
        .set(authenticated(accessToken))
        .expect(200);
      expect(initial.body.fullName).toBe('Usuário de Integração');

      const updated = await request(app.getHttpServer())
        .patch('/profile/me')
        .set(authenticated(accessToken))
        .send({
          fullName: 'Nome Atualizado',
          headline: 'Desenvolvedor Backend',
          location: 'São Paulo, SP',
        })
        .expect(200);

      expect(updated.body).toMatchObject({
        fullName: 'Nome Atualizado',
        headline: 'Desenvolvedor Backend',
        location: 'São Paulo, SP',
      });
      expect(
        await prisma.profile.findUnique({ where: { userId } }),
      ).toMatchObject({ fullName: 'Nome Atualizado' });
    });
  });

  describe('experiences', () => {
    it('creates, lists, validates, updates, and deletes an experience', async () => {
      const { accessToken } = await registerUser();
      const headers = authenticated(accessToken);
      const createDto = {
        company: 'Empresa de Teste',
        role: 'Desenvolvedor',
        employmentType: 'FULL_TIME',
        startDate: '2024-01-01',
        current: true,
      };

      const created = await request(app.getHttpServer())
        .post('/experiences')
        .set(headers)
        .send(createDto)
        .expect(201);
      expect(created.body).toMatchObject({
        company: 'Empresa de Teste',
        current: true,
        endDate: null,
      });

      const listed = await request(app.getHttpServer())
        .get('/experiences')
        .set(headers)
        .expect(200);
      expect(listed.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: created.body.id }),
        ]),
      );

      await request(app.getHttpServer())
        .post('/experiences')
        .set(headers)
        .send({ ...createDto, endDate: '2025-01-01' })
        .expect(400);

      const updated = await request(app.getHttpServer())
        .patch(`/experiences/${created.body.id}`)
        .set(headers)
        .send({ current: false, endDate: '2025-01-01', role: 'Tech Lead' })
        .expect(200);
      expect(updated.body).toMatchObject({
        role: 'Tech Lead',
        current: false,
        endDate: expect.any(String),
      });

      await request(app.getHttpServer())
        .delete(`/experiences/${created.body.id}`)
        .set(headers)
        .expect(200);
      await request(app.getHttpServer())
        .get(`/experiences/${created.body.id}`)
        .set(headers)
        .expect(404);
    });

    it('does not expose another user’s experience', async () => {
      const owner = await registerUser('Dono');
      const otherUser = await registerUser('Outro usuário');
      const created = await request(app.getHttpServer())
        .post('/experiences')
        .set(authenticated(owner.accessToken))
        .send({
          company: 'Empresa Privada',
          role: 'Engenheiro',
          employmentType: 'FULL_TIME',
          startDate: '2024-01-01',
          current: true,
        })
        .expect(201);

      await request(app.getHttpServer())
        .get(`/experiences/${created.body.id}`)
        .set(authenticated(otherUser.accessToken))
        .expect(404);
    });
  });

  describe('education', () => {
    it('creates, updates, and deletes an education record', async () => {
      const { accessToken } = await registerUser();
      const headers = authenticated(accessToken);

      const created = await request(app.getHttpServer())
        .post('/education')
        .set(headers)
        .send({
          institution: 'Universidade de Testes',
          course: 'Engenharia de Software',
          degree: 'BACHELOR',
          startDate: '2022-02-01',
          current: false,
          endDate: '2025-12-01',
        })
        .expect(201);

      const updated = await request(app.getHttpServer())
        .patch(`/education/${created.body.id}`)
        .set(headers)
        .send({ course: 'Ciência da Computação' })
        .expect(200);
      expect(updated.body.course).toBe('Ciência da Computação');

      await request(app.getHttpServer())
        .delete(`/education/${created.body.id}`)
        .set(headers)
        .expect(200);
      await request(app.getHttpServer())
        .get(`/education/${created.body.id}`)
        .set(headers)
        .expect(404);
    });
  });

  describe('skills and projects', () => {
    it('associates skills with a profile and project, then removes both', async () => {
      const { accessToken } = await registerUser();
      const headers = authenticated(accessToken);
      const skillName = `Skill ${randomUUID()}`;
      testSkillNames.push(skillName);

      const skill = await request(app.getHttpServer())
        .post('/skills')
        .set(headers)
        .send({ name: skillName, category: 'BACKEND', level: 'ADVANCED' })
        .expect(201);
      expect(skill.body).toMatchObject({ name: skillName, level: 'ADVANCED' });

      const project = await request(app.getHttpServer())
        .post('/projects')
        .set(headers)
        .send({
          name: 'Projeto de Integração',
          slug: `projeto-${randomUUID()}`,
          type: 'PERSONAL',
          skillIds: [skill.body.id],
        })
        .expect(201);
      expect(project.body.skills).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            skill: expect.objectContaining({ id: skill.body.id }),
          }),
        ]),
      );

      const updatedProject = await request(app.getHttpServer())
        .patch(`/projects/${project.body.id}`)
        .set(headers)
        .send({ featured: true })
        .expect(200);
      expect(updatedProject.body.featured).toBe(true);

      await request(app.getHttpServer())
        .delete(`/projects/${project.body.id}`)
        .set(headers)
        .expect(200);
      await request(app.getHttpServer())
        .delete(`/skills/${skill.body.id}`)
        .set(headers)
        .expect(200);

      await expect(
        prisma.profileSkill.findMany({ where: { skillId: skill.body.id } }),
      ).resolves.toHaveLength(0);
    });
  });

  describe('certificates and social links', () => {
    it('creates, updates, and deletes a certificate', async () => {
      const { accessToken } = await registerUser();
      const headers = authenticated(accessToken);
      const certificate = await request(app.getHttpServer())
        .post('/certificates')
        .set(headers)
        .send({
          name: 'Certificado de Teste',
          issuer: 'Instituição de Testes',
          issueDate: '2025-01-10',
        })
        .expect(201);

      const updated = await request(app.getHttpServer())
        .patch(`/certificates/${certificate.body.id}`)
        .set(headers)
        .send({ name: 'Certificado Atualizado' })
        .expect(200);
      expect(updated.body.name).toBe('Certificado Atualizado');

      await request(app.getHttpServer())
        .delete(`/certificates/${certificate.body.id}`)
        .set(headers)
        .expect(200);
    });

    it('creates, lists, updates, and deletes a social link', async () => {
      const { accessToken } = await registerUser();
      const headers = authenticated(accessToken);
      const link = await request(app.getHttpServer())
        .post('/social-links')
        .set(headers)
        .send({
          platform: 'GITHUB',
          url: 'https://github.com/test-user',
          username: 'test-user',
        })
        .expect(201);

      const listed = await request(app.getHttpServer())
        .get('/social-links')
        .set(headers)
        .expect(200);
      expect(listed.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: link.body.id })]),
      );

      const updated = await request(app.getHttpServer())
        .patch(`/social-links/${link.body.id}`)
        .set(headers)
        .send({ username: 'updated-user' })
        .expect(200);
      expect(updated.body.username).toBe('updated-user');

      await request(app.getHttpServer())
        .delete(`/social-links/${link.body.id}`)
        .set(headers)
        .expect(200);
    });
  });

  describe('integrations', () => {
    it('stores provider tokens privately and supports integration lifecycle', async () => {
      const { userId, accessToken } = await registerUser();
      const headers = authenticated(accessToken);
      const createDto = {
        provider: 'GITHUB',
        accessToken: 'github-access-secret',
        refreshToken: 'github-refresh-secret',
        expiresAt: '2027-01-01T00:00:00.000Z',
        metadata: { username: 'test-user' },
      };

      const created = await request(app.getHttpServer())
        .post('/integrations')
        .set(headers)
        .send(createDto)
        .expect(201);
      expect(created.body).toMatchObject({
        userId,
        provider: 'GITHUB',
        metadata: { username: 'test-user' },
      });
      expect(created.body.accessToken).toBeUndefined();
      expect(created.body.refreshToken).toBeUndefined();

      const persisted = await prisma.integration.findUnique({
        where: { userId_provider: { userId, provider: 'GITHUB' } },
      });
      expect(persisted).toMatchObject({
        accessToken: 'github-access-secret',
        refreshToken: 'github-refresh-secret',
      });

      const listed = await request(app.getHttpServer())
        .get('/integrations')
        .set(headers)
        .expect(200);
      expect(listed.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: created.body.id }),
        ]),
      );
      expect(listed.body[0].accessToken).toBeUndefined();
      expect(listed.body[0].refreshToken).toBeUndefined();

      await request(app.getHttpServer())
        .post('/integrations')
        .set(headers)
        .send(createDto)
        .expect(409);

      const updated = await request(app.getHttpServer())
        .patch(`/integrations/${created.body.id}`)
        .set(headers)
        .send({ accessToken: 'rotated-access-secret' })
        .expect(200);
      expect(updated.body.accessToken).toBeUndefined();
      expect(
        await prisma.integration.findUnique({
          where: { userId_provider: { userId, provider: 'GITHUB' } },
        }),
      ).toMatchObject({ accessToken: 'rotated-access-secret' });

      await request(app.getHttpServer())
        .delete(`/integrations/${created.body.id}`)
        .set(headers)
        .expect(200);
      await expect(
        prisma.integration.findUnique({
          where: { userId_provider: { userId, provider: 'GITHUB' } },
        }),
      ).resolves.toBeNull();
    });

    it('keeps integration records private to their owner', async () => {
      const owner = await registerUser('Dono da integração');
      const otherUser = await registerUser('Outro usuário');
      const created = await request(app.getHttpServer())
        .post('/integrations')
        .set(authenticated(owner.accessToken))
        .send({ provider: 'LINKEDIN', accessToken: 'linkedin-secret' })
        .expect(201);

      await request(app.getHttpServer())
        .get(`/integrations/${created.body.id}`)
        .set(authenticated(otherUser.accessToken))
        .expect(404);
    });
  });

  describe('sync history', () => {
    it('records a sync lifecycle and restricts it to the owner', async () => {
      await request(app.getHttpServer()).get('/sync').expect(401);

      const owner = await registerUser('Dono da sincronização');
      const otherUser = await registerUser('Outro usuário');
      const headers = authenticated(owner.accessToken);
      const created = await request(app.getHttpServer())
        .post('/sync')
        .set(headers)
        .send({ provider: 'GITHUB', resource: 'GITHUB_REPOSITORIES' })
        .expect(201);
      expect(created.body).toMatchObject({
        userId: owner.userId,
        provider: 'GITHUB',
        resource: 'GITHUB_REPOSITORIES',
        status: 'PENDING',
      });

      const startedAt = '2026-11-17T12:00:00.000Z';
      const running = await request(app.getHttpServer())
        .patch(`/sync/${created.body.id}`)
        .set(headers)
        .send({ status: 'RUNNING', startedAt })
        .expect(200);
      expect(running.body).toMatchObject({ status: 'RUNNING', startedAt });

      const completedAt = '2026-11-17T12:03:00.000Z';
      const failed = await request(app.getHttpServer())
        .patch(`/sync/${created.body.id}`)
        .set(headers)
        .send({
          status: 'FAILED',
          completedAt,
          errorMessage: 'Provider unavailable',
        })
        .expect(200);
      expect(failed.body).toMatchObject({
        status: 'FAILED',
        completedAt,
        errorMessage: 'Provider unavailable',
      });

      const listed = await request(app.getHttpServer())
        .get('/sync')
        .set(headers)
        .expect(200);
      expect(listed.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: created.body.id, status: 'FAILED' }),
        ]),
      );

      await request(app.getHttpServer())
        .get(`/sync/${created.body.id}`)
        .set(authenticated(otherUser.accessToken))
        .expect(404);
    });
  });
});
