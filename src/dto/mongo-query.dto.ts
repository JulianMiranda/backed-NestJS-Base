import { IsArray, IsNumber, IsObject } from 'class-validator';

export class MongoQuery {
  @IsObject()
  filter: object;

  @IsObject()
  projection: object;

  @IsObject()
  sort: Record<string, 1 | -1>;

  @IsNumber()
  limit: number;

  @IsNumber()
  page: number;

  @IsNumber()
  skip: number;

  @IsArray()
  population: any[];
}
