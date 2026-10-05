import assert from "node:assert/strict";
import test from "node:test";
import { canViewTestimony, toSafeTestimony, toSafeTestimonyUser, toSafeUser } from "./privacy";

test("public testimony responses omit account credentials", () => {
  const safe = toSafeUser({
    id: "u1",
    email: "user@example.com",
    passwordHash: "bcrypt-hash",
    googleId: "google-subject",
    notifyNewsletter: true,
  });

  assert.deepEqual(safe, {
    id: "u1",
    email: "user@example.com",
    notifyNewsletter: true,
  });
});

test("anonymous testimonies do not reveal the owner ID to other viewers", () => {
  const testimony = { userId: "owner", isAnonymous: true, title: "Story" };
  assert.equal(toSafeTestimony(testimony).userId, undefined);
  assert.equal(toSafeTestimony(testimony, "owner").userId, "owner");
});

test("anonymous testimonies do not include joined author details", () => {
  assert.equal(
    toSafeTestimonyUser(
      { id: "u1", firstName: "A", lastName: "B", profileImageUrl: null },
      true,
    ),
    undefined,
  );
});

test("testimony visibility allows public content and its owner only", () => {
  const privateStory = {
    userId: "owner",
    privacy: "private",
    videoUrl: null,
    moderationStatus: "approved",
  };
  assert.equal(canViewTestimony(privateStory), false);
  assert.equal(canViewTestimony(privateStory, "owner"), true);
});

test("public video testimonies require approval", () => {
  const videoStory = {
    userId: "owner",
    privacy: "public",
    videoUrl: "https://example.com/story.mp4",
    moderationStatus: "pending",
  };
  assert.equal(canViewTestimony(videoStory), false);
  assert.equal(canViewTestimony({ ...videoStory, moderationStatus: "approved" }), true);
  assert.equal(canViewTestimony({ ...videoStory, videoUrl: null }), true);
});
