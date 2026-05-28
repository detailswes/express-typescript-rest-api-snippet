import { randomInt } from "crypto";
import * as Bcrypt from "bcryptjs";
import { UnauthorizedError } from "../errors/AppError";

export class Utils {
  static readonly MAX_TOKEN_TIME_MS = 10 * 60 * 1000;

  static generateVerificationToken(digits = 6): number {
    return randomInt(10 ** (digits - 1), 10 ** digits);
  }

  static async encryptPassword(password: string): Promise<string> {
    return Bcrypt.hash(password, 12);
  }

  static async comparePassword(password: {
    plainPassword: string;
    encryptedPassword: string;
  }): Promise<boolean> {
    const { plainPassword, encryptedPassword } = password;
    const isSame = await Bcrypt.compare(plainPassword, encryptedPassword);
    if (!isSame) {
      throw new UnauthorizedError("User and password do not match");
    }
    return true;
  }
}
