import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { Application } from "express";
import { createApp } from "../src/app";
import { connectDatabase, disconnectDatabase } from "../src/database";
import User from "../src/models/User";

describe("Auth API", () => {
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

  describe("POST /api/v1/user/sign-up", () => {
    it("creates a new user and returns safe fields only", async () => {
      const response = await request(app)
        .post("/api/v1/user/sign-up")
        .send({
          email: "user@example.com",
          password: "SecurePass1",
          username: "testuser",
        })
        .expect(201);

      expect(response.body).toMatchObject({
        email: "user@example.com",
        username: "testuser",
        verified: false,
      });
      expect(response.body.password).toBeUndefined();
      expect(response.body.verification_token).toBeUndefined();

      const user = await User.findOne({ email: "user@example.com" });
      expect(user).not.toBeNull();
      expect(user?.verified).toBe(false);
    });

    it("rejects duplicate email", async () => {
      await request(app)
        .post("/api/v1/user/sign-up")
        .send({
          email: "dup@example.com",
          password: "SecurePass1",
          username: "user1",
        })
        .expect(201);

      const response = await request(app)
        .post("/api/v1/user/sign-up")
        .send({
          email: "dup@example.com",
          password: "SecurePass2",
          username: "user2",
        })
        .expect(422);

      expect(response.body.message).toMatch(/already exists/i);
    });
  });

  describe("POST /api/v1/user/verify", () => {
    it("verifies user with valid OTP", async () => {
      await request(app)
        .post("/api/v1/user/sign-up")
        .send({
          email: "verify@example.com",
          password: "SecurePass1",
          username: "verifyuser",
        });

      const user = await User.findOne({ email: "verify@example.com" });
      const token = user?.verification_token;

      const response = await request(app)
        .post("/api/v1/user/verify")
        .send({
          email: "verify@example.com",
          verification_token: token,
        })
        .expect(200);

      expect(response.body.verified).toBe(true);
      expect(response.body.password).toBeUndefined();
    });

    it("rejects expired or invalid OTP", async () => {
      await request(app)
        .post("/api/v1/user/sign-up")
        .send({
          email: "bad@example.com",
          password: "SecurePass1",
          username: "baduser",
        });

      const response = await request(app)
        .post("/api/v1/user/verify")
        .send({
          email: "bad@example.com",
          verification_token: 999999,
        })
        .expect(422);

      expect(response.body.message).toMatch(/expired/i);
      expect(response.body.status_code).toBe(422);
    });
  });

  describe("POST /api/v1/user/login", () => {
    it("returns JWT for verified user with correct password", async () => {
      await request(app)
        .post("/api/v1/user/sign-up")
        .send({
          email: "login@example.com",
          password: "SecurePass1",
          username: "loginuser",
        });

      const user = await User.findOne({ email: "login@example.com" });
      await request(app)
        .post("/api/v1/user/verify")
        .send({
          email: "login@example.com",
          verification_token: user?.verification_token,
        });

      const response = await request(app)
        .post("/api/v1/user/login")
        .send({
          email: "login@example.com",
          password: "SecurePass1",
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe("login@example.com");
      expect(response.body.user.password).toBeUndefined();
    });

    it("rejects login for unverified user", async () => {
      await request(app)
        .post("/api/v1/user/sign-up")
        .send({
          email: "unverified@example.com",
          password: "SecurePass1",
          username: "unverified",
        });

      const response = await request(app)
        .post("/api/v1/user/login")
        .send({
          email: "unverified@example.com",
          password: "SecurePass1",
        })
        .expect(422);

      expect(response.body.message).toMatch(/verify your email/i);
    });
  });

  describe("PATCH /api/v1/user/update/password", () => {
    it("updates password when authenticated", async () => {
      await request(app)
        .post("/api/v1/user/sign-up")
        .send({
          email: "pass@example.com",
          password: "OldPass123",
          username: "passuser",
        });

      const user = await User.findOne({ email: "pass@example.com" });
      await request(app)
        .post("/api/v1/user/verify")
        .send({
          email: "pass@example.com",
          verification_token: user?.verification_token,
        });

      const loginRes = await request(app)
        .post("/api/v1/user/login")
        .send({
          email: "pass@example.com",
          password: "OldPass123",
        });

      const token = loginRes.body.token;

      const response = await request(app)
        .patch("/api/v1/user/update/password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          current_password: "OldPass123",
          new_password: "NewPass456",
          confirm_password: "NewPass456",
        })
        .expect(200);

      expect(response.body.email).toBe("pass@example.com");

      await request(app)
        .post("/api/v1/user/login")
        .send({
          email: "pass@example.com",
          password: "NewPass456",
        })
        .expect(200);
    });

    it("rejects unauthenticated password update", async () => {
      const response = await request(app)
        .patch("/api/v1/user/update/password")
        .send({
          current_password: "OldPass123",
          new_password: "NewPass456",
          confirm_password: "NewPass456",
        })
        .expect(401);

      expect(response.body.status_code).toBe(401);
    });
  });
});
