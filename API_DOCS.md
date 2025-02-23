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

### Refresh Access Token

- **Endpoint**: `POST /api/v1/refresh`
- **Description**: Refresh access token
- **Request Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response**:
  ```json
  {
    "statuscode": 200,
    "data": {
      "accessToken": "string"
    },
    "message": "Token refreshed successfully"
  }
  ```

## Users

### Get Current User

- **Endpoint**: `GET /api/v1/users/current-user`
- **Description**: Get current user
- **Headers**: `Authorization: Bearer <access_token>`

- **Response**:

  ```json
  {
    "statuscode": 200,
    "data": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "fullname": "string",
      "avatar": "string"
    },
    "message": "User fetched successfully"
  }
  ```

  ### Update User Profile

- **Endpoint**: `PATCH /api/v1/users/update`
- **Description**: Update user profile
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:

```json
{
  "username": "string",
  "email": "string",
  "fullname": "string",
  "avatar": "string"
}
```

- **Response**:

  ```json
  {
    "statuscode": 200,
    "data": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "fullname": "string",
      "avatar": "string"
    },
    "message": "User profile updated successfully"
  }
  ```

  ## Videos

  ### Upload Video

  - **Endpoint**: `POST /api/v1/videos`
  - **Description**: Upload video
  - **Headers**: `Authorization: Bearer <access_token>`
    `Content-Type: multipart/form-data`
  - **Request Body**:

```json
{
  "username": "string",
  "email": "string",
  "fullname": "string",
  "avatar": "string"
}
```

- **Response**:
  ```json
  {
    "statuscode": 200,
    "data": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "fullname": "string",
      "avatar": "string"
    },
    "message": "User profile updated successfully"
  }
  ```
