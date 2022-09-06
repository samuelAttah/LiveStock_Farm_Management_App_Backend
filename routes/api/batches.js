const express = require("express");
const router = express.Router();
const batchesController = require("../../controllers/batchesController");
const feedsController = require("../../controllers/feedsController");
const housingController = require("../../controllers/housingController");
const drugsController = require("../../controllers/drugsController");
const mortalityController = require("../../controllers/mortalityController");
const revenueController = require("../../controllers/revenueController");

router
  .route("/")
  .get(batchesController.getAllBatches)
  .post(batchesController.createBatch)
  .patch(batchesController.updateBatch)
  .delete(batchesController.deleteBatch);

//used to fetch particular get request to an ID
router.route("/:id").get(batchesController.getBatch);

//DRUGS ROUTE
router
  .route("/:batchId/drug")
  .get(drugsController.getAllDrugs)
  .post(drugsController.createDrug)
  .delete(drugsController.deleteDrug)
  .patch(drugsController.updateDrug);

//FEED ROUTE
router
  .route("/:batchId/feed")
  .get(feedsController.getAllFeeds)
  .put(feedsController.createFeed)
  .delete(feedsController.deleteFeed)
  .patch(feedsController.updateFeed);

//HOUSING ROUTE
router
  .route("/:batchId/housing")
  .get(housingController.getAllHousing)
  .post(housingController.createHousing)
  .delete(housingController.deleteHousing)
  .patch(housingController.updateHousing);

//MORTALITY ROUTE
router
  .route("/:batchId/mortality")
  .get(mortalityController.getAllMortality)
  .post(mortalityController.createMortality)
  .delete(mortalityController.deleteMortality)
  .patch(mortalityController.updateMortality);

//REVENUE ROUTE
router
  .route("/:batchId/revenue")
  .get(revenueController.getAllRevenues)
  .post(revenueController.createRevenue)
  .delete(revenueController.deleteRevenue)
  .patch(revenueController.updateRevenue);

module.exports = router;
