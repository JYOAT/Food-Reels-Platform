const foodModel = require("../models/food.model");
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");
const storageService = require("../services/storage.service");
const { v4: uuid } = require("uuid");

async function createFood(req, res) {
  console.log(req.body);
  console.log(req.file);
  console.log(req.foodPartner);

  const fileUploadResult = await storageService.uploadFile(
    req.file.buffer,
    uuid()
  );

  const foodItem = await foodModel.create({
    name: req.body.name,
    description: req.body.description,
    video: fileUploadResult.url,
    foodPartner: req.foodPartner._id,
  });

  res
    .status(201)
    .json({ message: "Food created successfully", food: foodItem });

  res.json({ message: "Food created successfully" });
}

async function getFoodItems(req, res) {
  const foodItems = await foodModel.find({});
  res
    .status(200)
    .json({ message: "Food items fetched successfully", foodItems });
}

async function likeFood(req, res) {
  const { foodId } = req.body;
  const user = req.user;

  const isAlreadyLiked = await likeModel.findOne({
    user: req.user._id,
    food: foodId,
  });

  if (isAlreadyLiked) {
    await likeModel.deleteOne({
      user: req.user._id,
      food: foodId,
    });

    await foodModel.findByIdAndUpdate(foodId, {
      $inc: { likeCount: -1 },
    });
    return res.status(200).json({
      message: "Food unliked successfully",
    });
  }

  const like = await likeModel.create({
    user: req.user._id,
    food: foodId,
  });

  await foodModel.findByIdAndUpdate(foodId, {
    $inc: { likeCount: 1 },
  });

  res.status(201).json({ message: "Food liked successfully", like });
}

async function saveFood(req, res) {
  const { foodId } = req.body;
  const user = req.user;
  const isAlreadySaved = await saveModel.findOne({
    user: req.user._id,
    food: foodId,
  });

  if (isAlreadySaved) {
    await saveModel.deleteOne({
      user: req.user._id,
      food: foodId,
    });

    await foodModel.findByIdAndUpdate(foodId, {
      $inc: { saveCount: -1 },
    });

    return res.status(200).json({ message: "Food unsaved successfully" });
  }

  const save = await saveModel.create({
    user: req.user._id,
    food: foodId,
  });

  await foodModel.findByIdAndUpdate(foodId, {
    $inc: { saveCount: 1 },
  });

  res.status(201).json({ message: "Food saved successfully", save });
}

async function getSavedFoods(req, res) {
  const user = req.user;

  const savedFoods = await saveModel.find({ user: user._id }).populate("food");

  if (!savedFoods || savedFoods.length === 0) {
    return res
      .status(200)
      .json({ message: "No saved foods found", savedFoods: [] });
  }

  res
    .status(200)
    .json({ message: "Saved foods fetched successfully", savedFoods });
}
module.exports = {
  createFood,
  getFoodItems,
  likeFood,
  saveFood,
  getSavedFoods,
};
