import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';

@Module({
  controllers: [MemberController],
  providers: [MemberService],
  imports: [UserModule,
    TypeOrmModule.forFeature([Member])
  ],
  exports:[TypeOrmModule]
})
export class MemberModule 
{}
