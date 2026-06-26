import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import * as mapBoxController from '../controllers/mapbox.controller.js';

const mapboxRouter = express.Router();

mapboxRouter.get('/search/suggestions', authMiddleware, mapBoxController.getSuggestions);
mapboxRouter.get('/search/:id', authMiddleware, mapBoxController.getLocationDetails);
mapboxRouter.get('/search/category/:category_id', authMiddleware, mapBoxController.getSuggestionsByCategory); // Currently not used

export default mapboxRouter;