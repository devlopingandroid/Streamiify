import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import commentRouter from "./routes/comment.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import watchRouter from "./routes/watch.routes.js";
import likeRouter from "./routes/like.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import watchLaterRouter from "./routes/watchLater.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import ApiError from "./utils/ApiError.js";
import mongoSanitize from "express-mongo-sanitize";
import recommendationRouter from "./routes/recommendation.routes.js";
import analyticsRouter from "./routes/analytics.routes.js";
import healthRouter from "./routes/health.routes.js";
import hpp from "hpp";
import { globalLimiter } from "./middlewares/rateLimiter.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";
const app = express();
app.disable("x-powered-by");
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(compression());
app.use(requestLogger);

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, postman, curl)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes("*") ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      // For local development, allow any localhost/127.0.0.1 origin
      if (
        process.env.NODE_ENV !== "production" &&
        (origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:"))
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(globalLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);
//app.use(mongoSanitize());

app.use(hpp());

app.use(cookieParser());
app.use(express.static("public"));
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/watch", watchRouter);
app.use("/likes", likeRouter);
app.use("/comments", commentRouter);
app.use("/subscriptions", subscriptionRouter);
app.use("/playlists", playlistRouter);
app.use("/watch-later", watchLaterRouter);
app.use("/notifications", notificationRouter);
app.use("/recommendations", recommendationRouter);
app.use("/analytics", analyticsRouter);
app.use("/health", healthRouter);
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

app.use(errorHandler);
export { app };
