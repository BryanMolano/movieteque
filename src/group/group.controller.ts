import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PaginationDto } from './dto/pagination.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('group')
export class GroupController 
{
  constructor(private readonly groupService: GroupService,
  ) 
  {}

  @Post()
  async create(@Body() createGroupDto: CreateGroupDto) 
  {
    return this.groupService.create(createGroupDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  findAll(@Query() paginationDto : PaginationDto,
    @GetUser() user: User,
  ) 
  {
    return this.groupService.findAll(paginationDto, user);
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  findOne(@Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) 
  {
    return this.groupService.findOne(id, user);
  }

  @Get(':members')
  @UseGuards(AuthGuard())
  getMembers(@Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) 
  {
    return this.groupService.getMembers(id, user);
  }


  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateGroupDto: UpdateGroupDto,
    @GetUser() user: User) 
  {
    return this.groupService.update(id, updateGroupDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id') id: string,
    @GetUser() user : User) 
  {
    return this.groupService.remove(id, user);
  }
  @Post(':ban')
  @Auth(ValidRoles.admin)
  ban(@Body() createGroupDto: CreateGroupDto) 
  {
    return this.groupService.create(createGroupDto);
  }

  @Get(':getinvitationlink')
  @Auth(ValidRoles.admin, ValidRoles.superUser, ValidRoles.user)
  getInvitationLink(@Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User)
  {
    return this.groupService.getInvitationLink(id, user)
  }
}
