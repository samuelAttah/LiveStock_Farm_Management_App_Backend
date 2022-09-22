const User = require("../model/User");
const Batch = require("../model/Batch");
const asyncHandler = require("express-async-handler");

const getAllFeeds = asyncHandler(async (req, res) => {
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
  return res.status(200).json(batch.feed);
});

const createFeed = asyncHandler(async (req, res) => {
  const requestUser = req?.user;

  const { batchId } = req?.params;

  const { feedName, datePurchased, amountPurchased, currency } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (
    !batchId ||
    !feedName ||
    !datePurchased ||
    !amountPurchased ||
    !currency
  ) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  batch.feed.push({
    feedName: feedName,
    datePurchased: datePurchased,
    amountPurchased: amountPurchased,
    currency: currency,
  });

  const result = await batch.save();
  if (!result) {
    return res.status(400).json({ message: "Error creating new Feed" });
  }

  return res.status(200).json(result);
});

const deleteFeed = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId } = req?.params;
  const { feedId } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();
  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !feedId) {
    return res.status(400).json({ message: "Missing required Parameters" });
  }
  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  if (!batch?.feed?.length) {
    return res.status(204).json({ message: "No Feeds found" });
  }

  const result = await Batch.updateOne(
    { _id: batchId },
    { $pull: { feed: { _id: feedId } } }
  ).exec();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

const updateFeed = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId } = req?.params;

  const { feedId, feedName, datePurchased, amountPurchased, currency } =
    req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (
    !batchId ||
    !feedId ||
    !feedName ||
    !datePurchased ||
    !amountPurchased ||
    !currency
  ) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  batch.feed.id(feedId).feedName = feedName;
  batch.feed.id(feedId).datePurchased = datePurchased;
  batch.feed.id(feedId).amountPurchased = amountPurchased;
  batch.feed.id(feedId).currency = currency;

  const result = await batch.save();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

module.exports = { getAllFeeds, createFeed, deleteFeed, updateFeed };
