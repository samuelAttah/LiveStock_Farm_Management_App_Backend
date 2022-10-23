const User = require("../model/User");
const Batch = require("../model/Batch");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const getAllAnimalSales = asyncHandler(async (req, res) => {
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
  return res.status(200).json(batch.animalSales);
});

const createAnimalSale = asyncHandler(async (req, res) => {
  const requestUser = req?.user;

  const { batchId } = req?.params;

  const { numberSold, costPerUnit, dateSold } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !numberSold || !costPerUnit || !dateSold) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  const mortalities = batch?.mortality;

  const mortalitiesSum = mortalities?.length
    ? mortalities.reduce((acc, mortality) => {
        return acc + Number(mortality.numberDead);
      }, 0)
    : 0;
  const animalSales = batch?.animalSales;

  const animalSalesSum = animalSales?.length
    ? animalSales.reduce((acc, animalsale) => {
        return acc + Number(animalsale.numberSold);
      }, 0)
    : 0;

  const totalAnimalsLeft =
    Number(animalSalesSum) + Number(mortalitiesSum) + Number(numberSold);

  if (batch.numberPurchased < totalAnimalsLeft) {
    return res.status(400).json({
      message:
        "Total number of animals in a batch must be greater or equal to the sum of animals sold and animals dead ",
    });
  }

  const totalCost = costPerUnit * numberSold;

  batch.animalSales.push({
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

const deleteAnimalSale = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId, animalSaleId } = req?.params;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();
  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }

  if (!batchId) {
    return res.status(400).json({ message: "Missing batchId" });
  }
  if (!animalSaleId) {
    return res.status(400).json({ message: "Missing animalSaleId" });
  }
  const batch = await Batch.findOne({
    _id: batchId.toString(),
    user: requestUser,
  }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  if (!batch?.animalSales?.length) {
    return res.status(204).json({ message: "No Farm Animal Sales found" });
  }

  //convert animalSaleId from string to ObjectId
  const convertedAnimalSaleId = mongoose.Types.ObjectId(animalSaleId);

  const result = await Batch.updateOne(
    { _id: batchId },
    { $pull: { animalSales: { _id: convertedAnimalSaleId } } }
  ).exec();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

const updateAnimalSale = asyncHandler(async (req, res) => {
  const requestUser = req?.user;
  const { batchId } = req?.params;

  const { animalSaleId, numberSold, costPerUnit, dateSold } = req?.body;

  const userMatch = await User.findOne({ username: requestUser }).lean().exec();

  if (!userMatch) {
    return res.status(401).json({ message: "Unauthorized User" });
  }
  if (!batchId || !animalSaleId || !numberSold || !costPerUnit || !dateSold) {
    return res.status(400).json({ message: "Missing required Parameter" });
  }

  const batch = await Batch.findOne({ _id: batchId, user: requestUser }).exec();

  if (!batch) {
    return res.status(400).json({ message: "Invalid Parameters" });
  }

  const mortalities = batch?.mortality;

  const mortalitiesSum = mortalities?.length
    ? mortalities.reduce((acc, mortality) => {
        return acc + Number(mortality.numberDead);
      }, 0)
    : 0;
  const animalSales = batch?.animalSales;

  const animalSalesSum = animalSales?.length
    ? animalSales.reduce((acc, animalsale) => {
        return acc + Number(animalsale.numberSold);
      }, 0)
    : 0;

  const totalAnimalsLeft =
    Number(animalSalesSum) +
    Number(mortalitiesSum) +
    Number(numberSold) -
    Number(batch.animalSales.id(animalSaleId).numberSold);

  if (batch.numberPurchased < totalAnimalsLeft) {
    return res.status(400).json({
      message:
        "Total number of animals in a batch must be greater or equal to the sum of animals sold and animals dead ",
    });
  }

  batch.animalSales.id(animalSaleId).numberSold = numberSold;
  batch.animalSales.id(animalSaleId).costPerUnit = costPerUnit;
  batch.animalSales.id(animalSaleId).dateSold = dateSold;
  batch.animalSales.id(animalSaleId).totalCost = costPerUnit * numberSold;

  const result = await batch.save();

  if (!result) {
    return res
      .status(400)
      .json({ message: "Error Occured, Invalid Parameters " });
  }

  return res.status(200).json(result);
});

module.exports = {
  getAllAnimalSales,
  createAnimalSale,
  deleteAnimalSale,
  updateAnimalSale,
};
