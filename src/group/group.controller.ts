import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe, UseInterceptors, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, UploadedFile, BadRequestException } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PaginationDto } from './dto/pagination.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { JoinByLinkDto } from './dto/join-by-link.dto';
import { BanMemberDto } from './dto/ban-member.dto';
import { ChangeMemberRoleDto } from './dto/change-member-role.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/file/file.service';
import { ChangeMemberNicknameDto } from './dto/change-member-nickname.dto';

@Controller('group')
export class GroupController 
{
  constructor(private readonly groupService: GroupService,
    private readonly fileService: FileService) 
  {}

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @GetUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({maxSize:5000000}),
          new FileTypeValidator({fileType: /image\/(jpeg|png|webp)/})
        ],fileIsRequired: false,
      }) 
    )file?: Express.Multer.File, 
  )
  {

    if(!file && (!createGroupDto|| Object.keys(createGroupDto).length === 0))
      throw new BadRequestException('there is not enough data for the group to be created')

    if(file)
    {
      const image= await this.fileService.uploadProfileImage(file);
      createGroupDto.imgUrl = image;
    }

    return this.groupService.create(createGroupDto, user)

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
    return this.groupService.findOneComplete(id, user);
  }

  @Get(':id/members')
  @UseGuards(AuthGuard())
  getMembers(@Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) 
  {
    return this.groupService.getMembers(id, user);
  }

  @Patch(':id')
  @Auth(ValidRoles.Admin)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateGroupDto: UpdateGroupDto,
    @GetUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({maxSize:5000000}),
          new FileTypeValidator({fileType: /image\/(jpeg|png|webp)/})
        ],fileIsRequired: false,
      }) 
    
    )file?: Express.Multer.File, 
  )
  {


    const group = await this.groupService.findOne(id, user)
    if(group)
    {
      let currentImage = group.imgUrl;
      if(file)
      {
        if(currentImage)
        { 
          const urlParsed = new URL(currentImage)
          let urlPathname = urlParsed.pathname
          urlPathname = urlPathname.substring(1)
          await this.fileService.deleteProfileImage(urlPathname)
        }
        currentImage= await this.fileService.uploadProfileImage(file);
      }
      updateGroupDto.imgUrl = currentImage;
    }
    return this.groupService.update(id, updateGroupDto, user);
  }

  @Delete(':id/deleteGroup')
  @Auth(ValidRoles.Admin)
  remove(@Param('id', ParseUUIDPipe) id: string,
    @GetUser() user : User) 
  {
    return this.groupService.remove(id, user);
  }

  @Post(':id/ban')
  @Auth(ValidRoles.Admin)
  ban(@Param('id', ParseUUIDPipe) groupId: string ,@Body() banMemberDto: BanMemberDto, @GetUser() user: User) 
  {
    return this.groupService.banMember(groupId, banMemberDto, user);
  }

  @Post(':id/changeMemberRole')
  @Auth(ValidRoles.Admin)
  changeMemberRol(@Param('id', ParseUUIDPipe) groupId: string ,@Body() changeMemberRole: ChangeMemberRoleDto, @GetUser() user: User) 
  {
    return this.groupService.changeMemberRole(groupId, changeMemberRole, user);
  }

  @Get(':id/invitation-link')
  @Auth(ValidRoles.Admin,ValidRoles.User)
  getInvitationLink(@Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User)
  {
    return this.groupService.getInvitationLink(id, user)
  }

  @Post('joinbylink')
  @UseGuards(AuthGuard())
  joinByLink(@Body() joinByLinkDto: JoinByLinkDto, @GetUser() user: User)
  {
    return this.groupService.joinByLink(joinByLinkDto, user);
  }
  
  @Patch(':id/changeNickname')
  @Auth(ValidRoles.Admin, ValidRoles.User)
  changeMemberNickname(
    @Param('id', ParseUUIDPipe) groupId: string,
    @GetUser() user: User, 
    @Body() changeMemberNicknameDto: ChangeMemberNicknameDto)
  {
    return this.groupService.changeMemberNickname(groupId,changeMemberNicknameDto,user);
  }

  @Get('verify-invitation/:jwt')
  @UseGuards(AuthGuard()) 
  verifyInvitation(@Param('jwt') jwt: string) 
  {
    return this.groupService.verifyInvitationToken(jwt);
  }

  @Get(':id/get-public-groups')
  @UseGuards(AuthGuard())
  findPublicGroupsUser(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  )
  {
    return this.groupService.findPublicGroupsUser(id)

  }


}
