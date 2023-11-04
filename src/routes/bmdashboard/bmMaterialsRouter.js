const express = require('express');

const routes = function (itemMaterial) {
const materialsRouter = express.Router();
const controller = require('../../controllers/bmdashboard/bmMaterialsController')(itemMaterial);

materialsRouter.route('/materials')
  .get(controller.bmMaterialsList);

materialsRouter.route('/addUpdateMaterialRecord')
  .post(controller.bmPostMaterialUpdateRecord);

  materialsRouter.route('/UpdateMaterialRecordBulk')
  .post(controller.bmPostMaterialUpdateBulk);

  

  return materialsRouter;
};

module.exports = routes;
