// Helper Function
function getCuisineTypes(categoryIds) {
    const cuisineCategories = {
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

    const res = [];
    for (const categoryId of categoryIds) {
        if (cuisineCategories[categoryId]) {
            res.push(cuisineCategories[categoryId]);
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

        res.status(200).json({ 
            success: true, 
            data 
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
                longitude: feature.geometry.coordinates[0],
                cuisine_types: getCuisineTypes(feature.properties.poi_category_ids)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Put somewhere next time:
// Japanese: 'japanese_restaurant', 'sushi_restaurant', 'ramen_restaurant'
// Chinese: 'chinese_restaurant'
// Korean: 'korean_restaurant'
// Italian: 'italian_restaurant', 'pizza_restaurant'
// Indian: 'indian_restaurant'
// Mexician: 'mexican_restaurant'
// Asian: 'asian_restaurant'
// Thai: 'thai_restaurant'
// Vietnamese: 'vietnamese_restaurant'
// Indonesian: 'indonesian_restaurant'

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

