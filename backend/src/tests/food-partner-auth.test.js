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

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const foodPartnerModel = require("../models/foodpartner.model");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  await foodPartnerModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /api/auth/food-partner/register", () => {
  it("should register a food partner successfully", async () => {
    const res = await request(app)
      .post("/api/auth/food-partner/register")
      .send({
        name: "Test Restaurant",
        email: "restaurant@test.com",
        password: "password123",
        phone: "9876543210",
        contactName: "John Manager",
        address: "Bangalore",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Food Partner registered successfully");
    expect(res.body.foodPartner.email).toBe("restaurant@test.com");
    expect(res.body.foodPartner.name).toBe("Test Restaurant");
  });

  it("should not allow duplicate food partner registration", async () => {
    await request(app).post("/api/auth/food-partner/register").send({
      name: "Test Restaurant",
      email: "restaurant@test.com",
      password: "password123",
      phone: "9876543210",
      contactName: "John Manager",
      address: "Bangalore",
    });

    const res = await request(app)
      .post("/api/auth/food-partner/register")
      .send({
        name: "Test Restaurant",
        email: "restaurant@test.com",
        password: "password123",
        phone: "9876543210",
        contactName: "John Manager",
        address: "Bangalore",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Food Partner already registered");
  });
});

describe("POST /api/auth/food-partner/login", () => {
  beforeAll(async () => {
    await request(app).post("/api/auth/food-partner/register").send({
      name: "Test Restaurant",
      email: "restaurant@test.com",
      password: "password123",
      phone: "9876543210",
      contactName: "John Manager",
      address: "Bangalore",
    });
  });

  it("should login food partner with correct credentials", async () => {
    const res = await request(app).post("/api/auth/food-partner/login").send({
      email: "restaurant@test.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Food Partner logged in successfully");
    expect(res.body.foodPartner.email).toBe("restaurant@test.com");
  });

  it("should not login with wrong password", async () => {
    const res = await request(app).post("/api/auth/food-partner/login").send({
      email: "restaurant@test.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Wrong email or password");
  });

  it("should not login with wrong email", async () => {
    const res = await request(app).post("/api/auth/food-partner/login").send({
      email: "wrong@test.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Wrong email or password");
  });
});

describe("GET /api/auth/food-partner/logout", () => {
  it("should logout food partner successfully", async () => {
    const res = await request(app).get("/api/auth/food-partner/logout");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Food Partner logged out successfully");
  });
});
