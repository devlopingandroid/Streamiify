import { param, query, validationResult } from "express-validator";
import { Types } from "mongoose";
import ApiError from "../utils/ApiError.js";
/**
 * ============================================================================
 * Common Validation Handler
 * ============================================================================
 */

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(422, errors.array()[0].msg);
  }

  next();
};

/**
 * ============================================================================
 * Validate Notification ID
 * ============================================================================
 */

export const validateNotificationId = [
  param("notificationId").custom((value) => {
    if (!Types.ObjectId.isValid(value)) {
      throw new Error("Invalid notification id.");
    }

    return true;
  }),

  validate,
];

/**
 * ============================================================================
 * Validate Pagination
 * ============================================================================
 */

export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be greater than 0.")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50.")
    .toInt(),

  validate,
];
