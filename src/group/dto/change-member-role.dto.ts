import { IsEnum, IsUUID } from "class-validator";
import { ValidRoles } from "src/auth/interfaces/valid-roles.interface";

export class ChangeMemberRoleDto 
{
  @IsUUID()
  id: string;
  @IsEnum(ValidRoles)
  role: ValidRoles;
}
