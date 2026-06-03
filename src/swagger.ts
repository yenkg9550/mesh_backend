import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mesh Editor API',
      version: '1.0.0',
      description: '模型零件管理 API（前端實際使用的端點）',
    },
    servers: [
      { url: 'http://localhost:3000', description: '本地開發' },
      { url: 'http://43.212.10.4:3000', description: 'EC2 正式環境' },
    ],
    components: {
      schemas: {
        Mesh: {
          type: 'object',
          properties: {
            meshId:     { type: 'string',  example: 'msh-001' },
            name:       { type: 'string',  example: '高強度鋁合金支架' },
            category:   { type: 'string',  example: '結構組件' },
            color:      { type: 'string',  example: '#A5A9B4' },
            basePrice:  { type: 'number',  example: 1250 },
            multiplier: { type: 'number',  example: 1.2 },
            unitPrice:  { type: 'number',  example: 1500, description: '計算欄位，不存入 DB' },
            metadata: {
              type: 'object',
              properties: {
                material: { type: 'string', example: 'Aluminum 6061' },
                weight:   { type: 'string', example: '1.5kg' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        MeshPatch: {
          type: 'object',
          description: '可更新的欄位',
          properties: {
            color:      { type: 'string', example: '#FF0000' },
            basePrice:  { type: 'number', example: 1500 },
            multiplier: { type: 'number', example: 1.5 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: '找不到該零件' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['系統'],
          summary: '健康檢查',
          responses: {
            200: {
              description: '服務正常運作',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/meshes': {
        get: {
          tags: ['零件'],
          summary: '取得所有零件',
          description: '前端啟動時呼叫，載入零件清單與 BOM 總表',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              description: '每頁筆數（最大 100）',
              schema: { type: 'integer', default: 20 },
            },
            {
              name: 'page',
              in: 'query',
              description: '第幾頁（從 1 開始）',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'category',
              in: 'query',
              description: '依類別篩選',
              schema: { type: 'string', example: '結構組件' },
            },
          ],
          responses: {
            200: {
              description: '成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Mesh' },
                      },
                      meta: {
                        type: 'object',
                        properties: {
                          page:       { type: 'integer', example: 1 },
                          limit:      { type: 'integer', example: 20 },
                          total:      { type: 'integer', example: 4 },
                          totalPages: { type: 'integer', example: 1 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/meshes/{meshId}': {
        patch: {
          tags: ['零件'],
          summary: '更新零件材質設定',
          description: '右側 Material Editor 修改顏色、價格或倍率後呼叫',
          parameters: [
            {
              name: 'meshId',
              in: 'path',
              required: true,
              schema: { type: 'string', example: 'msh-001' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MeshPatch' },
              },
            },
          },
          responses: {
            200: {
              description: '更新成功，回傳更新後資料',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Mesh' },
                },
              },
            },
            404: {
              description: '找不到該零件',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
}

export const swaggerSpec = swaggerJsdoc(options)
