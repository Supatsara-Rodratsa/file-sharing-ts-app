# File Sharing Web Application 🗂💥

The File Sharing Application is a web-based platform that allows users to create an account, log in and manage their files, as well as share them with specific users.

## Project Description 📄

The project is a file sharing web application with user authentication. It allows users to upload and download files, and share files with other users. The web application is built using TypeScript and Express.js, and uses MongoDB as its database. The HTML templates are created using EJS.

Authentication is implemented using JSON Web Tokens (JWT). When a user logs in, a JWT is generated and returned to the client. This JWT is used to authenticate subsequent requests.

## Main Features ✨

- **User Authentication**: Users can sign up and log in to their account to manage their files.
- **File Management**: Users can upload files to the server and download files from the server.
- **File Management**: Users can manage their uploaded files, including updating file information and deleting files.
- **File Sharing**: Users can share files with specific users by providing their email addresses.

## Technology Used 👩🏼‍💻

- [Node.js](https://nodejs.org/en)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Typescript](https://www.typescriptlang.org/)
- [EJS](https://ejs.co/)
- [JWT](https://jwt.io/)
- [Swagger Editor](https://editor.swagger.io/)

## API Endpoints 🪄💥

### Authentication API

- POST `auth/signup`: Creates a new user account with the provided credentials
- POST `auth/login`: Authenticates the user with the provided credentials and returns a JWT token.
- POST `auth/logout`: Logs out the currently logged in user and invalidates their JWT token.

### User API

- GET `/users`: Returns a list of all users in the system.

### File API

- GET `/files/{userId}`: Returns a list of all files owned by the specified user.
- POST `/files-upload/{userId}`: Uploads a new file to the specified user's account.
- GET `/file/{userId}/{fileId}`: Returns information about the specified file for the specified user ID.
- DELETE `/file/{userId}/{fileId}`: Deletes the specified file for the specified user ID.

### Share API

- POST `/share/{userId}/{fileId}`: Shares the specified file with one or more other users.
- PUT `/share/{userId}/{fileId}`: Updates the sharing settings for the specified file for the specified user ID.
- GET `/share/{userId}/shared-files`: Returns a list of all files that have been shared with the specified user ID.

_Note_: All API endpoints require a valid JWT token to be included in the header of the request.

## Installation 🛠

- Clone the repository.
- Install dependencies with
  `npm install`
- Start the server with
  `npm start`

## Usage 🏃🏻‍♀️

- Open a web browser and navigate to `http://localhost:3000`
- Sign up for a new account or log in to an existing account.
- Upload and download files, and share files with other users.
- Log out when finished.
