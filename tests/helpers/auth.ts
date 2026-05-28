import request from "supertest";
import { Application } from "express";
import User from "../../src/models/User";

export interface TestUser {
  token: string;
  userId: string;
  email: string;
}

export async function createVerifiedUser(
  app: Application,
  email: string,
  password: string,
  username: string
): Promise<TestUser> {
  await request(app)
    .post("/api/v1/user/sign-up")
    .send({ email, password, username })
    .expect(201);

  const user = await User.findOne({ email });
  await request(app)
    .post("/api/v1/user/verify")
    .send({
      email,
      verification_token: user?.verification_token,
    })
    .expect(200);

  const loginRes = await request(app)
    .post("/api/v1/user/login")
    .send({ email, password })
    .expect(200);

  return {
    token: loginRes.body.token,
    userId: loginRes.body.user.id,
    email,
  };
}
