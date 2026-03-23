import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('interaction')
export class InteractionController 
{
  constructor(private readonly interactionService: InteractionService) 
  {}

  @Post(':id')
  create(
    @Param('id', ParseUUIDPipe) groupId: string,
    @Body() createInteractionDto: CreateInteractionDto,
    @GetUser() user: User)
  {
    return this.interactionService.create(createInteractionDto,groupId, user);
  }

  @Get()
  findAll() 
  {
    return this.interactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) 
  {
    return this.interactionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInteractionDto: UpdateInteractionDto) 
  {
    return this.interactionService.update(+id, updateInteractionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) 
  {
    return this.interactionService.remove(+id);
  }
}
