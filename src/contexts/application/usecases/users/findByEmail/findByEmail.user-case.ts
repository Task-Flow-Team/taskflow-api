import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User4Token } from '@/contexts/domain/models/';
import { UserRepository } from '@/contexts/domain/repositories/';

@Injectable()
export class FindByEmailUseCase {
  constructor(@Inject('userRepository') private readonly userRepository: UserRepository) {}

  async run(email: string): Promise<User4Token> {
    if (!email) {
      throw new NotFoundException('Email is required to find the user');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return {
      id: user.id,
      email: user.email,
    };
  }
}
