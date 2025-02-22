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

1. Import [Postman Collection](postman_collection.json)
2. Set environment variables:
   - `base_url`: Your deployment URL
   - `access_token`: From login response

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
