import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Routes Import
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import propertyRoutes from './routes/properties.routes';
import visitRoutes from './routes/visits.routes';
import transactionRoutes from './routes/transactions.routes';

const app = express();
const PORT = 5000;

// Add express built-in body-parser middleware
app.use(
    express.urlencoded({
        limit: '10mb',
        extended: true,
        parameterLimit: 300,
    })
);

app.use(
    express.json({
        limit: '100mb'
    })
);

// Add CORS middleware
app.use(cors({
    origin: `http://localhost:${PORT}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-API-KEY',
        'X-Session-ID'
    ],
    exposedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Session-ID'
    ]
}));

// MongoDb connection
mongoose.connect('mongodb://localhost:27017/hohaya')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err: Error) => {
        console.log('Connexion failed :', err);
    });

// Define a simple route
app.get('/', (req: Request, res: Response) => {
    console.log('Request GET received at /');
    res.json({
        success: true,
        message: 'Hello World! from the backend'
    });
});

// Users Routes
app.use('/users', userRoutes);

// Properties routes
app.use('', propertyRoutes);

// Auth login, register and Token Generating
app.use('', authRoutes);
























// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});