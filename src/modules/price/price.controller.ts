import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Price } from 'src/dto/price.dto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { ENTITY } from '../../enums/entity.enum';
import { AcceptedProps } from '../../pipes/accepted-props.pipe';
import { PriceRepository } from './price.repository';

@Controller(ENTITY.PRICES)
export class PriceController {
  constructor(private priceRepository: PriceRepository) {}

  @Get('/getPrices')
  getPrices(): any {
    return this.priceRepository.getPrices();
  }

  @Get('/getPricesNoAuth')
  getPricesUnAuth(): any {
    return this.priceRepository.getPrices();
  }

  @UseGuards(AuthenticationGuard)
  @Put('/updatePrices')
  @UsePipes(new AcceptedProps(ENTITY.PRICES))
  update(@Body() data: Partial<Price>): Promise<boolean> {
    return this.priceRepository.update(data);
  }
}
