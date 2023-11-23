import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Travel } from 'src/dto/travel.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { MongoQuery } from '../../dto/mongo-query.dto';
import { ENTITY } from '../../enums/entity.enum';
import { AcceptedProps } from '../../pipes/accepted-props.pipe';
import { RequiredProps } from '../../pipes/required-props.pipe';
import { TransformQuery } from '../../pipes/transform-query.pipe';
import { TravelRepository } from './travel.repository';

@Controller(ENTITY.TRAVELS)
export class TravelController {
  constructor(private travelRepository: TravelRepository) {}

  @UseGuards(AuthenticationGuard)
  @Post('/getList')
  @UsePipes(new TransformQuery())
  getList(@Body() query: MongoQuery): any {
    return this.travelRepository.getList(query);
  }

  @Get('/getOne/:id')
  getOne(@Param('id') id: string): Promise<Travel> {
    return this.travelRepository.getOne(id);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/create')
  @UsePipes(new RequiredProps(ENTITY.TRAVELS))
  create(@Body() data: Travel, @Req() req: any): Promise<any> {
    const user = req.user.id;
    return this.travelRepository.create({ ...data, user });
  }

  @Put('/update/:id')
  @UsePipes(new AcceptedProps(ENTITY.TRAVELS))
  update(
    @Param('id') id: string,
    @Body() data: Partial<Travel>,
  ): Promise<boolean> {
    return this.travelRepository.update(id, data);
  }

  @Delete('/delete/:id')
  delete(@Param('id') id: string): Promise<boolean> {
    return this.travelRepository.delete(id);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/testFindDrivers/:id')
  @UsePipes(new RequiredProps(ENTITY.TRAVELS))
  testFindDrivers(
    @Body() data: Travel,
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<any> {
    const user = req.user.id;
    return this.travelRepository.testFindDrivers({ ...data, user }, id);
  }
}
