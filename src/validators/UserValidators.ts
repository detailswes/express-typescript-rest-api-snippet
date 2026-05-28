import { body } from "express-validator";
import { ValidationError } from "../errors/AppError";
import User from "../models/User";

export class UserValidators {
  static signUp() {
    return [
      body("email", "Email is required")
        .isEmail()
        .custom((email) => {
          return User.findOne({ email }).then((user) => {
            if (user) {
              throw new Error("User already exists");
            }
            return true;
          });
        }),
      body("password", "Password is required")
        .isLength({ min: 8, max: 128 })
        .withMessage("Password must be between 8 and 128 characters"),
      body("username", "Username is required").isString().trim().notEmpty(),
    ];
  }

  static verifyUser() {
    return [
      body("email", "Email is required").isEmail(),
      body("verification_token", "Verification token is required").isNumeric(),
    ];
  }

  static login() {
    return [
      body("email", "Email is required").isEmail(),
      body("password", "Password is required").notEmpty(),
    ];
  }

  static updatePassword() {
    return [
      body("current_password", "Current password is required").notEmpty(),
      body("confirm_password", "Confirm password is required").notEmpty(),
      body("new_password", "New password is required")
        .isLength({ min: 8, max: 128 })
        .custom((newPassword, { req }) => {
          if (newPassword === req.body.confirm_password) {
            return true;
          }
          throw new ValidationError(
            "New password and confirm password do not match."
          );
        }),
    ];
  }
}
