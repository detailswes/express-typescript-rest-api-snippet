import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Application } from "express";
import { createApp } from "../src/app";
import { connectDatabase, disconnectDatabase } from "../src/database";
import { createVerifiedUser } from "./helpers/auth";

describe("Post API", () => {
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

  it("creates a post for authenticated user", async () => {
    const user = await createVerifiedUser(
      app,
      "poster@example.com",
      "SecurePass1",
      "poster"
    );

    const response = await request(app)
      .post("/api/v1/post/add")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "My first post" })
      .expect(200);

    expect(response.body.content).toBe("My first post");
    expect(response.body.user_id).toBeDefined();
  });

  it("lists posts for the authenticated user with pagination", async () => {
    const user = await createVerifiedUser(
      app,
      "lister@example.com",
      "SecurePass1",
      "lister"
    );

    await request(app)
      .post("/api/v1/post/add")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "Post one" });

    const response = await request(app)
      .get("/api/v1/post/me?page=1&limit=10")
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination.total).toBe(1);
  });

  it("allows owner to edit their post", async () => {
    const user = await createVerifiedUser(
      app,
      "editor@example.com",
      "SecurePass1",
      "editor"
    );

    const created = await request(app)
      .post("/api/v1/post/add")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "Original" });

    const postId = created.body._id;

    const response = await request(app)
      .patch(`/api/v1/post/edit/${postId}`)
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "Updated content" })
      .expect(200);

    expect(response.body.content).toBe("Updated content");
  });

  it("forbids another user from editing a post", async () => {
    const owner = await createVerifiedUser(
      app,
      "owner@example.com",
      "SecurePass1",
      "owner"
    );
    const other = await createVerifiedUser(
      app,
      "other@example.com",
      "SecurePass1",
      "other"
    );

    const created = await request(app)
      .post("/api/v1/post/add")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ content: "Owner post" });

    const response = await request(app)
      .patch(`/api/v1/post/edit/${created.body._id}`)
      .set("Authorization", `Bearer ${other.token}`)
      .send({ content: "Hacked" })
      .expect(403);

    expect(response.body.message).toMatch(/do not own/i);
  });

  it("forbids another user from deleting a post", async () => {
    const owner = await createVerifiedUser(
      app,
      "delowner@example.com",
      "SecurePass1",
      "delowner"
    );
    const other = await createVerifiedUser(
      app,
      "delother@example.com",
      "SecurePass1",
      "delother"
    );

    const created = await request(app)
      .post("/api/v1/post/add")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ content: "To delete" });

    await request(app)
      .delete(`/api/v1/post/delete/${created.body._id}`)
      .set("Authorization", `Bearer ${other.token}`)
      .expect(403);
  });

  it("allows owner to delete their post", async () => {
    const user = await createVerifiedUser(
      app,
      "deleter@example.com",
      "SecurePass1",
      "deleter"
    );

    const created = await request(app)
      .post("/api/v1/post/add")
      .set("Authorization", `Bearer ${user.token}`)
      .send({ content: "Delete me" });

    await request(app)
      .delete(`/api/v1/post/delete/${created.body._id}`)
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);
  });
});
