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
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { RoomTypesService } from './room-types.service';

@Controller('room-types')
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Get()
  findActive() {
    return this.roomTypesService.findActive();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.roomTypesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateRoomTypeDto) {
    return this.roomTypesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoomTypeDto,
  ) {
    return this.roomTypesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.roomTypesService.deactivate(id);
  }
}