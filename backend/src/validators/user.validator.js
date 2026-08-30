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

export const loginValidator = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Username cannot be empty"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1 })
    .withMessage("Password cannot be empty"),
  body().custom((value, { req }) => {
    if (!req.body.username && !req.body.email) {
      throw new Error("Username or email is required");
    }
    return true;
  }),
];

export const changePasswordValidator = [
  body("oldPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long"),
];

export const updateAccountValidator = [
  body("fullname")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Full name cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Full name cannot exceed 100 characters"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email address"),
];

export const usernameParamValidator = [
  param("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Invalid username"),
];
