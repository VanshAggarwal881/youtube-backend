# Video Platform Backend 🎥

A robust backend for a video sharing platform with user authentication, video management, and social features.

## Table of Contents 📑

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [Gratitude](#gratitude)
- [Frontend](#frontend)

## Features

- **User Authentication**
  - JWT-based login/refresh tokens
  - Secure password hashing
  - Profile management (avatar, cover image)
- **Video Management**

  - Video upload with thumbnail
  - Video streaming endpoints
  - Video metadata CRUD operations
  - Toggle publish status

- **Social Features**

  - Subscribe/unsubscribe channels
  - Like/unlike videos
  - Comment system
  - Playlist management

- **Analytics**
  - Channel statistics (views, subscribers)
  - Video performance metrics
  - Subscription tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary
- **Other**:
  - `mongoose-paginate-v2` - Pagination
  - `multer` - File upload handling
  - `bcrypt` - Password hashing

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### Installation

1. Clone repository:

```bash
git clone https://github.com/yourusername/video-platform-backend.git
cd video-platform-backend
```

2. Install dependencies:

```bash
npm install
```

3. Environment Setup:

```bash
cp .env.example .env
# Update values in .env file
```

4. Start development server:

```bash
npm run dev
```

## Environment Variables

Create `.env` file with these variables:

```ini
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname
ACCESS_TOKEN_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=8080
```

## API Reference

### Authentication

| Method | Endpoint        | Description          |
| ------ | --------------- | -------------------- |
| POST   | /api/v1/login   | User login           |
| POST   | /api/v1/refresh | Refresh access token |

### Users

| Method | Endpoint            | Description         |
| ------ | ------------------- | ------------------- |
| GET    | /users/current-user | Get current user    |
| PATCH  | /users/update       | Update user profile |

### Videos

| Method | Endpoint    | Description          |
| ------ | ----------- | -------------------- |
| POST   | /videos     | Upload video         |
| GET    | /videos/:id | Get video by ID      |
| PATCH  | /videos/:id | Update video details |

### Subscriptions

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| POST   | /subscriptions/toggle/:id    | Subscribe/unsubscribe    |
| GET    | /subscriptions/subscribed-to | Get user's subscriptions |

[View Full API Documentation](API_DOCS.md)

## Deployment

1. **Render.com** (Recommended)

   - Connect your GitHub repository
   - Set environment variables
   - Build command: `npm install`
   - Start command: `npm start`

2. **Environment Notes**
   - Set `NODE_ENV=production`
   - Configure CORS properly
   - Enable HTTPS

## Testing

Test endpoints using Postman:

1. Download Postman on your device.
2. For Reference see [How to use Postman for Backend](https://youtu.be/_u-WgSN5ymU?si=d8c8gXD6oj8N3eFl)

## Contributing

1. Fork the project
2. Create your feature branch:

```bash
git checkout -b feature/amazing-feature
```

3. Commit changes:

```bash
git commit -m 'Add some amazing feature'
```

4. Push to branch:

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

## Gratitude

This project was developed following tutorials from Chai aur Code (https://www.youtube.com/@chaiaurcode)
Created by Hitesh Choudhary.
**Special thanks** to [Hitesh Choudhary](https://github.com/hiteshchoudhary) and his YouTube channel [Chai aur Code](https://www.youtube.com/@chaiaurcode) for the educational content that helped build this project.

## Frontend

Comprehensive plan for frontend

### Required React Technologies:

1. Core:

- React (Vite recommended for faster setup)
- React Router DOM (v6+ for routing)
- Redux Toolkit (State management)
- Axios (API calls)

2. Essential Libraries:

- Formik + Yup (Form handling/validation)
- React Icons (Icon library)
- Day.js (Date formatting)
- React Player (Video playback)
- JWT-decode (Token handling)

3. UI Library (Choose one):

- Chakra UI (Recommended for rapid development)
- Material-UI (MUI)
- Tailwind CSS + Headless UI

4. Testing (Optional but recommended):

- Jest
- React Testing Library
- MSW (Mock Service Worker for API mocking)

5. TypeScript (Strongly recommended)

### Recommended Folder Structure:

```
src/
├── api/             # API service config
├── assets/          # Static assets
├── components/      # Reusable components
│   ├── video/
│   ├── comments/
│   └── auth/
├── features/        # Redux slices
├── hooks/           # Custom hooks
├── layouts/         # Page layouts
├── pages/           # Route components
├── types/           # TypeScript types
├── utils/           # Utilities/helpers
└── App.tsx
```

### Project Setup Guide:

```bash
npm create vite@latest streamhub-frontend -- --template react-ts
cd streamhub-frontend
npm install @reduxjs/toolkit react-redux react-router-dom axios formik yup react-icons day.js react-player jwt-decode
```

### Key Environment Variables (`.env`):

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### Development Phases & Time Estimate:

1. **Setup & Authentication (3-5 days)**

   - Project configuration
   - Auth flow (Login/Register)
   - JWT token management
   - Protected routes
   - Basic layout setup

2. **Core Features (2-3 weeks)**

   - Video upload/streaming
   - Comments system
   - Like/dislike functionality
   - User profiles
   - Playlist management
   - Channel dashboard

3. **Advanced Features (1-2 weeks)**

   - Notifications system
   - Search functionality
   - Recommendations engine
   - Analytics dashboard
   - Social sharing
   - Admin panel

4. **Polish & Optimization (1 week)**
   - Responsive design
   - Performance optimization
   - Error handling
   - Loading states
   - Accessibility improvements
