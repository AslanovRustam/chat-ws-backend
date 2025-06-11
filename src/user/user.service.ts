import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({
        email: createUserDto.email,
      });

      if (existingUser) {
        throw new ConflictException(
          `User with email "${createUserDto.email}" already exists`,
        );
      }

      const createdUser = new this.userModel(createUserDto);
      await createdUser.save();

      if (!createUserDto.email) {
        throw new Error('Email is required to find the user');
      }

      return await this.findOneByEmail(createUserDto.email);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        throw new NotFoundException(`User with email:"${email}" not found`);
      }

      return user.toJSON();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch user by email');
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ id }).exec();
      if (!user) {
        throw new NotFoundException(`User with id:"${id}" not found`);
      }

      return user.toJSON();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch user by id');
    }
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        updateUserDto,
        {
          new: true,
        },
      );

      if (!user) throw new NotFoundException('User not found');

      return user.toJSON();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findByIdAndDelete(id).exec();

      if (!user)
        return {
          message: `Something went wrong, User with id:${id} not deleted`,
        };

      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
