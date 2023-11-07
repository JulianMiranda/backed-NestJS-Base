import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../../schemas/user.schema';
import { AuthController } from '../auth/auth.controller';
import { ImageModule } from '../image/image.module';
import { AuthRepository } from './auth.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
    ImageModule,
  ],
  controllers: [AuthController],
  providers: [AuthRepository],
})
export class AuthModule {}
