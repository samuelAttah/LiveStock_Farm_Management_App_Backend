const express = require("express");
const router = express.Router();
const batchesController = require("../../controllers/batchesController");
const feedsController = require("../../controllers/feedsController");
const housingController = require("../../controllers/housingController");
const drugsController = require("../../controllers/drugsController");
const mortalityController = require("../../controllers/mortalityController");
const revenueController = require("../../controllers/revenueController");
const animalSaleController = require("../../controllers/animalSalesController");
const otherExpensesController = require("../../controllers/otherExpensesController");

//BATCH ROUTE
router
  .route("/")
  .get(batchesController.getAllBatches)
  .post(batchesController.createBatch)
  .patch(batchesController.updateBatch)
  .put(batchesController.endBatch);

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
  .patch(revenueController.updateRevenue);

router
  .route("/:batchId/revenue/:revenueId")
  .delete(revenueController.deleteRevenue);

//ANIMALSALES ROUTE
router
  .route("/:batchId/animalsale")
  .get(animalSaleController.getAllAnimalSales)
  .put(animalSaleController.createAnimalSale)
  .patch(animalSaleController.updateAnimalSale);

router
  .route("/:batchId/revenue/:revenueId")
  .delete(animalSaleController.deleteAnimalSale);

//OTHEREXPENSES ROUTE
router
  .route("/:batchId/otherexpenses")
  .get(otherExpensesController.getAllOtherExpenses)
  .put(otherExpensesController.createOtherExpense)
  .patch(otherExpensesController.updateOtherExpense);

router
  .route("/:batchId/otherexpenses/:expenseId")
  .delete(otherExpensesController.deleteOtherExpense);

module.exports = router;
