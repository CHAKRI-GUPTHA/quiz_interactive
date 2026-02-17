# Quiz System

A full-stack quiz application with React frontend and Express/MongoDB backend.

## Project Structure

```
quiz-system/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── package.json           # Backend dependencies
│   ├── .env.example           # Environment variables template
│   ├── models/
│   │   ├── User.js            # User schema with auth
│   │   ├── Quiz.js            # Quiz schema
│   │   └── Result.js          # Result/Score schema
│   └── routes/
│       ├── auth.js            # Authentication endpoints
│       └── quiz.js            # Quiz endpoints
│
└── frontend/ (quiz_interactive)
    ├── APP.jsx                # Main React component
    ├── APP.css                # Styles
    ├── main.jsx               # React entry point
    ├── index.html             # HTML root
    └── package.json           # Frontend dependencies
```

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Create .env file from template:
```bash
cp .env.example .env
```

3. Install MongoDB locally or update MONGODB_URI in .env

4. Start the server (development):
```bash
npm run dev
```

Or production:
```bash
npm start
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to root folder:
```bash
cd ..
```

2. Frontend already running on `http://localhost:5173`

If not, start it:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Quiz
- `GET /api/quiz` - Get all quizzes
- `POST /api/quiz/access` - Verify quiz password and access
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/results/:userId` - Get user's results

## Technologies Used

**Backend:**
- Express.js
- MongoDB & Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for frontend communication

**Frontend:**
- React
- Framer Motion (animations)
- Vite (build tool)

## Environment Variables

See `.env.example` for required variables.

Key variables:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
