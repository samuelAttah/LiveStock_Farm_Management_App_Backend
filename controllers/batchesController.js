const Batch = require("../model/Batch");
const User = require("../model/User");
const asyncHandler = require("express-async-handler");
const { request } = require("express");

//GET ALL BATCHES
// @desc Get all User Batches
// @route GET /batches
// @access Private

const getAllBatches = asyncHandler(async (req, res) => {
  const user = req.user;
  const foundUser = await User.findOne({ username: user }).lean().exec();

  if (!foundUser) {
    return res.status(401).json({ message: "User not recognized" });
  }

  const batches = await Batch.find({ user: foundUser.username })
    .select("-user")
    .lean()
    .exec();

  res.status(200).json(batches);
});

//CREATE NEW BATCH
// @desc Create new User Batch
// @route POST /batches
// @access Private
const createBatch = asyncHandler(async (req, res) => {
  const requestUser = req.user;
  const { animalType, numberPurchased, costPerUnit, currency, batchTitle } =
    req?.body;

  const foundUser = await User.findOne({ username: requestUser }).lean().exec();

  if (!foundUser) {
    return res.status(401).json({ message: "User not recognized" });
  }

  if (
    !animalType ||
    !numberPurchased ||
    !costPerUnit ||
    !currency ||
    !batchTitle
  ) {
    return res.status(400).json({ message: "Missing Required fields" });
  }
  const batches = await Batch.find({ user: foundUser.username }).lean().exec();

  const batchNumber = batches?.length
    ? batches[batches?.length - 1].batchNumber + 1
    : 1;
  const totalPurchaseCost = numberPurchased * costPerUnit;

  const batch = await Batch.create({
    user: foundUser.username,
    batchNumber,
    batchTitle,
    animalType,
    numberPurchased,
    costPerUnit,
    currency,
    totalPurchaseCost,
  });

  if (batch) {
    //created
    res.status(201).json(batch);
  } else {
    res.status(400).json({ message: "Invalid Data" });
  }
});

//UPDATE BATCH
// @desc Delete a Batch
// @route DELETE /batches
// @access Private

const updateBatch = asyncHandler(async (req, res) => {
  const requestUser = req.user;
  const {
    id,
    animalType,
    numberPurchased,
    costPerUnit,
    currency,
    batchTitle,
    isActive,
  } = req?.body;

  if (!id) {
    return res.status(400).json({ message: "Batch ID parameter is required" });
  }

  const match = await User.findOne({ username: requestUser }).lean().exec();

  if (!match) {
    return res.status(401).json({ message: "Invalid User" });
  }

  const batch = await Batch.findOne({ _id: id, user: requestUser }).exec();
  if (!batch) {
    return res.status(400).json({ message: "Invalid Batch Id or User" });
  }

  if (!Number(req?.body?.batchNumber) === batch.batchNumber) {
    res.status(400).json({ message: "batchNumber Can't be Changed" });
  }

  batch.animalType = animalType ? animalType : batch.animalType;
  batch.numberPurchased = numberPurchased
    ? numberPurchased
    : batch.numberPurchased;
  batch.costPerUnit = costPerUnit ? costPerUnit : batch.costPerUnit;
  batch.currency = currency ? currency : batch.currency;
  batch.batchTitle = batchTitle ? batchTitle : batch.batchTitle;
  batch.isActive = isActive ? isActive : batch.isActive;

  const result = await batch.save();
  if (result) {
    res.status(200).json(result);
  } else {
    res.status(500);
  }
});

//DELETE BATCH
// @desc Delete a Batch
// @route DELETE /batches
// @access Private

const deleteBatch = asyncHandler(async (req, res) => {
  const requestUser = req.user;
  const { id } = req?.body;
  if (!id) {
    res.status(400).json({ message: "Batch Id parameter is Required" });
  }
  const batch = await Batch.findOne({ _id: id, user: requestUser })
    .lean()
    .exec();
  if (!batch) {
    res
      .status(404)
      .json({ message: `batch id ${id} does not exist for this user` });
  }
  const result = await Batch.deleteOne({ _id: id });

  if (result) {
    res.json(result);
  } else {
    res.status(500);
  }
});

//GET BATCH
// @desc Get Batch
// @route GET /batches
// @access Private
const getBatch = asyncHandler(async (req, res) => {
  const requestUser = req.user;
  const { id } = req?.params;

  const match = await User.findOne({ username: requestUser }).lean().exec();

  if (!match) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  if (!id) {
    return res.status(400).json({ message: "Batch Id is required" });
  }

  const result = await Batch.findOne({ _id: id, user: requestUser })
    .lean()
    .exec();

  if (!result) {
    return res.status(400).json({ message: "Invalid Parameter" });
  }

  return res.status(200).json(result);
});

module.exports = {
  getAllBatches,
  createBatch,
  deleteBatch,
  getBatch,
  updateBatch,
};
