import * as Jwt from "jsonwebtoken";
import { config } from "../config/env";
import { UserResponseDto } from "../dto/UserResponseDto";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors/AppError";
import { UserRepository } from "../repositories/user.repository";
import { Utils } from "../utils/Utils";
import { EmailService } from "./email.service";

export interface SignUpInput {
  email: string;
  password: string;
  username: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdatePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  static async signUp(input: SignUpInput) {
    const verificationToken = Utils.generateVerificationToken();
    const hash = await Utils.encryptPassword(input.password);

    const user = await UserRepository.create({
      email: input.email,
      password: hash,
      username: input.username,
      verification_token: verificationToken,
      verification_token_time: new Date(Date.now() + Utils.MAX_TOKEN_TIME_MS),
    });

    EmailService.queueVerificationEmail(input.email, verificationToken);

    return UserResponseDto.from(user);
  }

  static async verifyUser(email: string, verificationToken: number) {
    const user = await UserRepository.verifyUser(email, verificationToken);

    if (!user) {
      throw new ValidationError(
        "Verification token is expired. Please request a new one."
      );
    }

    return UserResponseDto.from(user);
  }

  static async login(input: LoginInput) {
    const user = await UserRepository.findByEmail(input.email);

    if (!user) {
      throw new ValidationError("Email does not exist");
    }

    if (!user.verified) {
      throw new ValidationError("Please verify your email.");
    }

    try {
      await Utils.comparePassword({
        plainPassword: input.password,
        encryptedPassword: user.password,
      });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw new UnauthorizedError("User and password do not match");
      }
      throw error;
    }

    const token = Jwt.sign(
      { user_id: user._id.toString(), email: input.email },
      config.jwtSecret,
      { expiresIn: 60 * 60 }
    );

    return {
      token,
      user: UserResponseDto.from(user),
    };
  }

  static async updatePassword(input: UpdatePasswordInput) {
    const user = await UserRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await Utils.comparePassword({
      plainPassword: input.currentPassword,
      encryptedPassword: user.password,
    });

    const encryptedPassword = await Utils.encryptPassword(input.newPassword);
    const updatedUser = await UserRepository.updatePassword(
      input.userId,
      encryptedPassword
    );

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return UserResponseDto.from(updatedUser);
  }
}
