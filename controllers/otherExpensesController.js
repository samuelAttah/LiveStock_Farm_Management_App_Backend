const User = require("../model/User");
const Batch = require("../model/Batch");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const getAllOtherExpenses = asyncHandler(async (req, res) => {
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
  return res.status(200).json(batch.otherExpenses);
});

const createOtherExpense = asyncHandler(async (req, res) => {
  const requestUser = req?.user;

  const { batchId } = req?.params;

  const { itemName, datePurchased, amountPurchased } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !itemName || !datePurchased || !amountPurchased) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  batch.otherExpenses.push({
    itemName: itemName,
    datePurchased: datePurchased,
    amountPurchased: amountPurchased,
  });

  const result = await batch.save();
  if (!result) {
    return res.status(400).json({ message: "Error creating Expense" });
  }

  return res.status(200).json(result);
});

const deleteOtherExpense = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId, expenseId } = req?.params;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();
  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !expenseId) {
    return res.status(400).json({ message: "Missing required Parameters" });
  }
  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  if (!batch?.otherExpenses?.length) {
    return res.status(204).json({ message: "No Expenses found" });
  }

  //convert expenseId from string to ObjectId
  const convertedExpenseId = mongoose.Types.ObjectId(expenseId);

  const result = await Batch.updateOne(
    { _id: batchId },
    { $pull: { otherExpenses: { _id: convertedExpenseId } } }
  ).exec();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

const updateOtherExpense = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId } = req?.params;

  const { expenseId, itemName, datePurchased, amountPurchased } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (
    !batchId ||
    !expenseId ||
    !itemName ||
    !datePurchased ||
    !amountPurchased
  ) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  batch.otherExpenses.id(expenseId).itemName = itemName;
  batch.otherExpenses.id(expenseId).datePurchased = datePurchased;
  batch.otherExpenses.id(expenseId).amountPurchased = amountPurchased;

  const result = await batch.save();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

module.exports = {
  getAllOtherExpenses,
  createOtherExpense,
  deleteOtherExpense,
  updateOtherExpense,
};
