# DrawPlayUniverse Backend

This is the backend server for the DrawPlayUniverse application, built with Express.js and Supabase using a clean MVC architecture.

## Features

- Express.js server with RESTful API
- Supabase integration for database operations
- Clean MVC architecture with separate controllers, routes, and middleware
- CORS support for frontend communication
- Comprehensive error handling and logging
- Input validation and sanitization
- Health check endpoints
- Game management API endpoints
- User management capabilities
- Drawing storage functionality

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   ```env
   PORT=3000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_project_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 3. Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to Settings > API
4. Copy your Project URL and anon/public key
5. Paste them into your `.env` file

### 4. Run the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/system` - Detailed system information
- `GET /health/database` - Test database connection

### Games (v1 API)
- `GET /api/v1/games/user/:userId` - Get games by user ID
- `GET /api/v1/games/user/:userId/paginated` - Get games with pagination
- `GET /api/v1/games/:id` - Get game by ID
- `POST /api/v1/games` - Create a new game
- `PUT /api/v1/games/:id` - Update an existing game
- `DELETE /api/v1/games/:id` - Delete a game

### Users (v1 API)
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/users/:id/profile` - Get user profile with statistics
- `POST /api/v1/users` - Create a new user
- `PUT /api/v1/users/:id` - Update user information
- `DELETE /api/v1/users/:id` - Delete user account

### Drawings (v1 API)
- `GET /api/v1/drawings/game/:gameId` - Get drawings by game ID
- `GET /api/v1/drawings/game/:gameId/paginated` - Get drawings with pagination
- `GET /api/v1/drawings/:id` - Get drawing by ID
- `POST /api/v1/drawings` - Save a new drawing
- `PUT /api/v1/drawings/:id` - Update a drawing
- `DELETE /api/v1/drawings/:id` - Delete a drawing

### Legacy API (Backward Compatibility)
- `GET /api/games` - Legacy game endpoints
- `GET /api/users` - Legacy user endpoints
- `GET /api/drawings` - Legacy drawing endpoints

### Basic
- `GET /` - Server status and information
- `GET /api/v1` - API information and available endpoints

## Database Schema

The application expects the following tables in your Supabase database:

### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Games Table
```sql
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  description TEXT,
  game_type VARCHAR,
  game_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Drawings Table
```sql
CREATE TABLE drawings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  drawing_data JSONB,
  image_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Development

### Project Structure
```
backend/
├── config/
│   └── supabase.js          # Supabase connection and helpers
├── controllers/
│   ├── gameController.js    # Game-related business logic
│   ├── userController.js    # User-related business logic
│   ├── drawingController.js # Drawing-related business logic
│   └── healthController.js  # Health check logic
├── middleware/
│   ├── cors.js              # CORS configuration
│   ├── errorHandler.js      # Global error handling
│   ├── logger.js            # Request/error logging
│   └── validation.js        # Input validation and sanitization
├── routes/
│   ├── index.js             # Main routes configuration
│   ├── gameRoutes.js        # Game API routes
│   ├── userRoutes.js        # User API routes
│   ├── drawingRoutes.js     # Drawing API routes
│   └── healthRoutes.js      # Health check routes
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
├── env.example              # Environment variables template
└── README.md               # This file
```

### Architecture

The application follows a clean MVC (Model-View-Controller) architecture:

- **Controllers**: Handle business logic and request/response processing
- **Routes**: Define API endpoints and route handlers
- **Middleware**: Handle cross-cutting concerns like CORS, logging, validation
- **Config**: Database connections and configuration

### Available Scripts
- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm test` - Run tests (placeholder)

### Middleware Features

1. **CORS**: Configurable CORS settings for different environments
2. **Logging**: Request/response logging with timing information
3. **Error Handling**: Comprehensive error handling with proper HTTP status codes
4. **Validation**: Input validation and sanitization to prevent XSS attacks
5. **Rate Limiting**: (Can be added) Request rate limiting

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Troubleshooting

### Common Issues

1. **Supabase Connection Failed**
   - Check your `.env` file has correct SUPABASE_URL and SUPABASE_ANON_KEY
   - Verify your Supabase project is active
   - Check if your database tables exist

2. **CORS Issues**
   - The server includes CORS middleware for development
   - For production, set FRONTEND_URL in your environment variables

3. **Port Already in Use**
   - Change the PORT in your `.env` file
   - Or kill the process using the port: `npx kill-port 3000`

4. **Validation Errors**
   - Check that required fields are provided
   - Ensure UUIDs are in correct format
   - Verify email format is valid

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
