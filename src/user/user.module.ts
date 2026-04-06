import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FileModule } from 'src/file/file.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
  imports:[FileModule,   
    MailModule,
    TypeOrmModule.forFeature([User])]
})
export class UserModule 
{}
