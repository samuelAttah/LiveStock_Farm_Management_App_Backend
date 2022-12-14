const User = require("../model/User");
const Batch = require("../model/Batch");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const getAllRevenues = asyncHandler(async (req, res) => {
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
  return res.status(200).json(batch.revenue);
});

const createRevenue = asyncHandler(async (req, res) => {
  const requestUser = req?.user;

  const { batchId } = req?.params;

  const { itemSold, numberSold, costPerUnit, dateSold } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !itemSold || !numberSold || !costPerUnit || !dateSold) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  const totalCost = costPerUnit * numberSold;

  batch.revenue.push({
    itemSold,
    numberSold,
    costPerUnit,
    totalCost,
    dateSold,
  });

  const result = await batch.save();

  if (!result) {
    return res.status(400).json({ message: "Error creating new deaths" });
  }

  return res.status(200).json(result);
});

const deleteRevenue = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId, revenueId } = req?.params;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();
  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  if (!batchId) {
    return res.status(400).json({ message: "Missing batchId" });
  }
  if (!revenueId) {
    return res.status(400).json({ message: "Missing revenueId" });
  }
  const batch = await Batch.findOne({
    _id: batchId.toString(),
    user: requestUser,
  }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  if (!batch?.revenue?.length) {
    return res.status(204).json({ message: "No Revenues found" });
  }

  //convert revenueId from string to ObjectId
  const convertedRevenueId = mongoose.Types.ObjectId(revenueId);

  const result = await Batch.updateOne(
    { _id: batchId },
    { $pull: { revenue: { _id: convertedRevenueId } } }
  ).exec();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

const updateRevenue = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId } = req?.params;

  const { revenueId, itemSold, numberSold, costPerUnit, dateSold } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (
    !batchId ||
    !revenueId ||
    !itemSold ||
    !numberSold ||
    !costPerUnit ||
    !dateSold
  ) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  batch.revenue.id(revenueId).itemSold = itemSold;
  batch.revenue.id(revenueId).numberSold = numberSold;
  batch.revenue.id(revenueId).costPerUnit = costPerUnit;
  batch.revenue.id(revenueId).dateSold = dateSold;
  batch.revenue.id(revenueId).totalCost = costPerUnit * numberSold;

  const result = await batch.save();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

module.exports = {
  getAllRevenues,
  createRevenue,
  deleteRevenue,
  updateRevenue,
};
