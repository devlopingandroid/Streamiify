import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { createUser, createVideo } from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";
import Playlist from "../../src/models/playlist.model.js";

describe("Integration — Playlist API", () => {
  it("1. Authenticated user can create playlist (creates document in DB)", async () => {
    const owner = await createUser();
    const headers = getAuthHeaders(owner);

    const res = await request(app).post("/playlists").set(headers).send({
      name: "My Favorite Music",
      description: "Best songs of 2026",
      visibility: "public",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("My Favorite Music");

    // Database verification
    const dbPlaylist = await Playlist.findById(res.body.data._id);
    expect(dbPlaylist).not.toBeNull();
    expect(dbPlaylist.name).toBe("My Favorite Music");
    expect(dbPlaylist.owner.toString()).toBe(owner._id.toString());
  });

  it("2. User can fetch their own playlists via GET /playlists/me", async () => {
    const owner = await createUser();
    const headers = getAuthHeaders(owner);

    await Playlist.create({
      name: "Playlist 1",
      description: "Desc 1",
      owner: owner._id,
    });

    const res = await request(app).get("/playlists/me").set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data).toBeDefined();
    expect(res.body.data.data.length).toBeGreaterThanOrEqual(1);
  });

  it("3. Playlist owner can add video to playlist", async () => {
    const owner = await createUser();
    const video = await createVideo(owner._id);
    const playlist = await Playlist.create({
      name: "Rock Hits",
      description: "Rock tracks",
      owner: owner._id,
      videos: [],
    });
    const headers = getAuthHeaders(owner);

    const res = await request(app)
      .post(`/playlists/${playlist._id}/videos/${video._id}`)
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Database verification
    const dbPlaylist = await Playlist.findById(playlist._id);
    expect(dbPlaylist.videos.map((v) => v.toString())).toContain(
      video._id.toString()
    );
  });

  it("4. Playlist owner can remove video from playlist", async () => {
    const owner = await createUser();
    const video = await createVideo(owner._id);
    const playlist = await Playlist.create({
      name: "Pop Hits",
      description: "Pop tracks",
      owner: owner._id,
      videos: [video._id],
    });
    const headers = getAuthHeaders(owner);

    const res = await request(app)
      .delete(`/playlists/${playlist._id}/videos/${video._id}`)
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const dbPlaylist = await Playlist.findById(playlist._id);
    expect(dbPlaylist.videos).not.toContain(video._id.toString());
  });

  it("5. User B CANNOT delete User A's playlist (rejected with 403 Forbidden)", async () => {
    const userA = await createUser();
    const userB = await createUser();
    const playlistA = await Playlist.create({
      name: "User A Playlist",
      description: "Private list",
      owner: userA._id,
    });
    const headersB = getAuthHeaders(userB);

    const res = await request(app)
      .delete(`/playlists/${playlistA._id}`)
      .set(headersB);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);

    // Database verification: Playlist still exists in DB
    const dbPlaylist = await Playlist.findById(playlistA._id);
    expect(dbPlaylist).not.toBeNull();
  });
});
