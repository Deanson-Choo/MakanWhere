import express from 'express'; 
import cors from 'cors'; 
import "dotenv/config" 

import authRouter from './routes/auth.routes.js';
import mapBoxRouter from './routes/mapbox.routes.js';
import reviewRouter from './routes/review.routes.js';
import profileRouter from './routes/profile.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';


const PORT = process.env.PORT || 3000; 

const app = express();

app.use(cors()); 
app.use(express.json({ limit: '10mb' })); // Middleware to parse JSON bodies with a size limit of 10MB

// We define routers here
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/mapbox', mapBoxRouter); 
app.use('/api/reviews', reviewRouter);
app.use(notFoundHandler); // Handle 404 for undefined routes

// Global error handler — MUST come after all routes
app.use(errorHandler);

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
