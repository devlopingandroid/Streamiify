import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import {
  createUser,
  createVideo,
  createComment,
} from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";
import Comment from "../../src/models/comment.model.js";

describe("Integration — Comment API", () => {
  it("1. Authenticated user can create comment on video", async () => {
    const author = await createUser();
    const video = await createVideo(author._id);
    const headers = getAuthHeaders(author);

    const res = await request(app)
      .post(`/comments/video/${video._id}`)
      .set(headers)
      .send({ content: "Great video!" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe("Great video!");

    // Database verification
    const dbComment = await Comment.findOne({
      video: video._id,
      owner: author._id,
    });
    expect(dbComment).not.toBeNull();
    expect(dbComment.content).toBe("Great video!");
  });

  it("2. Unauthenticated comment creation is rejected with 401 Unauthorized", async () => {
    const owner = await createUser();
    const video = await createVideo(owner._id);

    const res = await request(app)
      .post(`/comments/video/${video._id}`)
      .send({ content: "Unauthenticated comment" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("3. GET /comments/video/:videoId returns paginated comments with authentication", async () => {
    const author = await createUser();
    const video = await createVideo(author._id);
    await createComment(author._id, video._id, { content: "Comment 1" });
    await createComment(author._id, video._id, { content: "Comment 2" });
    const headers = getAuthHeaders(author);

    const res = await request(app)
      .get(`/comments/video/${video._id}?page=1&limit=10`)
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comments).toBeDefined();
    expect(res.body.data.comments.length).toBeGreaterThanOrEqual(2);
  });

  it("4. Comment owner can delete their own comment", async () => {
    const author = await createUser();
    const video = await createVideo(author._id);
    const comment = await createComment(author._id, video._id);
    const headers = getAuthHeaders(author);

    const res = await request(app)
      .delete(`/comments/${comment._id}`)
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const dbComment = await Comment.findById(comment._id);
    expect(dbComment).toBeNull(); // Deleted from DB!
  });
});
