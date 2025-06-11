import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async create(
    createAuthDto: CreateAuthDto,
  ): Promise<{ access_token: string }> {
    try {
      const user = await this.userService.findOneByEmail(createAuthDto.email);
      if (user?.password !== createAuthDto.password) {
        throw new UnauthorizedException();
      }

      const payload = { sub: user.userId, username: user.username };
      const token = await this.jwtService.signAsync(payload);
      return { access_token: token };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create access token');
    }
  }
}
