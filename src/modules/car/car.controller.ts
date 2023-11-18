import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Car } from 'src/dto/car.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { MongoQuery } from '../../dto/mongo-query.dto';
import { ENTITY } from '../../enums/entity.enum';
import { AcceptedProps } from '../../pipes/accepted-props.pipe';
import { TransformQuery } from '../../pipes/transform-query.pipe';
import { CarRepository } from './car.repository';

@Controller(ENTITY.CARS)
export class CarsController {
  constructor(private carRepository: CarRepository) {}

  @Post('/getList')
  @UseGuards(AuthenticationGuard)
  @UsePipes(new TransformQuery())
  getList(@Body() query: MongoQuery): any {
    return this.carRepository.getList(query);
  }

  @Get('/getOne/:id')
  getOne(@Param('id') id: string): Promise<Car> {
    return this.carRepository.getOne(id);
  }
  @UseGuards(AuthenticationGuard)
  @Put('/update/:id')
  @UsePipes(new AcceptedProps(ENTITY.CARS))
  update(@Param('id') id: string, @Body() data: any): Promise<any> {
    const { image } = data;
    delete data.image;
    return this.carRepository.update(id, data, image);
  }
  @UseGuards(AuthenticationGuard)
  @Delete('/delete/:id')
  delete(@Param('id') id: string): Promise<boolean> {
    return this.carRepository.delete(id);
  }
}
