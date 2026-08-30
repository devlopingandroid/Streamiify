import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const firstMessage = errorArray[0]?.msg || "Validation failed";
    return next(new ApiError(422, firstMessage, errorArray));
  }

  next();
};
