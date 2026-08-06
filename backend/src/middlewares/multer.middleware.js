import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "../utils/ApiError.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), "public", "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    cb(null, tempDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const fileName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    cb(null, `${fileName}-${uniqueSuffix}${extension}`);
  },
});

const imageFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowed.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new ApiError(415), false);
};

const videoFileFilter = (req, file, cb) => {
  if (file.fieldname === "thumbnail") {
    return imageFileFilter(req, file, cb);
  }

  const allowed = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
  ];

  if (allowed.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new ApiError(415, "Only MP4, WEBM, MOV, AVI and MKV videos are allowed."),
    false
  );
};

/* ============================================================================
   IMAGE UPLOAD
============================================================================ */

const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: imageFileFilter,
});

/* ============================================================================
   VIDEO UPLOAD
============================================================================ */

const uploadVideo = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_VIDEO_SIZE), // 200 MB
  },
  fileFilter: videoFileFilter,
});
/* ============================================================================
   Backward Compatibility
   Existing user routes using upload.fields(...) will continue to work.
============================================================================ */

export const upload = uploadImage;

/* ============================================================================
   Ready-to-use Upload Middlewares
============================================================================ */

// Registration
export const uploadUserFiles = uploadImage.fields([
  {
    name: "avatar",
    maxCount: 1,
  },
  {
    name: "coverImage",
    maxCount: 1,
  },
]);

// Avatar Update
export const uploadAvatar = uploadImage.single("avatar");

// Cover Update
export const uploadCover = uploadImage.single("coverImage");

// Thumbnail Update
export const uploadSingleImage = uploadImage.single("thumbnail");

// Video Publish
export const uploadVideoFiles = uploadVideo.fields([
  {
    name: "videoFile",
    maxCount: 1,
  },
  {
    name: "thumbnail",
    maxCount: 1,
  },
]);
