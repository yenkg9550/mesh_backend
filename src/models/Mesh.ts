import { Schema, model, Document } from 'mongoose'

// ── TypeScript 介面 ──────────────────────────────────────
export interface IMeshMetadata {
  material: string
  weight: string
}

export interface IMesh extends Document {
  meshId:     string          // 業務 ID（msh-001）
  name:       string
  category:   string
  color:      string          // hex color，e.g. "#A5A9B4"
  basePrice:  number
  multiplier: number
  metadata:   IMeshMetadata
  createdAt:  Date
  updatedAt:  Date
}

// ── Sub-schema：metadata ─────────────────────────────────
const MetadataSchema = new Schema<IMeshMetadata>(
  {
    material: { type: String, required: true, trim: true },
    weight:   { type: String, required: true, trim: true },
  },
  { _id: false }  // 不為 sub-document 產生多餘的 _id
)

// ── Main Schema ──────────────────────────────────────────
const MeshSchema = new Schema<IMesh>(
  {
    meshId: {
      type:     String,
      required: true,
      unique:   true,       // 唯一索引，查詢單筆零件最快
      trim:     true,
      match:    /^msh-\d{3,}$/,   // 格式驗證：msh-001
    },
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    category: {
      type:     String,
      required: true,
      trim:     true,
      // 一般索引（non-unique）
      // 常用於「篩選同一類別所有零件」的查詢
      index:    true,
    },
    color: {
      type:      String,
      required:  true,
      match:     /^#[0-9a-fA-F]{6}$/,   // 格式驗證：#rrggbb
      default:   '#CCCCCC',
    },
    basePrice: {
      type:    Number,
      required: true,
      min:     [0, 'basePrice 不能為負數'],
    },
    multiplier: {
      type:    Number,
      required: true,
      min:     [0.1, 'multiplier 最小 0.1'],
      max:     [10,  'multiplier 最大 10'],
      default: 1.0,
    },
    metadata: {
      type:     MetadataSchema,
      required: true,
    },
  },
  {
    timestamps: true,   // 自動產生 createdAt、updatedAt
    versionKey: false,  // 移除 __v 欄位
  }
)

// ── 複合索引：同時以 category + basePrice 排序查詢 ───────
// 例如：「找所有結構組件，依價格排序」
MeshSchema.index({ category: 1, basePrice: -1 })

// ── Virtual：計算單價（不儲存進 DB） ────────────────────
MeshSchema.virtual('unitPrice').get(function (this: IMesh) {
  return +(this.basePrice * this.multiplier).toFixed(2)
})

// toJSON 時帶出 virtual 欄位
MeshSchema.set('toJSON', { virtuals: true })

export const Mesh = model<IMesh>('Mesh', MeshSchema)
