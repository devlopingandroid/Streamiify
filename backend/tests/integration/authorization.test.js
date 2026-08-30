import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import {
  createUser,
  createVideo,
  createComment,
} from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";
import Video from "../../src/models/video.model.js";
import Comment from "../../src/models/comment.model.js";

describe("Integration — Authorization & Ownership Boundaries", () => {
  it("1. User A can modify their own video", async () => {
    const userA = await createUser();
    const videoA = await createVideo(userA._id);
    const headersA = getAuthHeaders(userA);

    const res = await request(app)
      .patch(`/videos/${videoA._id}`)
      .set(headersA)
      .field("title", "Updated Title by User A");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Updated Title by User A");

    const updatedDbVideo = await Video.findById(videoA._id);
    expect(updatedDbVideo.title).toBe("Updated Title by User A");
  });

  it("2. User B CANNOT modify User A's video (rejected with 403 Forbidden)", async () => {
    const userA = await createUser();
    const userB = await createUser();
    const videoA = await createVideo(userA._id);
    const headersB = getAuthHeaders(userB);

    const res = await request(app)
      .patch(`/videos/${videoA._id}`)
      .set(headersB)
      .field("title", "Malicious Title by User B");

    expect(res.status).toBe(403); // Forbidden
    expect(res.body.success).toBe(false);

    // Database state verification: Title remains unmodified in DB
    const dbVideo = await Video.findById(videoA._id);
    expect(dbVideo.title).toBe(videoA.title);
  });

  it("3. User B CANNOT delete User A's video (rejected with 403 Forbidden)", async () => {
    const userA = await createUser();
    const userB = await createUser();
    const videoA = await createVideo(userA._id);
    const headersB = getAuthHeaders(userB);

    const res = await request(app)
      .delete(`/videos/${videoA._id}`)
      .set(headersB);

    expect(res.status).toBe(403); // Forbidden
    expect(res.body.success).toBe(false);

    // Database verification: Video still exists in DB
    const dbVideo = await Video.findById(videoA._id);
    expect(dbVideo).not.toBeNull();
  });

  it("4. User B CANNOT update User A's comment (rejected with 403 Forbidden)", async () => {
    const userA = await createUser();
    const userB = await createUser();
    const video = await createVideo(userA._id);
    const commentA = await createComment(userA._id, video._id);
    const headersB = getAuthHeaders(userB);

    const res = await request(app)
      .patch(`/comments/${commentA._id}`)
      .set(headersB)
      .send({ content: "Malicious Comment Update by User B" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);

    const dbComment = await Comment.findById(commentA._id);
    expect(dbComment.content).toBe("This is a test comment");
  });

  it("5. User B CANNOT impersonate User A by sending User A's ID in request body", async () => {
    const userA = await createUser();
    const userB = await createUser();
    const headersB = getAuthHeaders(userB);

    const res = await request(app)
      .post("/videos")
      .set(headersB)
      .field("title", "Impersonation Video")
      .field("description", "Impersonation Description")
      .field("duration", 100)
      .field("status", "published")
      .field("owner", userA._id.toString()); // Client attempts body override

    if (res.status === 201) {
      expect(res.body.data.owner._id || res.body.data.owner).toBe(
        userB._id.toString()
      );
      const dbVideo = await Video.findById(res.body.data._id);
      expect(dbVideo.owner.toString()).toBe(userB._id.toString()); // Owner is User B, not User A!
    }
  });
});
