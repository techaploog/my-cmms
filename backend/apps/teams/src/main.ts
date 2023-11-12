import { NestFactory } from '@nestjs/core';
import { TeamsModule } from './teams.module';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { TEAMS_SERVICES } from '@app/common';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(TeamsModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice({
    transport:Transport.RMQ,
    options:{
      urls:[configService.get('RABBITMQ_URI')],
      queue: TEAMS_SERVICES.QUEUE
    }
  })

  app.use(helmet());
  app.enableCors({
    origin:configService.get('ALLOW_ORIGIN').split(',')
  })
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe())
  app.useLogger(app.get(Logger));
  
  await app.startAllMicroservices();
  await app.listen(configService.get('HTTP_PORT'))

}
bootstrap();
