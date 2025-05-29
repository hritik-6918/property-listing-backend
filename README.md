# Property Listing System

A backend system for managing property listings with advanced filtering, user authentication, and property favorites.

## Features

- CRUD operations for properties
- Advanced search/filtering based on 10+ attributes
- Redis caching for optimized performance
- User registration and login with email/password
- Favorite properties functionality
- Property recommendation system

## Tech Stack

- TypeScript / Node.js
- Next.js (App Router)
- MongoDB
- Redis (for caching)

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get authentication token
- `POST /api/auth/logout` - Logout and clear authentication token

### Properties

- `GET /api/properties` - Get all properties with filtering options
- `GET /api/properties/:id` - Get a specific property by ID
- `POST /api/properties` - Create a new property (requires authentication)
- `PUT /api/properties/:id` - Update a property (requires authentication and ownership)
- `DELETE /api/properties/:id` - Delete a property (requires authentication and ownership)

### Favorites

- `GET /api/favorites` - Get all favorites for the authenticated user
- `POST /api/favorites/:propertyId` - Add a property to favorites
- `DELETE /api/favorites/:propertyId` - Remove a property from favorites

### Recommendations

- `GET /api/recommendations` - Get all recommendations received by the authenticated user
- `POST /api/recommendations` - Recommend a property to another user

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`
3. Create a `.env.local` file with the following variables:
   \`\`\`
   MONGODB_URI=your-mongodb-connection-string
   REDIS_URL=your-redis-connection-string
   JWT_SECRET=your-jwt-secret-key
   \`\`\`
4. Import the CSV data:
   \`\`\`
   npm run import-data
   \`\`\`
5. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`

## Data Import

The system includes a script to import the CSV data into MongoDB. Run:

\`\`\`
npm run import-data
\`\`\`

This will create an admin user and import all properties from the CSV file.

## Deployment

The application can be deployed to Vercel or any other hosting service that supports Next.js applications.

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT token generation and validation
