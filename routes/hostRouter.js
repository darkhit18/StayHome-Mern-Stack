//External modules
const express = require('express');
const hostRouter = express.Router();
 
//local modules
const hostController = require('../controllers/hostController'); 

hostRouter.get('/add-home', hostController.getAddhomes);     
hostRouter.post('/add-home', hostController.postAddhomes); 
hostRouter.get('/host-Home-list', hostController.getHostHomes); 
hostRouter.get('/edit-home/:homeId', hostController.getEditHome);
hostRouter.post('/edit-home', hostController.postEditHome);
hostRouter.post('/delete-home/:homeId', hostController.postDeleteHome);

module.exports = hostRouter;
