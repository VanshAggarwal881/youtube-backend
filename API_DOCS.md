# API Documentation

This document provides detailed information about the API endpoints available in the Video Platform Backend.

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Videos](#videos)
- [Playlists](#playlists)
- [Subscriptions](#subscriptions)
- [Tweets](#tweets)

## Authentication

### User Login

- **Endpoint**: `POST /api/v1/login`
- **Description**: User login
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "statuscode": 200,
    "data": {
      "accessToken": "string",
      "refreshToken": "string"
    },
    "message": "Login successful"
  }
  ```
