import { query, param, validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, errors.array()[0].msg);
  }
  next();
};

const paginationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be an integer between 1 and 50")
    .toInt(),
];

const videoIdParamRules = [
  param("videoId").isMongoId().withMessage("Invalid video ID"),
];

const validateHomeFeed = [...paginationRules, validate];

const validateTrending = [...paginationRules, validate];

const validateSimilarVideos = [
  ...videoIdParamRules,
  ...paginationRules,
  validate,
];

const validateSubscriptionFeed = [...paginationRules, validate];

export default {
  validateHomeFeed,
  validateTrending,
  validateSimilarVideos,
  validateSubscriptionFeed,
};
