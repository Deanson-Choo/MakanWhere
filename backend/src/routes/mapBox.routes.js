import express from 'express';

const mapBoxRouter = express.Router();

mapBoxRouter.get('/locations/search', async(req, res, next) => {
    try {
        const { query, session_token } = req.query;
        const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

        if (!query || !session_token || !MAPBOX_TOKEN) {
            const err = new Error('Unexpected Search Error');
            err.statusCode = 400;
            return next(err);
        }

        const url = new URL("https://api.mapbox.com/search/searchbox/v1/suggest")
        url.searchParams.append("q", query);
        url.searchParams.append("session_token", session_token);
        url.searchParams.append("access_token", MAPBOX_TOKEN);
        url.searchParams.append("types", "poi");
        url.searchParams.append("proximity", "ip");
        url.searchParams.append("limit", "10");

        const response = await fetch(url.toString());
        const data = await response.json();
        if (!response.ok) {
            const err = new Error('Unexpected Search Error');
            err.statusCode = response.status;
            return next(err);
        }

        res.status(200).json({ 
            success: true, 
            data 
        });
    } catch (error) {
        next(error);
    }
});

mapBoxRouter.get('/locations/:id', async(req, res, next) => {
    try {
        const { id } = req.params;
        const { session_token } = req.query;
        const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

        if (!id || !session_token || !MAPBOX_TOKEN) {
            const err = new Error('Cannot Fetch Location Details');
            err.statusCode = 400;
            return next(err);
        }

        const url = new URL(`https://api.mapbox.com/search/searchbox/v1/retrieve/${id}`);
        url.searchParams.append("session_token", session_token);
        url.searchParams.append("access_token", MAPBOX_TOKEN);

        const response = await fetch(url.toString());
        const data = await response.json();
        if (!response.ok || !data.features || data.features.length === 0) {
            const err = new Error('Cannot Fetch Location Details');
            err.statusCode = response.status;
            return next(err);
        }

        const feature = data.features[0];

        res.status(200).json({
            success: true,
            data: {
                mapbox_id: id,
                place_name: feature.properties.brand?.[0] || feature.properties.name,
                address: feature.properties.address,
                latitude: feature.geometry.coordinates[1],
                longitude: feature.geometry.coordinates[0]
            }
        });
    } catch (error) {
        next(error);
    }
});

export default mapBoxRouter;