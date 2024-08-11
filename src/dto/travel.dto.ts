import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { Document } from 'mongoose';
import { PAYMENTCURRENCY, PAYMENTTYPE } from 'src/enums/payment.enum';
import { TRAVELSTATE } from 'src/enums/travelstate.enum';
import { TRAVELTYPE } from 'src/enums/traveltype.enum';

export class Coordinates {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
export class TravelPoint {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsObject()
  coordinates: Coordinates;
}
export class TravelLocation {
  @IsString()
  type: string;

  @IsObject()
  travelPoint: TravelPoint;
}

export class TravelPayment {
  @IsEnum(PAYMENTTYPE)
  type: PAYMENTTYPE;

  @IsEnum(PAYMENTCURRENCY)
  currency: PAYMENTCURRENCY;
}

export class Travel extends Document {
  @IsEnum(TRAVELSTATE)
  state: TRAVELSTATE;

  @IsEnum(TRAVELTYPE)
  type: TRAVELTYPE;

  @IsObject()
  payment: TravelPayment;

  @IsDate()
  date: Date;

  @IsBoolean()
  status: boolean;

  @IsMongoId()
  @IsObject()
  user: string;

  @IsMongoId()
  @IsObject()
  driver: string;

  @IsNumber()
  cost: number;

  @IsObject()
  fromCoordinates: TravelPoint;

  @IsObject()
  fromLocation: TravelLocation;

  @IsObject()
  toCoordinates: TravelPoint;

  @IsObject()
  toLocation: TravelLocation;
}
