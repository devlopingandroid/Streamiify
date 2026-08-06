import { body, param } from "express-validator";

export const registerValidator = [
  body("fullname").trim().notEmpty().withMessage("Full name is required"),

  body("username")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters"),

  body("email").isEmail().withMessage("Invalid email address"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),
];

export const resetPasswordValidator = [
  param("token").trim().notEmpty().withMessage("Invalid token"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Weak password: must be at least 8 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).+$/
    )
    .withMessage(
      "Weak password: must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
];
