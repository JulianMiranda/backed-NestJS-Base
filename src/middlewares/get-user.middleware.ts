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
import { UserRepository } from 'src/modules/user/user.repository';

@Injectable()
export class GetUserMiddleware implements NestMiddleware {
  constructor(
    private roleRepository: RoleRepository,
    private userRepository: UserRepository,
  ) {}

  async use(req: Request, res: Response, next: () => void) {
    const token = req.headers['x-token'];

    if (!token) {
      next();
      return;
    }

    let userInfo = {
      name: '',
      lastName: '',
      picture: '',
      role: '',
      email: '',
      phone_number: '',
      mongoId: '',
    };
    try {
      if (token.length === 9) {
        userInfo = {
          name: 'Pedro',
          lastName: 'Chofer',
          picture: '',
          role: 'JUN',
          email: 'pedrochofer@gmail.com',
          phone_number: '+5355657180',
          mongoId: '',
        };
      } else {
        const userId = token.slice(9, token.length);
        const userResp = await this.userRepository.getOne(userId);
        userInfo = {
          name: userResp.name,
          lastName: userResp.lastName,
          picture: '',
          email: userResp.email,
          role: userResp.role,
          phone_number: userResp.phone,
          mongoId: userResp._id.toString(),
        };
      }

      if (userInfo) {
        if (!userInfo.name)
          throw new ServiceUnavailableException('Please login again');

        const user: Partial<User> = {
          name: userInfo.name,
          lastName: userInfo.lastName,
          image: getDefaultImage(userInfo.name),
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
