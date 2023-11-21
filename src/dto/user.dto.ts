import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsLatLong,
  IsNumber,
  IsObject,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { Document } from 'mongoose';

export class User extends Document {
  @IsString()
  firebaseId: string;

  @IsBoolean()
  reciveNotifications: boolean;

  @IsString()
  name: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsUrl()
  image: string;

  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsString()
  role: string;

  @IsArray()
  permissions: string[];

  @IsString()
  defaultImage: string;

  @IsString()
  notificationTokens: string;

  @IsString()
  theme: string;

  @IsArray()
  favoritesPlaces: any[];

  @IsArray()
  lastTravel: LastTravelUpdateDto[];

  @IsObject()
  lastTravelUpdate: LastTravelUpdateDto;

  @IsBoolean()
  acceptFastTravel: boolean;

  @IsBoolean()
  acceptScheduleTravel: boolean;

  @IsLatLong()
  coordinates: any;

  @IsObject()
  location: any;

  @IsNumber()
  rating: number;

  @IsNumber()
  ratingAvg: number;

  @IsObject()
  ratingStars: any;

  @IsString()
  idNumber: string;

  @IsString()
  driveLicense: string;
}
class CoordinatesDto {
  @IsNumber()
  latitud: number;

  @IsNumber()
  longitud: number;
}
export class LastTravelUpdateDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsObject()
  coordinates: CoordinatesDto;
}
