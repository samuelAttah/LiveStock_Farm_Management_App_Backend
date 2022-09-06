const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedSchema = new Schema({
  feedName: String,
  datePurchased: { type: Date, required: true },
  amountPurchased: { type: Schema.Types.Decimal128 },
});

const housingSchema = new Schema({
  housingType: { type: String, required: true },
  cost: { type: Schema.Types.Decimal128, required: true },
  description: String,
});

const drugSchema = new Schema({
  drugName: { type: String, required: true },
  purchaseReason: { type: String },
  cost: { type: Schema.Types.Decimal128, required: true },
});

const mortalitySchema = new Schema({
  numberDead: Number,
  deathReason: String,
});

const revenueSchema = new Schema({
  itemSold: { type: String, required: true },
  numberSold: { type: Number, required: true },
  costPerUnit: { type: Schema.Types.Decimal128, required: true },
  totalCost: { type: Schema.Types.Decimal128 },
});

const batchSchema = new Schema(
  {
    user: {
      type: String,
      required: true,
    },
    batchNumber: Number,
    batchTitle: { type: String, required: true },
    animalType: { type: String, required: true },
    numberPurchased: { type: Number, required: true },
    costPerUnit: { type: Schema.Types.Decimal128, required: true },
    currency: { type: String, required: true },
    totalPurchaseCost: Schema.Types.Decimal128,
    feed: [feedSchema],
    housing: [housingSchema],
    drugs: [drugSchema],
    mortality: [mortalitySchema],
    revenue: [revenueSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Batch", batchSchema);