import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { MemberModule } from 'src/member/member.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { FileModule } from 'src/file/file.module';
import { Interaction } from 'src/interaction/entities/interaction.entity';
import { Recommendation } from 'src/recommendation/entities/recommendation.entity';
import { Message } from 'src/recommendation/entities/message.entity';

@Module({
  controllers: [GroupController],
  providers: [GroupService],
  imports: [TypeOrmModule.forFeature([Group,Interaction, Recommendation, Message]),
    MemberModule, 
    UserModule,
    AuthModule,
    FileModule,
  ],
  exports:[GroupService]
})
export class GroupModule 
{}
