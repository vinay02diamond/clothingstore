import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import porductRouter from "./routes/productRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import connectDB from "./config/mongodb.js"
import cookieParser from "cookie-parser"
import adminRouter from "./routes/adminRoute.js"
import { stripeWebhooks } from "./controllers/orderController.js"


const app = express()  // Initialize Express application
const port = process.env.PORT || 4000 // Define server port

await connectDB()  // Establish connection to the database
await connectCloudinary() // Set up Cloudinary for image storage

// Allow multiple origins (removed trailing slash and added localhost for dev)
const allowedOrigins = [
  'https://clothing-frontend-eight.vercel.app',
  'http://localhost:3000'
]

app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

// Middleware setup 
app.use(express.json()) // Enables JSON request body parsing
app.use(cookieParser()) // Cookie-parser middleware To parse HTTP request cookies

// CORS: use a function so a specific Access-Control-Allow-Origin header is sent
const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser requests like curl or server-to-server (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));
// Handle preflight requests
app.options('*', cors(corsOptions));

// Define API routes
app.use('/api/user', userRouter) // Routes for user-related operations
app.use('/api/admin', adminRouter) // Routes for admin-related operations  
app.use('/api/product', porductRouter) // Routes for product management
app.use('/api/cart', cartRouter) // Routes for cart functionality
app.use('/api/order', orderRouter) // Routes for handling orders

// Root endpoint to check API status
app.get('/',(req, res)=>{
    res.send("API successfully connected!")
})

// Start the server
app.listen(port, ()=> console.log('Server is running on PORT: '+ port))