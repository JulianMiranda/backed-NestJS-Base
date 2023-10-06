import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { MONGO_CONNECTION } from './config/config';
import { GetUserMiddleware } from './middlewares/get-user.middleware';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { RoleController } from './modules/role/role.controller';
import { RoleModule } from './modules/role/role.module';
import { ImageController } from './modules/image/image.controller';
import { ImageModule } from './modules/image/image.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(MONGO_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }),
    UserModule,
    RoleModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(GetUserMiddleware)
      .forRoutes(UserController, RoleController, ImageController);
  }
}
