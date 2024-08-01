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
import { TravelPoint } from './travel.dto';

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
  lastTravel: TravelPoint[];

  @IsObject()
  lastTravelUpdate: TravelPoint;

  @IsBoolean()
  acceptFastTravel: boolean;

  @IsBoolean()
  isInTravel: boolean;

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
