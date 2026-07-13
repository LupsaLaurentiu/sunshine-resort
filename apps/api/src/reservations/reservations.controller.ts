import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FindReservationsQueryDto } from './dto/find-reservations-query.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
  ) {}

  @Post()
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query() query: FindReservationsQueryDto,
  ) {
    return this.reservationsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reservationsService.findById(id);
  }
}