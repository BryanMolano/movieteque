import { Controller, Get, Body, Patch, Param, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { UserService } from './user.service';
// import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/file/file.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController 
{
  constructor(private readonly userService: UserService,
    private readonly fileService: FileService) 
  {}


  @Get(':term/search')
  @UseGuards(AuthGuard('jwt'))
  findAll(@Param('term')term:string, @GetUser() user:User) 
  {
    return this.userService.findAll(term, user);
  }

  @Get(':term/user')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('term') term: string) 
  {
    return this.userService.findOne(term);
  }
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOneId(@Param('id') id: string) 
  {
    return this.userService.findOneId(id);
  }

  @Patch('')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Body() updateData: UpdateUserDto,
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
    if(!file && (!updateData || Object.keys(updateData).length === 0))
      return user;
    let currentImage = user.imgUrl;
    
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
    updateData.imgUrl = currentImage;

    return this.userService.update(user, updateData)

  }

}
