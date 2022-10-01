const express = require("express");
const router = express.Router();
const batchesController = require("../../controllers/batchesController");
const feedsController = require("../../controllers/feedsController");
const housingController = require("../../controllers/housingController");
const drugsController = require("../../controllers/drugsController");
const mortalityController = require("../../controllers/mortalityController");
const revenueController = require("../../controllers/revenueController");

//BATCH ROUTE
router
  .route("/")
  .get(batchesController.getAllBatches)
  .post(batchesController.createBatch)
  .patch(batchesController.updateBatch);

router
  .route("/:id")
  .get(batchesController.getBatch)
  .delete(batchesController.deleteBatch);

//DRUGS ROUTE
router
  .route("/:batchId/drug")
  .get(drugsController.getAllDrugs)
  .put(drugsController.createDrug)
  .patch(drugsController.updateDrug);

router.route("/:batchId/drug/:drugId").delete(drugsController.deleteDrug);

//FEED ROUTE
router
  .route("/:batchId/feed")
  .get(feedsController.getAllFeeds)
  .put(feedsController.createFeed)
  .patch(feedsController.updateFeed);

router.route("/:batchId/feed/:feedId").delete(feedsController.deleteFeed);

//HOUSING ROUTE
router
  .route("/:batchId/housing")
  .get(housingController.getAllHousing)
  .put(housingController.createHousing)
  .patch(housingController.updateHousing);

router
  .route("/:batchId/housing/:housingId")
  .delete(housingController.deleteHousing);

//MORTALITY ROUTE
router
  .route("/:batchId/mortality")
  .get(mortalityController.getAllMortality)
  .put(mortalityController.createMortality)
  .patch(mortalityController.updateMortality);

router
  .route("/:batchId/mortality/:mortalityId")
  .delete(mortalityController.deleteMortality);

//REVENUE ROUTE
router
  .route("/:batchId/revenue")
  .get(revenueController.getAllRevenues)
  .put(revenueController.createRevenue)
  .patch(revenueController.updateRevenue)
  .delete(revenueController.deleteRevenue);

router
  .route("/:batchId/revenue/:revenueId")
  .delete(revenueController.deleteRevenue);

module.exports = router;
