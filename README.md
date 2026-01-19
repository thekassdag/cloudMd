# CloudMd - Cloud-Based File Collaboration Platform

This project is a cloud-based file collaboration platform with a React frontend and a Node.js/Express backend.

## Project Structure

-   `backend/`: Contains the Node.js/Express API.
-   `frontend/`: Contains the React application.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

-   Node.js (LTS version recommended)
-   npm or yarn
-   AWS Account with S3 bucket and credentials (for document storage)

#### AWS S3 Bucket Setup

1.  Log in to your AWS Management Console.
2.  Navigate to the S3 service.
3.  Create a new S3 bucket. Choose a unique name (e.g., `your-app-name-documents`).
4.  Ensure the bucket is configured for public access if your application requires it, or configure appropriate bucket policies for access from your backend.
5.  Note down the bucket name and the region it's created in.

### 1. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

#### Install Dependencies

```bash
npm install
# or
yarn install
```

#### Environment Configuration

Create a `.env` file in the `backend/` directory based on `.env.example` (if available, otherwise create these variables):

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name
NODE_ENV=development
USE_LOCALSTACK=true
```

-   `MONGO_URI`: Your MongoDB connection string. If you're using a local MongoDB, it might be `mongodb://localhost:27017/filecollab`.
-   `JWT_SECRET`: A strong, random string for JWT token signing.
-   `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`: Your AWS credentials and S3 bucket details for document storage.
-   `NODE_ENV`: Set to `development` for local development.
-   `USE_LOCALSTACK`: Set to `true` if you are using LocalStack for local AWS services.

#### Database Initialization and Seeding

First, initialize the database (creates necessary collections/indexes if they don't exist):

```bash
node initDb.js
```

Then, seed the database with sample users and documents:

```bash
node seedDb.js
```

#### Running the Backend

```bash
npm start
# or
yarn start
```

The backend API will be running at `http://localhost:5000` (or your specified `PORT`).

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` directory:

```bash
cd frontend
```

#### Install Dependencies

```bash
npm install
# or
yarn install
```

#### Environment Configuration

Create a `.env` file in the `frontend/` directory.

```
VITE_API_BASE_URL=http://localhost:5000/api
```

-   `VITE_API_BASE_URL`: Should point to your backend API URL.

#### Running the Frontend

```bash
npm run dev
# or
yarn dev
```

The frontend application will typically open in your browser at `http://localhost:5173` (or another port if 5173 is in use).

## Sample User Credentials

After seeding the database, you can log in with the following sample users, all using the password `password123`:

-   **Alice Smith:** `alice@example.com`
-   **Bob Johnson:** `bob@example.com`
-   **Charlie Brown:** `charlie@example.com`
-   **Diana Prince:** `diana@example.com`
-   **Eve Adams:** `eve@example.com`

Feel free to register new users through the application's registration page as well.
