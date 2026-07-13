import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { AvailabilityService } from '../../availability/availability.service';
import type { ReservationRoomSelectionDto } from '../dto/reservation-room-selection.dto';

export type ValidatedRoomSelection = {
  roomTypeId: string;
  quantity: number;
  adultsPerRoom: number;
  availableUnits: number;
  maxAdultsPerRoom: number;
};

export type ReservationAvailabilityResult = {
  checkIn: string;
  checkOut: string;
  nights: number;
  minimumStay: number;
  totalAdults: number;
  totalRooms: number;
  rooms: ValidatedRoomSelection[];
};

@Injectable()
export class ReservationAvailabilityService {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  async validateReservationRequest(params: {
    checkIn: string;
    checkOut: string;
    rooms: ReservationRoomSelectionDto[];
  }): Promise<ReservationAvailabilityResult> {
    if (params.rooms.length === 0) {
      throw new BadRequestException(
        'Rezervarea trebuie să conțină cel puțin un apartament.',
      );
    }

    this.ensureUniqueRoomTypes(params.rooms);

    const totalAdults = params.rooms.reduce(
      (total, room) =>
        total + room.quantity * room.adultsPerRoom,
      0,
    );

    const totalRooms = params.rooms.reduce(
      (total, room) => total + room.quantity,
      0,
    );

    if (totalRooms > 8) {
      throw new BadRequestException(
        'Nu pot fi rezervate mai mult de 8 apartamente.',
      );
    }

    const availability =
      await this.availabilityService.checkAvailability({
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        adults: totalAdults,
      });

    const availableRoomTypes = new Map(
      availability.roomTypes.map((roomType) => [
        roomType.id,
        roomType,
      ]),
    );

    const validatedRooms = params.rooms.map((selection) => {
      const availableRoomType = availableRoomTypes.get(
        selection.roomTypeId,
      );

      if (!availableRoomType) {
        throw new ConflictException({
          code: 'ROOM_TYPE_NOT_AVAILABLE',
          message:
            'Unul dintre tipurile de apartamente selectate nu este disponibil în perioada aleasă.',
          roomTypeId: selection.roomTypeId,
        });
      }

      if (
        selection.adultsPerRoom >
        availableRoomType.maxAdults
      ) {
        throw new BadRequestException({
          code: 'ROOM_CAPACITY_EXCEEDED',
          message: `Numărul maxim de adulți pentru ${availableRoomType.nameRo} este ${availableRoomType.maxAdults}.`,
          roomTypeId: selection.roomTypeId,
          maximumAdults: availableRoomType.maxAdults,
          requestedAdultsPerRoom: selection.adultsPerRoom,
        });
      }

      if (
        selection.quantity >
        availableRoomType.availableUnits
      ) {
        throw new ConflictException({
          code: 'INSUFFICIENT_AVAILABILITY',
          message: `Pentru ${availableRoomType.nameRo} sunt disponibile doar ${availableRoomType.availableUnits} unități.`,
          roomTypeId: selection.roomTypeId,
          requestedUnits: selection.quantity,
          availableUnits: availableRoomType.availableUnits,
        });
      }

      return {
        roomTypeId: selection.roomTypeId,
        quantity: selection.quantity,
        adultsPerRoom: selection.adultsPerRoom,
        availableUnits: availableRoomType.availableUnits,
        maxAdultsPerRoom: availableRoomType.maxAdults,
      };
    });

    return {
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      nights: availability.nights,
      minimumStay: availability.minimumStay,
      totalAdults,
      totalRooms,
      rooms: validatedRooms,
    };
  }

  private ensureUniqueRoomTypes(
    rooms: ReservationRoomSelectionDto[],
  ): void {
    const roomTypeIds = rooms.map(
      (room) => room.roomTypeId,
    );

    if (
      new Set(roomTypeIds).size !== roomTypeIds.length
    ) {
      throw new BadRequestException({
        code: 'DUPLICATE_ROOM_TYPE',
        message:
          'Același tip de apartament nu poate apărea de mai multe ori.',
      });
    }
  }
}