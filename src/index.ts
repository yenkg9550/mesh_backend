import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import meshRoutes from './routes/mesh.routes'
import { errorHandler } from './middleware/errorHandler'

const app  = express()
const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mesh-editor'

// ── Middleware ───────────────────────────────────────────
app.use(cors())
app.use(express.json())

// ── Routes ───────────────────────────────────────────────
app.use('/api/meshes', meshRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ── Error handler（放最後）──────────────────────────────
app.use(errorHandler)

// ── DB + Server ──────────────────────────────────────────
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGODB_URI)
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err)
    process.exit(1)
  })
