const User = require("../model/User");
const Batch = require("../model/Batch");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const getAllHousing = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId } = req?.params;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId) {
    return res.status(400).json({ message: "batch Id is required" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser })
    .lean()
    .exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Paramter" });
  }
  return res.status(200).json(batch.housing);
});

const createHousing = asyncHandler(async (req, res) => {
  const requestUser = req?.user;

  const { batchId } = req?.params;

  const { housingType, cost, description, datePurchased } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !housingType || !cost || !description || !datePurchased) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  batch.housing.push({
    housingType: housingType,
    cost: cost,
    description: description,
    datePurchased: datePurchased,
  });

  const result = await batch.save();
  if (!result) {
    return res.status(400).json({ message: "Error creating new Housing" });
  }

  return res.status(200).json(result);
});

const deleteHousing = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId, housingId } = req?.params;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();
  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !housingId) {
    return res.status(400).json({ message: "Missing required Parameters" });
  }
  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  if (!batch?.housing?.length) {
    return res.status(204).json({ message: "No Housing found" });
  }

  //convert housingId from string to ObjectId
  const convertedHousingId = mongoose.Types.ObjectId(housingId);

  const result = await Batch.updateOne(
    { _id: batchId },
    { $pull: { housing: { _id: convertedHousingId } } }
  ).exec();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

const updateHousing = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId } = req?.params;

  const { housingId, housingType, cost, description, datePurchased } =
    req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !housingId || !housingType || !cost || !description) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  batch.housing.id(housingId).housingType = housingType;
  batch.housing.id(housingId).cost = cost;
  batch.housing.id(housingId).description = description;
  batch.housing.id(housingId).datePurchased = datePurchased;

  const result = await batch.save();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

module.exports = { getAllHousing, createHousing, deleteHousing, updateHousing };
