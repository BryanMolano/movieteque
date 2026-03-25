import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { InteractionService } from './interaction.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { UpdateInteractionDto } from './dto/update-interaction.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interface';
import { DeleteInteractionDto } from './dto/delete-interaction.dto';

@Controller('interaction')
export class InteractionController 
{
  constructor(private readonly interactionService: InteractionService) 
  {}

  @Post(':id/create')
  @Auth(ValidRoles.Admin, ValidRoles.User)
  create(
    @Param('id', ParseUUIDPipe) groupId: string,
    @Body() createInteractionDto: CreateInteractionDto,
    @GetUser() user: User)
  {
    // console.log(`Received request to create interaction in group ${groupId} by user ${user.id} with data:`, createInteractionDto);
    return this.interactionService.create(createInteractionDto,groupId, user);
  }

  @Post(':id/delete')
  @Auth(ValidRoles.Admin, ValidRoles.User)
  deleteInteraction(
    @Param('id', ParseUUIDPipe) groupId: string,
    @Body() deleteInteractionDto: DeleteInteractionDto,
    @GetUser() user: User)
  {
    return this.interactionService.delete(deleteInteractionDto);
  }

  @Patch(':id/:interactionId')
  @Auth(ValidRoles.Admin, ValidRoles.User)
  update(
    @Param('id') groupId: string, 
    @Param('interactionId') interactionId: string, 
    @Body() updateInteractionDto: UpdateInteractionDto,
    @GetUser() user: User
  ) 
  {
    return this.interactionService.update(updateInteractionDto, groupId, user, interactionId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) 
  {
    return this.interactionService.remove(+id);
  }
}
