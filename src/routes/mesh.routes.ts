import { Router, Request, Response, NextFunction } from 'express'
import { Mesh } from '../models/Mesh'

const router = Router()

// ── GET /api/meshes ─────────────────────────────────────
// 支援 ?category=結構組件&page=1&limit=20
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1)
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20)
    const skip  = (page - 1) * limit

    // 動態篩選條件
    const filter: Record<string, unknown> = {}
    if (req.query.category) filter.category = req.query.category

    const [items, total] = await Promise.all([
      Mesh.find(filter).sort({ meshId: 1 }).skip(skip).limit(limit),
      Mesh.countDocuments(filter),
    ])

    res.json({
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/meshes/:meshId ──────────────────────────────
router.get('/:meshId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mesh = await Mesh.findOne({ meshId: req.params.meshId })
    if (!mesh) {
      res.status(404).json({ message: '找不到該零件' })
      return
    }
    res.json(mesh)
  } catch (err) {
    next(err)
  }
})

// ── POST /api/meshes ─────────────────────────────────────
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mesh = await Mesh.create(req.body)
    res.status(201).json(mesh)
  } catch (err) {
    next(err)
  }
})

// ── PATCH /api/meshes/:meshId ────────────────────────────
// 部分更新（前端編輯器修改顏色或數值後呼叫）
router.patch('/:meshId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mesh = await Mesh.findOneAndUpdate(
      { meshId: req.params.meshId },
      { $set: req.body },
      {
        new:        true,   // 回傳更新後的文件
        runValidators: true, // 執行 Schema 驗證
      }
    )
    if (!mesh) {
      res.status(404).json({ message: '找不到該零件' })
      return
    }
    res.json(mesh)
  } catch (err) {
    next(err)
  }
})

// ── DELETE /api/meshes/:meshId ───────────────────────────
router.delete('/:meshId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mesh = await Mesh.findOneAndDelete({ meshId: req.params.meshId })
    if (!mesh) {
      res.status(404).json({ message: '找不到該零件' })
      return
    }
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

export default router
