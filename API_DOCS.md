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
    `title`: The title of the video
    `description`: The description of the video
    `videoFile` : The video file
    `thumbnail` : The thumbnail image

- **Response**:

  ```json
  {
    "statuscode": 201,
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "videoFile": {
        "url": "string",
        "public_id": "string"
      },
      "thumbnail": {
        "url": "string",
        "public_id": "string"
      },
      "duration": 120,
      "owner": {
        "username": "string",
        "fullname": "string",
        "avatar": "string"
      },
      "isPublished": true,
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    },
    "message": "Video uploaded successfully"
  }
  ```

  ### Get Video by ID

  - **Endpoint**: `GET /api/v1/videos/:videoId`
  - **Description**: Get video by ID

  - **Headers**: `Authorization: Bearer <access_token>`

- **Response**:
  ```json
  {
    "statuscode": 200,
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "videoFile": {
        "url": "string",
        "public_id": "string"
      },
      "thumbnail": {
        "url": "string",
        "public_id": "string"
      },
      "duration": 120,
      "owner": {
        "username": "string",
        "fullname": "string",
        "avatar": "string"
      },
      "isPublished": true,
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    },
    "message": "Video fetched successfully"
  }
  ```

### Update Video Details

- **Endpoint**: `PATCH /api/v1/videos/:videoId`

  - **Description**: Update video details

  - **Headers**: `Authorization: Bearer <access_token>`
    `Content-Type: multipart/form-data`

  - **Request Body** (form-data) :
    `title`: The new title of the video (optional)
    `description`: The new description of the video (optional)
    `thumbnail`: The new thumbnail image (optional)

- **Response**:
  ```json
  {
    "statuscode": 200,
    "data": {
      "_id": "string",
      "title": "string",
      "description": "string",
      "videoFile": {
        "url": "string",
        "public_id": "string"
      },
      "thumbnail": {
        "url": "string",
        "public_id": "string"
      },
      "duration": 120,
      "owner": {
        "username": "string",
        "fullname": "string",
        "avatar": "string"
      },
      "isPublished": true,
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    },
    "message": "Video updated successfully"
  }
  ```

### Delete Video

- **Endpoint** : `DELETE /api/v1/videos/:videoId`
- **Response** :

```json
{
  "statuscode": 200,
  "message": "Video deleted successfully"
}
```

### Toggle Publish Status

- **Endpoint** : `PATCH /api/v1/videos/:videoId/toggle-publish`
- **Response** :

```json
{
  "statuscode": 200,
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "videoFile": {
      "url": "string",
      "public_id": "string"
    },
    "thumbnail": {
      "url": "string",
      "public_id": "string"
    },
    "duration": 120,
    "owner": {
      "username": "string",
      "fullname": "string",
      "avatar": "string"
    },
    "isPublished": true,
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  },
  "message": "Video publish status toggled successfully"
}
```

## Playlists

### Create Playlist

- **Endpoint** : `POST /api/v1/playlists`
- **Headers** : `Content-Type: application/json`
- **Request Body** :

```json
{
  "name": "string",
  "description": "string"
}
```

- **Response** :

```json
{
  "statuscode": 201,
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "owner": "string",
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  },
  "message": "Playlist created successfully"
}
```

### Get User Playlists

- **Endpoint** : `GET /api/v1/playlists/user/:userId`

- **Response** :

```json
{
  "statuscode": 200,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "owner": {
        "username": "string",
        "avatar": "string"
      },
      "videos": [
        {
          "title": "string",
          "thumbnail": "string",
          "duration": 120,
          "views": 1000,
          "createdAt": "2024-01-20T10:00:00Z"
        }
      ],
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ],
  "message": "User playlists fetched successfully"
}
```

### Get Playlist by ID

- **Endpoint** : `GET /api/v1/playlists/:playlistId`

- **Response** :

```json
{
  "statuscode": 200,
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "owner": {
      "username": "string",
      "avatar": "string"
    },
    "videos": [
      {
        "title": "string",
        "thumbnail": "string",
        "duration": 120,
        "views": 1000,
        "createdAt": "2024-01-20T10:00:00Z"
      }
    ],
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  },
  "message": "Playlist details fetched successfully"
}
```

### Add Video to Playlist

- **Endpoint** : `POST /api/v1/playlists/:playlistId/videos/:videoId`

- **Response** :

```json
{
  "statuscode": 200,
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "owner": "string",
    "videos": ["string"],
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  },
  "message": "Video added to playlist successfully"
}
```

### Remove Video from Playlist

- **Endpoint** : `DELETE /api/v1/playlists/:playlistId/videos/:videoId`

- **Response** :

```json
{
  "statuscode": 200,
  "data": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "owner": "string",
    "videos": ["string"],
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  },
  "message": "Video removed from playlist successfully"
}
```

### Delete Playlist

- **Endpoint** : `DELETE /api/v1/playlists/:playlistId`

- **Response** :

```json
{
  "statuscode": 200,
  "message": "Playlist deleted successfully"
}
```
