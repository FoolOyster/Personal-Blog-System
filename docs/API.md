# API 文档

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **请求格式**: JSON
- **响应格式**: JSON

## 认证相关

### 用户注册
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "token": "jwt_token",
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "avatar": "string",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 用户登录
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

## 文章相关

### 获取文章列表
```http
GET /posts?page=1&pageSize=10&category_id=1&keyword=搜索词
```

**响应**:
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 获取文章详情
```http
GET /posts/:id
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "string",
    "content": "string",
    "cover": "string",
    "views": 100,
    "category_id": 1,
    "category_name": "string",
    "tags": ["tag1", "tag2"],
    "author_id": 1,
    "author_name": "string",
    "author_avatar": "string",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 创建文章
```http
POST /posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  "cover": "string",
  "category_id": 1,
  "tags": ["tag1", "tag2"]
}
```

### 更新文章
```http
PUT /posts/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  "cover": "string",
  "category_id": 1,
  "tags": ["tag1", "tag2"]
}
```

### 删除文章
```http
DELETE /posts/:id
Authorization: Bearer {token}
```

### 获取我的文章
```http
GET /posts/my/posts?page=1&pageSize=100
Authorization: Bearer {token}
```

### 获取我的统计
```http
GET /posts/my/stats
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "totalPosts": 10,
    "totalViews": 1000,
    "totalTags": 5
  }
}
```

## 分类相关

### 获取分类列表
```http
GET /categories
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "技术",
      "description": "技术相关文章"
    }
  ]
}
```

## 图片上传

### 上传头像
```http
POST /upload/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

image: File
```

### 上传封面
```http
POST /upload/cover
Authorization: Bearer {token}
Content-Type: multipart/form-data

image: File
oldCover: string (可选)
```

### 上传文章图片
```http
POST /upload/content
Authorization: Bearer {token}
Content-Type: multipart/form-data

image: File
```

**响应**:
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/image.jpg"
  }
}
```

## 错误响应

所有错误响应格式：
```json
{
  "success": false,
  "message": "错误信息"
}
```

常见状态码：
- `200`: 成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器错误
