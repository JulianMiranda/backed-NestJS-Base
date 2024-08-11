import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../dto/user.dto';
import { ENTITY } from '../enums/entity.enum';
import { Travel } from 'src/dto/travel.dto';
import { Car } from 'src/dto/car.dto';
import { Price } from 'src/dto/price.dto';

const checkProps = (props: string[], dataKeys: string[]) => {
  for (const key of dataKeys) {
    if (!props.includes(key)) {
      throw new BadRequestException(`The property \\ ${key} \\ is not valid`);
    }
  }
};

const checkUsersProps = (data: Partial<User>): Partial<User> => {
  const props = [
    'name',
    'lastName',
    'email',
    'phone',
    'role',
    'image',
    'status',
    'isInTravel',
    'notificationTokens',
    'theme',
    'reciveNotifications',
    'favoritesPlaces',
    'lastTravelUpdate',
    'acceptFastTravel',
    'acceptScheduleTravel',
    'acceptSharedTravel',
    'acceptScheduleSharedTravel',
    'coordinates',
    'rating',
  ];

  const { rating } = data;
  if (rating && ![1, 2, 3, 4, 5].includes(rating))
    throw new BadRequestException(
      '\\ rating \\ should be an integer value between 1 and 5',
    );

  const { role, theme } = data;
  if (role && !['ADMIN', 'JUN', 'CUN'].includes(role))
    throw new BadRequestException('\\ role \\ must be ADMIN, JUN or CUN ');

  if (theme && !['DEFAULT', 'DARK', 'LIGHT'].includes(theme))
    throw new BadRequestException('\\ theme \\ must be DEFAULT, DARK, LIGHT ');

  checkProps(props, Object.keys(data));
  return data;
};

const checkTravelProps = (data: Partial<Travel>): Partial<Travel> => {
  const props = [
    'user',
    'fromLocation',
    'toLocation',
    'state',
    'driver',
    'cost',
    'currency',
    'status',
    'type',
    'date',
  ];

  checkProps(props, Object.keys(data));
  return data;
};

const checkMessageProps = (data: Partial<Travel>): Partial<Travel> => {
  const props = ['de', 'para', 'message'];
  checkProps(props, Object.keys(data));
  return data;
};

const checkCarProps = (data: Partial<Car>): Partial<Car> => {
  const props = [
    'carPlate',
    'image',
    'carBrand',
    'carModel',
    'carYear',
    'carType',
    'color',
    'vin',
    'haveAirConditioning',
    'passengers',
    'verified',
  ];
  checkProps(props, Object.keys(data));
  return data;
};

const checkPriceProps = (data: Partial<Price>): Partial<Price> => {
  const props = ['mlc', 'mn', 'usd'];
  checkProps(props, Object.keys(data));
  return data;
};

export const acceptedProps = (route: string, data: any): any => {
  if (route === ENTITY.USERS) return checkUsersProps(data);
  else if (route === ENTITY.TRAVELS) return checkTravelProps(data);
  else if (route === ENTITY.MESSAGES) return checkMessageProps(data);
  else if (route === ENTITY.CARS) return checkCarProps(data);
  else if (route === ENTITY.PRICES) return checkPriceProps(data);
  throw new InternalServerErrorException('Invalid Route');
};
