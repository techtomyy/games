const express = require("express");
const dotenv = require("dotenv");
const { testConnection } = require("./config/supabase");

// Import middleware
const corsMiddleware = require("./middleware/cors");
const { logger, errorLogger } = require("./middleware/logger");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { sanitizeInput } = require("./middleware/validation");

// Import routes
const routes = require("./routes");

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy (for accurate IP addresses behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '10mb' })); // Increase limit for large game data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware
app.use(logger);
app.use(corsMiddleware);
app.use(sanitizeInput);

// Basic route
app.get("/", (req, res) => {
    res.json({ 
        success: true,
        message: "DrawPlayUniverse Backend Server is running!",
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        environment: process.env.NODE_ENV || 'development'
    });
});

// Mount API routes
app.use(routes);

// 404 handler for undefined routes
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorLogger);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on Port: ${PORT}`);
    console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
    console.log(`🔗 API documentation at: http://localhost:${PORT}/api/v1`);
    
    // Test Supabase connection on startup
    console.log("🔗 Testing Supabase connection...");
    const isConnected = await testConnection();
    if (isConnected) {
        console.log("✅ Supabase connection established");
    } else {
        console.log("⚠️  Supabase connection failed - check your environment variables");
    }
    
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📝 Logs enabled: ${process.env.NODE_ENV !== 'production' ? 'Yes' : 'No'}`);
});
