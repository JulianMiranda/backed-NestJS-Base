import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../dto/user.dto';
import { ENTITY } from '../enums/entity.enum';
import { Travel } from 'src/dto/travel.dto';

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
    'notificationTokens',
    'theme',
    'reciveNotifications',
    'favoritesPlaces',
    'lastTravel',
    'acceptFastTravel',
    'acceptScheduleTravel',
  ];

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
  ];
  checkProps(props, Object.keys(data));
  return data;
};

const checkMessageProps = (data: Partial<Travel>): Partial<Travel> => {
  const props = ['de', 'para', 'message'];
  checkProps(props, Object.keys(data));
  return data;
};

export const acceptedProps = (route: string, data: any): any => {
  if (route === ENTITY.USERS) return checkUsersProps(data);
  else if (route === ENTITY.TRAVELS) return checkTravelProps(data);
  else if (route === ENTITY.MESSAGES) return checkMessageProps(data);
  throw new InternalServerErrorException('Invalid Route');
};
