import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const redactPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.body.password",
  "req.body.confirmPassword",
  "req.body.accessToken",
  "req.body.refreshToken",
  "req.cookies.accessToken",
  "req.cookies.refreshToken",
  "authorization",
  "password",
  "accessToken",
  "refreshToken",
];

const logger = pino({
  level: isProduction ? "info" : "debug",

  redact: {
    paths: redactPaths,
    censor: "[REDACTED]",
  },

  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
});

export default logger;
