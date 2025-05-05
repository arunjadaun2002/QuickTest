# Test Platform Application

A full-stack web application built with React, Node.js, and MongoDB that allows users to take assessment tests.

## Features

- User registration with name, email, and mobile number
- Interactive assessment test with multiple-choice questions
- Results display with score and answers
- Responsive design using Material-UI
- MongoDB integration for data persistence

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or a MongoDB Atlas account)
- npm or yarn package manager

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/test-app
   ```
   Note: Update the MONGODB_URI if you're using MongoDB Atlas or a different MongoDB instance.

4. Start the development servers:
   ```bash
   # Start the backend server (from the server directory)
   npm run dev

   # Start the frontend development server (from the client directory)
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── styles/       # CSS and styling
│   │   └── utils/        # Utility functions
│   └── package.json
│
└── server/                # Node.js backend
    ├── config/           # Configuration files
    ├── controllers/      # Route controllers
    ├── models/          # MongoDB models
    ├── routes/          # API routes
    └── package.json
```

## API Endpoints

- POST `/api/users/register` - Register a new user
- POST `/api/users/:userId/test-results` - Submit test results
- GET `/api/users/:userId/test-results` - Get test results

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - React Router
  - Axios

- Backend:
  - Node.js
  - Express
  - MongoDB
  - Mongoose
  - TypeScript

## License

MIT 