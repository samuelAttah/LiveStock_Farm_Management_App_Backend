const User = require("../model/User");
const Batch = require("../model/Batch");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const getAllMortality = asyncHandler(async (req, res) => {
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
  return res.status(200).json(batch.mortality);
});

const createMortality = asyncHandler(async (req, res) => {
  const requestUser = req?.user;

  const { batchId } = req?.params;

  const { numberDead, deathReason, deathDate } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !numberDead || !deathReason || !deathDate) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  batch.mortality.push({ numberDead, deathReason, deathDate });

  const result = await batch.save();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error creating new mortality details" });
  }

  return res.status(200).json(result);
});

const deleteMortality = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId, mortalityId } = req?.params;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();
  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !mortalityId) {
    return res.status(400).json({ message: "Missing required Parameters" });
  }
  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  if (!batch?.mortality?.length) {
    return res.status(204).json({ message: "No Mortalities found" });
  }

  //convert mortalityId from string to ObjectId
  const convertedMortalityId = mongoose.Types.ObjectId(mortalityId);

  const result = await Batch.updateOne(
    { _id: batchId },
    { $pull: { mortality: { _id: convertedMortalityId } } }
  ).exec();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

const updateMortality = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId } = req?.params;

  const { mortalityId, numberDead, deathReason, deathDate } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !mortalityId || !numberDead || !deathReason || !deathDate) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  batch.mortality.id(mortalityId).numberDead = numberDead;
  batch.mortality.id(mortalityId).deathReason = deathReason;
  batch.mortality.id(mortalityId).deathDate = deathDate;

  const result = await batch.save();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

module.exports = {
  getAllMortality,
  createMortality,
  deleteMortality,
  updateMortality,
};
