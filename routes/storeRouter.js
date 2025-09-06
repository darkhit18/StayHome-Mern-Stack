//External modules
const express = require('express');
const storeRouter = express.Router();

//local modules
const storeController = require('../controllers/storeController');

storeRouter.get('/',storeController.getIndex);
storeRouter.get('/homes',storeController.getHomes);
storeRouter.get('/bookings',storeController.getBookings);
storeRouter.get('/favourite',storeController.getFavouriteList);

storeRouter.get('/homes/:homeId', storeController.getHomeDetails);
storeRouter.post('/favourite',storeController.postAddToFavourite);
storeRouter.post('/favourite/delete/:homeId',storeController.postRemoveFromFavourite);

module.exports = storeRouter;