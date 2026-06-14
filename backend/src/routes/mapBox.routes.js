import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import * as mapBoxController from '../controllers/mapbox.controller.js';

const mapBoxRouter = express.Router();

mapBoxRouter.get('/search/suggestions', authMiddleware, mapBoxController.getSuggestions);
mapBoxRouter.get('/search/:id', authMiddleware, mapBoxController.getLocationDetails);
mapBoxRouter.get('/search/category/:category_id', authMiddleware, mapBoxController.getSuggestionsByCategory);

export default mapBoxRouter;