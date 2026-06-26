const CUISINE_CATEGORIES = {
    'japanese_restaurant': 'Japanese',
    'sushi_restaurant': 'Japanese',
    'ramen_restaurant': 'Japanese',
    'chinese_restaurant': 'Chinese',
    'korean_restaurant': 'Korean',
    'italian_restaurant': 'Italian',
    'pizza_restaurant': 'Italian',
    'indian_restaurant': 'Indian',
    'mexican_restaurant': 'Mexican',
    'asian_restaurant': 'Asian',
    'thai_restaurant': 'Thai',
    'vietnamese_restaurant': 'Vietnamese',
    'indonesian_restaurant': 'Indonesian'
};

// Helper Function
function getCuisineTypes(categoryIds) {
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
        return [];
    }

    const res = [];
    const seen = new Set();
    for (const categoryId of categoryIds) {
        if (CUISINE_CATEGORIES[categoryId] && !seen.has(CUISINE_CATEGORIES[categoryId])) {
            res.push(CUISINE_CATEGORIES[categoryId]);
            seen.add(CUISINE_CATEGORIES[categoryId]);
        }
    }
    return res;
}


export async function getSuggestions(req, res, next) {
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
        url.searchParams.append("poi_category", "restaurant,food,food_and_drink,winery,bar,cafe,bakery");
        url.searchParams.append("limit", "10");

        const response = await fetch(url.toString());
        const data = await response.json();
        if (!response.ok) {
            const err = new Error('Unexpected Search Error');
            err.statusCode = response.status;
            return next(err);
        }

        if (!Array.isArray(data.suggestions)) {
            const err = new Error('Unexpected Search Error');
            err.statusCode = 502;
            return next(err);
        }

        const suggestions = data.suggestions.map(suggestion => ({
            mapbox_id: suggestion.mapbox_id,
            name: suggestion.name,
            address: suggestion.full_address,
        }));

        res.status(200).json({ 
            success: true, 
            data: suggestions
        });
    } catch (error) {
        next(error);
    }
};
    
export async function getLocationDetails(req, res, next) {
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
            err.statusCode = !response.ok ? response.status : 404;
            return next(err);
        }

        const feature = data.features[0];

        res.status(200).json({
            success: true,
            data: {
                mapbox_id: id,
                name: feature.properties.brand?.[0] || feature.properties.name,
                address: feature.properties.full_address,
                latitude: feature.geometry.coordinates[1],
                longitude: feature.geometry.coordinates[0],
                cuisine_types: getCuisineTypes(feature.properties.poi_category_ids)
            }
        });
    } catch (error) {
        next(error);
    }
};

export async function getSuggestionsByCategory(req, res, next) {
    try {
        const { category_id } = req.params;
        const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

        if (!category_id || !MAPBOX_TOKEN) {
            const err = new Error('Cannot Fetch Locations By Category');
            err.statusCode = 400;
            return next(err);
        }

        const url = new URL(`https://api.mapbox.com/search/searchbox/v1/category/${category_id}`);
        url.searchParams.append("access_token", MAPBOX_TOKEN);
        url.searchParams.append("proximity", "ip");
        url.searchParams.append("limit", "10");


        const response = await fetch(url.toString());
        const data = await response.json();
        if (!response.ok || !data.features || data.features.length === 0) {
            const err = new Error('Cannot Fetch Locations By Category');
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
};

