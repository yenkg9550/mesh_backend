import { Router, Request, Response, NextFunction } from 'express'
import { Mesh } from '../models/Mesh'

const router = Router()

// GET /api/meshes?page=1&limit=20&category=結構組件
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1)
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20)
    const skip  = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    if (req.query.category) {
      filter.category = req.query.category
    }

    const [items, total] = await Promise.all([
      Mesh.find(filter).sort({ meshId: 1 }).skip(skip).limit(limit),
      Mesh.countDocuments(filter),
    ])

    res.json({
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/meshes/:meshId
router.patch('/:meshId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mesh = await Mesh.findOneAndUpdate(
      { meshId: req.params.meshId },
      { $set: req.body },
      {
        new: true,           // 回傳更新後的文件
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

export default router
