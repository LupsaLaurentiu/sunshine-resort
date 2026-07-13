import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findActive() {
    return this.roomsService.findActive();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.roomsService.deactivate(id);
  }
}