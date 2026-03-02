import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/files/files.service';

@Controller('user')
export class UserController 
{
  constructor(private readonly userService: UserService,
    private readonly fileService: FilesService) 
  {}


  @Get(':term/search')
  @UseGuards(AuthGuard())
  findAll(@Param('term')term:string, @GetUser() user:User) 
  {
    return this.userService.findAll(term, user);
  }

  @Get(':term/user')
  @UseGuards(AuthGuard())
  findOne(@Param('term') term: string, @GetUser() user:User) 
  {
    return this.userService.findOne(term, user);
  }

  @Patch('profile')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('image'))
  async update(
    // @Param('id') id: string, 
    @Body() updateData: {description?: string}, 
    @GetUser() user:User,
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
    let currentImage = user.imgUrl;
    if(file)
    {
      currentImage = await this.fileService.uploadProfileImage(file);
    }

    return this.userService.update(user, {
      description: updateData.description,
      imgUrl: currentImage 
    })

  }

}
