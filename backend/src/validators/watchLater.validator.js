import { param, query, validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

/**
 * ============================================================================
 * Validation Middleware
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
 * Video ID Validation
 * ============================================================================
 */

const validateVideoId = [
  param("videoId").isMongoId().withMessage("Invalid video ID"),

  validate,
];

/**
 * ============================================================================
 * Pagination Validation
 * ============================================================================
 */

const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50")
    .toInt(),

  validate,
];

export { validateVideoId, validatePagination };
