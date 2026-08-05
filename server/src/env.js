import dotenv from "dotenv";
import { cleanEnv, str, port, bool } from "envalid";

dotenv.config({
  path: "./.env",
});

export default cleanEnv(process.env, {
  NODE_ENV: str({
    default: "development",
    choices: ["development", "production", "test"],
  }),

  PORT: port(),

  MONGO_URI: str(),

  ACCESS_TOKEN_SECRET: str(),
  ACCESS_TOKEN_EXPIRE: str(),

  REFRESH_TOKEN_SECRET: str(),
  REFRESH_TOKEN_EXPIRE: str(),

  CLOUDINARY_CLOUD_NAME: str(),
  CLOUDINARY_API_KEY: str(),
  CLOUDINARY_API_SECRET: str(),

REDIS_URL: str({
  default: "",
}),

  CORS_ORIGIN: str(),

  MAX_VIDEO_SIZE: str(),

ENABLE_REDIS: bool({
  default: false,
}),
  RESEND_API_KEY: str({
    default: "",
  }),

  FRONTEND_URL: str({
    default: "http://localhost:3000",
  }),

  EMAIL_FROM: str({
    default: "Streamify <onboarding@resend.dev>",
  }),
});
