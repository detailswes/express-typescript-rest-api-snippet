import User from "../models/User";
import { IUser } from "../interfaces/UserInterface";

export interface CreateUserData {
  email: string;
  password: string;
  username: string;
  verification_token: number;
  verification_token_time: Date;
}

export class UserRepository {
  static findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  static findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  static create(data: CreateUserData): Promise<IUser> {
    return new User(data).save();
  }

  static verifyUser(
    email: string,
    verificationToken: number
  ): Promise<IUser | null> {
    return User.findOneAndUpdate(
      {
        email,
        verification_token: verificationToken,
        verification_token_time: { $gt: new Date() },
      },
      {
        verified: true,
        verification_token: null,
        verification_token_time: null,
      },
      { new: true }
    ).exec();
  }

  static updatePassword(
    userId: string,
    hashedPassword: string
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    ).exec();
  }
}
