jest.mock("imagekit", () => {
  return jest.fn().mockImplementation(() => {
    return {
      upload: jest.fn(),
      deleteFile: jest.fn(),
    };
  });
});

// ENV FIRST
process.env.JWT_SECRET = "testsecret";
process.env.IMAGEKIT_PUBLIC_KEY = "test";
process.env.IMAGEKIT_PRIVATE_KEY = "test";
process.env.IMAGEKIT_URL_ENDPOINT = "test";

const app = require("../app");
const request = require("supertest");
const mongoose = require("mongoose");
const userModel = require("../models/user.model");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await userModel.deleteMany({});
});

describe("POST /api/auth/user/register", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/user/register").send({
      fullName: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe("User registered successfully");
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.user.fullName).toBe("Test User");
  });
  it("should not register a user with existing email", async () => {
    await request(app).post("/api/auth/user/register").send({
      fullName: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/user/register").send({
      fullName: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe("User already registered");
  });
});

describe("POST /api/auth/user/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/user/register").send({
      fullName: "Test User",
      email: "test@example.com",
      password: "password123",
    });
  });

  it("should login user with correct credentials", async () => {
    const res = await request(app).post("/api/auth/user/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User logged in successfully");
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("should not login user with incorrect password", async () => {
    const res = await request(app).post("/api/auth/user/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Wrong email or password");
  });

  it("should not login with wrong email", async () => {
    const res = await request(app).post("/api/auth/user/login").send({
      email: "wrong@example.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Wrong email or password");
  });
});

describe("GET /api/auth/user/logout", () => {
  it("should logout the user successfully", async () => {
    const res = await request(app).get("/api/auth/user/logout");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User logged out successfully");
  });
});
