import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [MemberController],
  providers: [MemberService],
  imports: [MemberService, UserModule]
})
export class MemberModule 
{}
