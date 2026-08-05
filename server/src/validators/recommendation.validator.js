import { query, param } from "express-validator";

const paginationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be an integer between 1 and 50")
    .toInt(),
];

const videoIdParamRules = [
  param("videoId")
    .isMongoId()
    .withMessage("videoId must be a valid MongoDB ObjectId"),
];

const validateHomeFeed = [...paginationRules];

const validateTrending = [...paginationRules];

const validateSimilarVideos = [...videoIdParamRules, ...paginationRules];

const validateSubscriptionFeed = [...paginationRules];

export default {
  validateHomeFeed,
  validateTrending,
  validateSimilarVideos,
  validateSubscriptionFeed,
};
