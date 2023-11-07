import { Controller, Req, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { SocketRepository } from './socket.repository';

@Controller()
@UseGuards(AuthenticationGuard)
export class SocketController {
  constructor(private socketRepository: SocketRepository) {}

  async getUsers(@Req() req): Promise<any> {
    return this.socketRepository.getUsers(req);
  }
}
