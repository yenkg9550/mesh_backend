import { Request, Response, NextFunction } from 'express'
import { Error as MongooseError } from 'mongoose'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Mongoose 驗證錯誤（e.g. 必填欄位缺漏、格式不符）
  if (err instanceof MongooseError.ValidationError) {
    const messages = Object.values(err.errors).map(e => e.message)
    res.status(400).json({ message: '資料驗證失敗', errors: messages })
    return
  }

  // MongoDB 唯一索引衝突（重複 meshId）
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 11000
  ) {
    res.status(409).json({ message: '零件 ID 已存在' })
    return
  }

  console.error(err)
  res.status(500).json({ message: '伺服器內部錯誤' })
}
