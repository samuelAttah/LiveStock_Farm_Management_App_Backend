const User = require("../model/User");
const Batch = require("../model/Batch");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const getAllDrugs = asyncHandler(async (req, res) => {
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
  return res.status(200).json(batch.drugs);
});

const createDrug = asyncHandler(async (req, res) => {
  const requestUser = req?.user;

  const { batchId } = req?.params;

  const { drugName, purchaseReason, cost, datePurchased } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!drugName || !cost || !datePurchased) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  batch.drugs.push({
    drugName: drugName,
    purchaseReason: purchaseReason,
    cost: cost,
    datePurchased: datePurchased,
  });

  const result = await batch.save();

  if (!result) {
    return res.status(400).json({ message: "Error creating new drug" });
  }

  return res.status(200).json(result);
});

const deleteDrug = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId, drugId } = req?.params;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();
  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !drugId) {
    return res.status(400).json({ message: "Missing required Parameters" });
  }
  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  if (!batch?.drugs?.length) {
    return res.status(204).json({ message: "No Drugs found" });
  }

  //convert drugId from string to ObjectId
  const convertedDrugId = mongoose.Types.ObjectId(drugId);

  const result = Batch.updateOne(
    { _id: batchId },
    { $pull: { drugs: { _id: convertedDrugId } } }
  ).exec();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

const updateDrug = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId } = req?.params;

  const { drugId, drugName, purchaseReason, cost, datePurchased } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (
    !batchId ||
    !drugId ||
    !drugName ||
    !purchaseReason ||
    !cost ||
    !datePurchased
  ) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  batch.drugs.id(drugId).drugName = drugName;
  batch.drugs.id(drugId).purchaseReason = purchaseReason;
  batch.drugs.id(drugId).cost = cost;
  batch.drugs.id(drugId).datePurchased = datePurchased;

  const result = await batch.save();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

module.exports = { getAllDrugs, createDrug, deleteDrug, updateDrug };
