import { IUser } from "../interfaces/UserInterface";

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UserResponseDto {
  static from(user: IUser): UserResponse {
    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      verified: user.verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
