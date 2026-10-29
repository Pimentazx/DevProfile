import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { EducationModule } from './education/education.module';
import { SkillsModule } from './skills/skills.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ProjectsModule } from './projects/projects.module';
import { SocialLinksModule } from './social-links/social-links.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    ExperiencesModule,
    EducationModule,
    SkillsModule,
    CertificatesModule,
    ProjectsModule,
    SocialLinksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}