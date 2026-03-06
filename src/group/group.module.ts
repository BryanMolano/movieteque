import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { MemberModule } from 'src/member/member.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { FileModule } from 'src/file/file.module';

@Module({
  controllers: [GroupController],
  providers: [GroupService],
  imports: [TypeOrmModule.forFeature([Group]),
    MemberModule, 
    UserModule,
    AuthModule,
    FileModule,
  ],
})
export class GroupModule 
{}
