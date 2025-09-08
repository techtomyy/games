const { testConnection } = require('../config/supabase');

// Basic health check
const getHealth = async (req, res) => {
    try {
        const dbStatus = await testConnection();
        
        res.json({
            success: true,
            status: "healthy",
            database: dbStatus ? "connected" : "disconnected",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            success: false,
            status: "unhealthy",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Detailed system information
const getSystemInfo = async (req, res) => {
    try {
        const dbStatus = await testConnection();
        
        res.json({
            success: true,
            system: {
                status: "healthy",
                database: dbStatus ? "connected" : "disconnected",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.version,
                platform: process.platform,
                arch: process.arch,
                nodeEnv: process.env.NODE_ENV || 'development'
            }
        });
    } catch (error) {
        console.error('System info error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Database connection test
const testDatabaseConnection = async (req, res) => {
    try {
        const isConnected = await testConnection();
        
        if (isConnected) {
            res.json({
                success: true,
                message: "Database connection successful",
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(503).json({
                success: false,
                message: "Database connection failed",
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

module.exports = {
    getHealth,
    getSystemInfo,
    testDatabaseConnection
};
