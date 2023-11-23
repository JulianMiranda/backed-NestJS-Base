import {
  IsDate,
  IsMongoId,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { Document } from 'mongoose';

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

export class Travel extends Document {
  @IsString()
  state: string;

  @IsString()
  type: string;

  @IsDate()
  date: Date;

  @IsMongoId()
  @IsObject()
  user: string;

  @IsMongoId()
  @IsObject()
  driver: string;

  @IsNumber()
  cost: number;

  @IsString()
  currency: string;

  @IsObject()
  fromCoordinates: TravelPoint;

  @IsObject()
  fromLocation: TravelLocation;

  @IsObject()
  toCoordinates: TravelPoint;

  @IsObject()
  toLocation: TravelLocation;
}
