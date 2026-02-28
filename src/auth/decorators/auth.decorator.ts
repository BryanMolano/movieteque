import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles.interface';
import { AuthGuard } from '@nestjs/passport';
import { MemberVerificationGuard } from '../guards/user-role/member-verification.guard';
import { MemberRoleGuard } from '../guards/user-role/member-role.guard';
import { RoleProtected } from './role-protected.decorator';
  
export function Auth  (...roles: ValidRoles[])
{
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), MemberVerificationGuard, MemberRoleGuard),
  );
}
