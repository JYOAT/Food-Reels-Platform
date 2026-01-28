// jest.mock ImageKit so it doesn't actually call API
jest.mock("imagekit", () => {
  return jest.fn().mockImplementation(() => ({
    upload: jest.fn(),
    deleteFile: jest.fn(),
  }));
});

// Set required environment variables
process.env.JWT_SECRET = "testsecret";
process.env.IMAGEKIT_PUBLIC_KEY = "test";
process.env.IMAGEKIT_PRIVATE_KEY = "test";
process.env.IMAGEKIT_URL_ENDPOINT = "test";

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const foodPartnerModel = require("../models/foodpartner.model");
const foodModel = require("../models/food.model");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");

let mongoServer;
let token;
let foodPartnerId;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed a food partner
  const foodPartner = await foodPartnerModel.create({
    name: "Test Restaurant",
    email: "restaurant@test.com",
    password: "hashedpassword", // bcrypt not needed for GET tests
    phone: "9876543210",
    contactName: "John Manager",
    address: "Bangalore",
  });

  foodPartnerId = foodPartner._id;

  // Create a valid JWT token
  token = jwt.sign({ id: foodPartnerId }, process.env.JWT_SECRET);

  // Seed some food items for this partner
  await foodModel.create([
    { name: "Pizza", video: "pizza.mp4", foodPartner: foodPartnerId },
    { name: "Burger", video: "burger.mp4", foodPartner: foodPartnerId },
  ]);
});

afterAll(async () => {
  // Disconnect and stop in-memory MongoDB
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear only food items so we can reseed if needed
  await foodModel.deleteMany({});
});

describe("GET /api/food-partner/:id", () => {
  it("should block request if no token is provided", async () => {
    const res = await request(app).get(`/api/food-partner/${foodPartnerId}`);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Please login first");
  });

  it("should block request if token is invalid", async () => {
    const res = await request(app)
      .get(`/api/food-partner/${foodPartnerId}`)
      .set("Cookie", ["token=invalidtoken"]);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid token");
  });

  it("should return 404 if food partner does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/food-partner/${fakeId}`)
      .set("Cookie", [`token=${token}`]);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Food Partner not found");
  });

  it("should fetch food partner and their food items successfully", async () => {
    // Reseed food items so they exist for this test
    await foodModel.create([
      { name: "Pizza", video: "pizza.mp4", foodPartner: foodPartnerId },
      { name: "Burger", video: "burger.mp4", foodPartner: foodPartnerId },
    ]);

    const res = await request(app)
      .get(`/api/food-partner/${foodPartnerId}`)
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Food Partner fetched successfully");
    expect(res.body.foodPartner.name).toBe("Test Restaurant");
    expect(res.body.foodPartner.email).toBe("restaurant@test.com");
    expect(res.body.foodPartner.foodItems.length).toBe(2);
    expect(res.body.foodPartner.foodItems[0].name).toBeDefined();
  });
});
