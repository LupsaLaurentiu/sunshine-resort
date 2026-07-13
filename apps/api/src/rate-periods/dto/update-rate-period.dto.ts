import { PartialType } from '@nestjs/mapped-types';
import { CreateRatePeriodDto } from './create-rate-period.dto';

export class UpdateRatePeriodDto extends PartialType(
  CreateRatePeriodDto,
) {}