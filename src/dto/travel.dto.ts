import {
  IsLatLong,
  IsMongoId,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { Document } from 'mongoose';

export class Travel extends Document {
  @IsString()
  state: string;

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

  @IsLatLong()
  fromCoordinates: any;

  @IsObject()
  fromLocation: any;

  @IsLatLong()
  toCoordinates: any;

  @IsObject()
  toLocation: any;
}
