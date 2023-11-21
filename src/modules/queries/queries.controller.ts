import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { QueriesRepository } from './queries.repository';

@Controller('queries')
@UseGuards(AuthenticationGuard)
export class QueriesController {
  constructor(private queriesRepository: QueriesRepository) {}

  @Post('/nearDrivers')
  nearDrivers(@Body() data: any): Promise<any> {
    return this.queriesRepository.nearDrivers(data);
  }
  @Post('/distanceFromTo')
  distanceFromTo(@Body() data: any): Promise<any> {
    return this.queriesRepository.distanceFromTo(data);
  }

  @Post('/test')
  test(@Body() data: any): Promise<any> {
    return this.queriesRepository.test(data);
  }
}
