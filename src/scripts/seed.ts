/**
 * 初始化資料：將 JSON 範例資料寫入 MongoDB
 * 執行方式：npm run seed
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { Mesh } from '../models/Mesh'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mesh-editor'

const seedData = [
  {
    meshId:     'msh-001',
    name:       '高強度鋁合金支架',
    category:   '結構組件',
    color:      '#A5A9B4',
    basePrice:  1250,
    multiplier: 1.2,
    metadata:   { material: 'Aluminum 6061', weight: '1.5kg' },
  },
  {
    meshId:     'msh-002',
    name:       '強化玻璃視窗',
    category:   '外部面板',
    color:      '#1E293B',
    basePrice:  850,
    multiplier: 1.0,
    metadata:   { material: 'Tempered Glass', weight: '2.2kg' },
  },
  {
    meshId:     'msh-003',
    name:       '散熱模組風扇',
    category:   '電子元件',
    color:      '#FF4D4D',
    basePrice:  450,
    multiplier: 1.5,
    metadata:   { material: 'PBT Plastic', weight: '0.3kg' },
  },
  {
    meshId:     'msh-004',
    name:       '陽極氧化底座',
    category:   '結構組件',
    color:      '#2D3436',
    basePrice:  2100,
    multiplier: 2.0,
    metadata:   { material: 'Steel', weight: '5.0kg' },
  },
]

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  // 清空舊資料再寫入（開發用）
  await Mesh.deleteMany({})
  console.log('🗑️  Cleared existing meshes')

  const inserted = await Mesh.insertMany(seedData)
  console.log(`🌱 Seeded ${inserted.length} meshes`)

  await mongoose.disconnect()
  console.log('🔌 Disconnected')
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
