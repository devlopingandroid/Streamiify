import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      statusCode: 429,
      success: false,
      message: "Too many requests. Please try again later.",
      errors: ["Too many requests. Please try again later."],
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      statusCode: 429,
      success: false,
      message: "Too many login attempts. Try again after 15 minutes.",
      errors: ["Too many login attempts. Try again after 15 minutes."],
    });
  },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      statusCode: 429,
      success: false,
      message:
        "Too many password reset requests. Please try again after 15 minutes.",
      errors: [
        "Too many password reset requests. Please try again after 15 minutes.",
      ],
    });
  },
});
