import {
  Injectable,
  NestMiddleware,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../dto/user.dto';
import { ROLES } from '../enums/roles.enum';
import { RoleRepository } from '../modules/role/role.repository';
import { getDefaultImage } from '../utils/index';

@Injectable()
export class GetUserMiddleware implements NestMiddleware {
  constructor(private roleRepository: RoleRepository) {}

  async use(req: Request, res: Response, next: () => void) {
    const token = req.headers['x-token'];
    /*     const client = new AWS.SNS({ region: 'us-east-1' });
    const topic = await client.createTopic({
      Name: 'arn:aws:sns:us-east-1:174491001014:app/GCM/NotificationFirebase',
    });

    topic.publish({
      message: 'Hello!',
    }); */

    if (!token) {
      next();
      return;
    }
    try {
      const userInfo = {
        name: '',
        firebaseId: '',
        picture: '',
        role: '',
        email: '',
        phone_number: '',
        mongoId: '',
      };

      /* !!! GetUserINFO !!! */

      if (userInfo) {
        if (!userInfo.name)
          throw new ServiceUnavailableException('Please login again');

        const user: Partial<User> = {
          firebaseId: userInfo.firebaseId,
          name: userInfo.name,
          image: userInfo.picture
            ? userInfo.picture
            : getDefaultImage(userInfo.name),
          role: userInfo.role || ROLES.CUN,
        };
        if (userInfo.email) user.email = userInfo.email;
        if (userInfo.phone_number) user.phone = userInfo.phone_number;
        if (userInfo.mongoId) user.id = userInfo.mongoId;

        (user.permissions = this.roleRepository.getRoles()[user.role]),
          (req['user'] = user);
      }
    } catch (e) {
      if (e.status === 503) throw e;
      else throw new UnauthorizedException('Authentication error', e);
    }

    next();
  }
}
