import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller'; /* 
import { MONGO_CONNECTION } from './config/config'; */
import { GetUserMiddleware } from './middlewares/get-user.middleware';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { RoleController } from './modules/role/role.controller';
import { RoleModule } from './modules/role/role.module';
import { ImageController } from './modules/image/image.controller';
import { ImageModule } from './modules/image/image.module';
import { MessageController } from './modules/message/message.controller';
import { SocketModule } from './socket/socket.module';
import { MessageModule } from './modules/message/message.module';
import { TravelModule } from './modules/travel/travel.module';
import { TravelController } from './modules/travel/travel.controller';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/auth.controller';
import { ConfigModule } from '@nestjs/config';
import { QueriesModule } from './modules/queries/queries.module';
import { QueriesController } from './modules/queries/queries.controller';
import { GeoUtils } from './utils/geoDistance';
import { CarModule } from './modules/car/car.module';
import { CarsController } from './modules/car/car.controller';
import { TravelService } from './services/travel.service';
import TravelSchema from './schemas/travel.schema';
import { Travel } from './dto/travel.dto';
import { User } from './dto/user.dto';
import UserSchema from './schemas/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION),
    MongooseModule.forFeature([{ name: Travel.name, schema: TravelSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    AuthModule,
    UserModule,
    RoleModule,
    ImageModule,
    SocketModule,
    MessageModule,
    TravelModule,
    QueriesModule,
    CarModule,
  ],
  controllers: [AppController],
  providers: [GeoUtils, TravelService],
  exports: [TravelService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(GetUserMiddleware)
      .forRoutes(
        AuthController,
        UserController,
        RoleController,
        ImageController,
        MessageController,
        TravelController,
        QueriesController,
        CarsController,
      );
  }
}
