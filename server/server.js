import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import connectCloudinary from './configs/cloudinary.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import { clerkMiddleware } from '@clerk/express'
import educatorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoutes.js'
import userRouter from './routes/userRoutes.js'

// Initialize Express
const app = express()

// Connect to DB & Cloudinary
await connectDB()
await connectCloudinary()

// Middlewares
app.use(cors())
app.use(clerkMiddleware())

// ✅ Stripe Webhook MUST be before `express.json()`
// Because Stripe requires `raw` body parsing for signature verification
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

// Webhook for Clerk
app.post('/clerk', express.json(), clerkWebhooks)

// General JSON Parser for APIs
app.use(express.json())

// Routes
app.get('/', (req, res) => res.send("API Working!"))
app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)

// Port
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`)
})
