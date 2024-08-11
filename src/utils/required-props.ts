import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ENTITY } from '../enums/entity.enum';
import { User } from 'src/dto/user.dto';
import { Message } from 'src/dto/message.dto';
import { Travel } from 'src/dto/travel.dto';
import { Car } from 'src/dto/car.dto';

const prepareProps = (props: string[], data: any) => {
  for (const key of Object.keys(data)) {
    if (!props.includes(key)) delete data[key];
  }

  return data;
};

const checkNullOrUndefined = (props: string[], data: any) => {
  for (const key of props) {
    if (!data.hasOwnProperty(key))
      throw new BadRequestException(`The property \\ ${key} \\ is required`);
    else if (data[key] == null)
      throw new BadRequestException(
        `The property \\ ${key} \\ cannot be null or undefined`,
      );
    else if (data[key] === '')
      throw new BadRequestException(
        `The property \\ ${key} \\ cannot be a empty string`,
      );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Unreachable code error
    else if (data[key] === [])
      throw new BadRequestException(
        `The property \\ ${key} \\ cannot be a empty array`,
      );
  }
};

const checkUserProps = (data: Partial<User>): Partial<User> => {
  const props = [];
  const dataCopy = prepareProps(props, { ...data });
  checkNullOrUndefined(props, dataCopy);
  return data;
};
const checkMessageProps = (data: Partial<Message>): Partial<Message> => {
  const props = ['de', 'para', 'message'];
  const dataCopy = prepareProps(props, { ...data });
  checkNullOrUndefined(props, dataCopy);
  return data;
};
const checkTravelProps = (data: Partial<Travel>): Partial<Travel> => {
  const props = [
    'user',
    'fromCoordinates',
    'toCoordinates',
    'cost',
    'type',
    'payment',
  ];
  const { payment } = data;
  if (
    payment &&
    payment.currency &&
    !['MLC', 'USD', 'MN'].includes(payment.currency)
  )
    throw new BadRequestException(
      '\\ payment currency \\ must be MLC, USD or MN',
    );
  if (payment && payment.type && !['cash', 'transfer'].includes(payment.type))
    throw new BadRequestException(
      '\\ payment type \\ must be cash or transfer',
    );
  const dataCopy = prepareProps(props, { ...data });
  checkNullOrUndefined(props, dataCopy);
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
  ];
  const dataCopy = prepareProps(props, { ...data });
  checkNullOrUndefined(props, dataCopy);
  return data;
};

export const requiredProps = (route: string, data: any): any => {
  if (route === ENTITY.USERS) return checkUserProps(data);
  if (route === ENTITY.MESSAGES) return checkMessageProps(data);
  if (route === ENTITY.TRAVELS) return checkTravelProps(data);
  if (route === ENTITY.CARS) return checkCarProps(data);

  throw new InternalServerErrorException('Invalid Route');
};
