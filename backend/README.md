# Backend API - Cozy Cacoon

## Project Structure (Modular)

```
backend/
├── config/
│   └── database.js          # MongoDB connection with fallback logic
├── middleware/
│   ├── errorHandler.js      # Centralized error handling
│   └── multer.js            # File upload configuration
├── models/
│   ├── Product.js           # Product schema
│   ├── Order.js             # Order schema
│   └── CustomRequest.js     # Custom request schema
├── routes/
│   ├── productRoutes.js     # Product endpoints
│   ├── orderRoutes.js       # Order endpoints
│   ├── requestRoutes.js     # Custom request endpoints
│   └── authRoutes.js        # Authentication endpoints
├── utils/
│   └── response.js          # Response utilities
├── uploads/                 # Uploaded files (created automatically)
├── .env                     # Environment variables
├── server.js                # Main Express app
└── package.json             # Dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables (.env)

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>
PORT=5000
ADMIN_USER=admin
ADMIN_PASS=password123
NODE_ENV=development
```

### 3. MongoDB Atlas Setup (to fix auth errors)

If you get "bad auth: authentication failed":

- Go to [MongoDB Atlas](https://cloud.mongodb.com)
- Navigate to Network Access
- Click "Add IP Address"
- Select "Allow access from anywhere" (0.0.0.0/0) for development
- Or add your specific IP

### 4. Run the Server

**Development:**
```bash
npm run dev  # With nodemon for auto-restart
```

**Production:**
```bash
npm run start
```

## API Endpoints

### Health Check
- `GET /api/health` - Server status and DB connection

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Add product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Track order
- `PATCH /api/orders/:id/status` - Update status (admin)

### Custom Requests
- `POST /api/requests` - Submit request (with file upload)
- `GET /api/requests` - Get all requests (admin)

### Authentication
- `POST /api/auth/login` - Admin login

## File Upload (Multer)

Use multipart/form-data for requests with files:

```bash
curl -X POST http://localhost:5000/api/requests \
  -F "name=John Doe" \
  -F "description=Custom sweater" \
  -F "referenceImage=@image.jpg"
```

**Allowed types:** JPEG, PNG, GIF, PDF  
**Max size:** 5MB

## Features

- ✓ Modular architecture (config, middleware, utils separated)
- ✓ MongoDB connection with fallback to local
- ✓ Centralized error handling
- ✓ File upload via Multer
- ✓ CORS enabled
- ✓ Health check endpoint
- ✓ DB status tracking

## Troubleshooting

**MongoDB "bad auth" error:**
- Check MONGO_URI in .env
- Verify credentials are URL-encoded
- Add IP 0.0.0.0/0 to MongoDB Atlas Network Access

**"Connection refused" on localhost:27017:**
- Install local MongoDB or use MongoDB Atlas
- Check `.env` MONGO_URI is pointing to correct cluster

**Port already in use:**
- Change PORT in .env
- Or kill process: `lsof -ti :5000 | xargs kill -9`
