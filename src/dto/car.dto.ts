import { IsBoolean, IsString, IsNumber, IsUrl } from 'class-validator';
import { Document } from 'mongoose';

export class Car extends Document {
  @IsString()
  carPlate: string;

  @IsString()
  carBrand: string;

  @IsString()
  carModel: string;

  @IsString()
  carYear: string;

  @IsBoolean()
  haveAirConditioning: boolean;

  @IsString()
  carType: string;

  @IsString()
  color: string;

  @IsNumber()
  passengers: number;

  @IsString()
  vin: string;

  @IsString()
  @IsUrl()
  image: string;

  @IsBoolean()
  verified: boolean;
}
