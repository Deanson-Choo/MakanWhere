import express from 'express'; 
import cors from 'cors'; // This line imports the CORS middleware, which allows your server to handle cross-origin requests
import "dotenv/config" // This line loads environment variables from a .env file into process.env

import authRouter from './routes/auth.routes.js';
import mapBoxRouter from './routes/mapBox.routes.js';
import reviewRouter from './routes/review.routes.js';
import { errorHandler } from './middleware/error.middleware.js';


const PORT = process.env.PORT || 3000; 

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); 

// We define routers here
app.use('/api/auth', authRouter);
app.use('/api/mapbox', mapBoxRouter); 
app.use('/api/reviews', reviewRouter);

// Global error handler — MUST come after all routes
app.use(errorHandler);

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
