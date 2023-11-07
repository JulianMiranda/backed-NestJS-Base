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
import { SocketController } from './socket/socket.controller';
import { MessageController } from './modules/message/message.controller';
import { SocketModule } from './socket/socket.module';
import { MessageModule } from './modules/message/message.module';
import { TravelModule } from './modules/travel/travel.module';
import { TravelController } from './modules/travel/travel.controller';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/auth.controller';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }),
    AuthModule,
    UserModule,
    RoleModule,
    ImageModule,
    SocketModule,
    MessageModule,
    TravelModule,
  ],
  controllers: [AppController],
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
        SocketController,
        TravelController,
      );
  }
}
