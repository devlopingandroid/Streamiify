import { Router } from "express";

import {
  toggleWatchLater,
  removeWatchLater,
  getWatchLater,
  getWatchLaterStatus,
} from "../controllers/watchLater.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  validateVideoId,
  validatePagination,
} from "../validators/watchLater.validator.js";

const router = Router();

/**
 * ============================================================================
 * Watch Later Routes
 * Base URL:
 *
 * /api/v1/watch-later
 *
 * ============================================================================
 */

router.use(verifyJWT);

/* -------------------------------------------------------------------------- */
/*                               Watch Later List                             */
/* -------------------------------------------------------------------------- */

// GET /watch-later
router.get("/", validatePagination, getWatchLater);

/* -------------------------------------------------------------------------- */
/*                             Video Saved Status                             */
/* -------------------------------------------------------------------------- */

// GET /watch-later/:videoId/status
router.get("/:videoId/status", validateVideoId, getWatchLaterStatus);

/* -------------------------------------------------------------------------- */
/*                             Toggle Watch Later                             */
/* -------------------------------------------------------------------------- */

// POST /watch-later/:videoId
router.post("/:videoId", validateVideoId, toggleWatchLater);

/* -------------------------------------------------------------------------- */
/*                           Remove Watch Later                               */
/* -------------------------------------------------------------------------- */

// DELETE /watch-later/:videoId
router.delete("/:videoId", validateVideoId, removeWatchLater);

export default router;
