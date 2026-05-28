import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Application } from "express";
import { createApp } from "../src/app";
import { connectDatabase, disconnectDatabase } from "../src/database";
import { createVerifiedUser } from "./helpers/auth";

describe("Comment API", () => {
  let mongoServer: MongoMemoryServer;
  let app: Application;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connectDatabase(mongoServer.getUri());
    app = createApp();
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  it("adds a comment to a post", async () => {
    const user = await createVerifiedUser(
      app,
      "commenter@example.com",
      "SecurePass1",
      "commenter"
    );

    const post = await request(app)
      .post("/api/v1/post/add")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "Post with comments" });

    const response = await request(app)
      .post(`/api/v1/comment/add/${post.body._id}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "Nice post!" })
      .expect(200);

    expect(response.body.comments).toHaveLength(1);
  });

  it("allows owner to edit their comment", async () => {
    const user = await createVerifiedUser(
      app,
      "editcomment@example.com",
      "SecurePass1",
      "editcomment"
    );

    const post = await request(app)
      .post("/api/v1/post/add")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "Post" });

    const withComment = await request(app)
      .post(`/api/v1/comment/add/${post.body._id}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "Original comment" });

    const commentId = withComment.body.comments[0];

    const response = await request(app)
      .patch(`/api/v1/comment/edit/${commentId}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "Edited comment" })
      .expect(200);

    expect(response.body.content).toBe("Edited comment");
  });

  it("forbids another user from editing a comment", async () => {
    const owner = await createVerifiedUser(
      app,
      "cowner@example.com",
      "SecurePass1",
      "cowner"
    );
    const other = await createVerifiedUser(
      app,
      "cother@example.com",
      "SecurePass1",
      "cother"
    );

    const post = await request(app)
      .post("/api/v1/post/add")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ content: "Post" });

    const withComment = await request(app)
      .post(`/api/v1/comment/add/${post.body._id}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ content: "Owner comment" });

    const commentId = withComment.body.comments[0];

    const response = await request(app)
      .patch(`/api/v1/comment/edit/${commentId}`)
      .set("Authorization", `Bearer ${other.token}`)
      .send({ content: "Stolen edit" })
      .expect(403);

    expect(response.body.message).toMatch(/do not own/i);
  });

  it("forbids another user from deleting a comment", async () => {
    const owner = await createVerifiedUser(
      app,
      "cdelowner@example.com",
      "SecurePass1",
      "cdelowner"
    );
    const other = await createVerifiedUser(
      app,
      "cdelother@example.com",
      "SecurePass1",
      "cdelother"
    );

    const post = await request(app)
      .post("/api/v1/post/add")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ content: "Post" });

    const withComment = await request(app)
      .post(`/api/v1/comment/add/${post.body._id}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ content: "Delete me" });

    const commentId = withComment.body.comments[0];

    await request(app)
      .delete(`/api/v1/comment/delete/${commentId}`)
      .set("Authorization", `Bearer ${other.token}`)
      .expect(403);
  });

  it("allows owner to delete their comment", async () => {
    const user = await createVerifiedUser(
      app,
      "cdel@example.com",
      "SecurePass1",
      "cdel"
    );

    const post = await request(app)
      .post("/api/v1/post/add")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "Post" });

    const withComment = await request(app)
      .post(`/api/v1/comment/add/${post.body._id}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "Temporary" });

    const commentId = withComment.body.comments[0];

    await request(app)
      .delete(`/api/v1/comment/delete/${commentId}`)
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);
  });
});
