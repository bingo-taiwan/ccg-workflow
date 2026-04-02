---
name: api-design
description: API 設計。RESTful、GraphQL、OpenAPI、版本管理。當使用者提到 API設計、RESTful、GraphQL、OpenAPI、介面設計時使用。
---

# 🏗 陣法秘典 · API 設計


## RESTful 設計

### 資源命名
```yaml
# 使用名詞複數
GET    /users          # 獲取使用者列表
GET    /users/{id}     # 獲取單個使用者
POST   /users          # 建立使用者
PUT    /users/{id}     # 更新使用者
PATCH  /users/{id}     # 部分更新
DELETE /users/{id}     # 刪除使用者

# 巢狀資源
GET    /users/{id}/orders
POST   /users/{id}/orders

# 避免
GET    /getUsers       # ❌ 動詞
GET    /user           # ❌ 單數
POST   /createUser     # ❌ 動詞
```

### HTTP 狀態碼
```yaml
2xx 成功:
  200: OK
  201: Created
  204: No Content

4xx 客戶端錯誤:
  400: Bad Request
  401: Unauthorized
  403: Forbidden
  404: Not Found
  409: Conflict
  422: Unprocessable Entity

5xx 服務端錯誤:
  500: Internal Server Error
  502: Bad Gateway
  503: Service Unavailable
```

### 響應格式
```json
// 成功響應
{
  "data": {
    "id": 1,
    "name": "Alice"
  }
}

// 列表響應
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}

// 錯誤響應
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {"field": "email", "message": "Invalid format"}
    ]
  }
}
```

## OpenAPI 規範

```yaml
openapi: 3.0.3
info:
  title: User API
  version: 1.0.0

paths:
  /users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'

    post:
      summary: Create user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'
      responses:
        '201':
          description: Created

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
          format: email

    CreateUser:
      type: object
      required:
        - name
        - email
      properties:
        name:
          type: string
        email:
          type: string
```

## GraphQL

```graphql
# Schema
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  author: User!
}

type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
}

input CreateUserInput {
  name: String!
  email: String!
}

# Query
query GetUser($id: ID!) {
  user(id: $id) {
    name
    email
    posts {
      title
    }
  }
}
```

## 版本管理

```yaml
策略:
  URL路徑: /api/v1/users (推薦)
  請求頭: Accept: application/vnd.api+json;version=1
  查詢引數: /api/users?version=1

原則:
  - 向後相容
  - 廢棄通知
  - 遷移指南
```

## 安全設計

```yaml
認證:
  - API Key
  - JWT
  - OAuth 2.0

授權:
  - RBAC
  - ABAC
  - Scope

防護:
  - 速率限制
  - 輸入驗證
  - HTTPS
```

