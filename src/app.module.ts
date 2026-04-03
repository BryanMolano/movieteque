import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule} from "@nestjs/config";
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { MovieModule } from './movie/movie.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { MemberModule } from './member/member.module';
import { InteractionModule } from './interaction/interaction.module';
import { FileModule } from './file/file.module';
import { FileService } from './file/file.service';
import { MessageWsModule } from './message-ws/message-ws.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRoot({
      ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false,
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: process.env.STAGE !== 'prod', 
    }),
    UserModule,
    AuthModule,
    GroupModule,
    MovieModule,
    RecommendationModule,
    MemberModule,
    InteractionModule,
    FileModule,
    MessageWsModule,


  ],
  controllers: [AppController],
  providers: [AppService, FileService],
})
export class AppModule
{
}
