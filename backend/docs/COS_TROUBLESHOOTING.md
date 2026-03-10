# 腾讯云COS配置问题排查指南

## 当前问题

**错误信息**: `COS连接失败: Forbidden`

这表示COS返回了403错误，说明认证或权限有问题。

## 排查步骤

### 1. 检查存储桶基本信息

登录腾讯云控制台，进入对象存储COS：

**检查项**：
- [ ] 存储桶名称是否正确（完整格式：`bucket-name-appid`）
- [ ] 存储桶所在区域是否正确（如：`ap-guangzhou`、`ap-beijing`、`ap-hongkong`）
- [ ] 存储桶是否存在且未被删除

**如何查看**：
1. 进入 [COS控制台](https://console.cloud.tencent.com/cos)
2. 点击存储桶列表
3. 找到你的存储桶，查看：
   - 存储桶名称（完整名称，包含appid后缀）
   - 所属地域

**正确的配置格式**：
```env
COS_BUCKET=your-bucket-1234567890  # 完整名称，包含appid
COS_REGION=ap-guangzhou            # 地域标识符
```

### 2. 检查API密钥

**检查项**：
- [ ] SecretId 和 SecretKey 是否正确（无多余空格）
- [ ] 密钥是否已启用（未被禁用或删除）
- [ ] 密钥是否已过期

**如何查看**：
1. 进入 [访问管理控制台](https://console.cloud.tencent.com/cam/capi)
2. 点击"API密钥管理"
3. 查看你的密钥状态：
   - 状态应该是"启用"
   - 如果是子账号密钥，检查是否有权限

**注意事项**：
- SecretId 通常以 `AKID` 开头
- SecretKey 是一串随机字符
- 复制时不要包含空格或换行符

### 3. 检查密钥权限

**主账号密钥**：
- 拥有所有权限，无需额外配置

**子账号密钥**（如果使用）：
需要授予以下权限：
- [ ] `PutObject` - 上传对象
- [ ] `GetObject` - 读取对象
- [ ] `DeleteObject` - 删除对象
- [ ] `HeadBucket` - 查询存储桶信息

**如何授权**：
1. 进入 [访问管理控制台](https://console.cloud.tencent.com/cam)
2. 点击"用户" → 找到对应子用户
3. 点击"关联策略"
4. 搜索并关联 `QcloudCOSFullAccess`（完全访问）
   或创建自定义策略授予特定权限

### 4. 检查存储桶权限策略

**检查项**：
- [ ] 存储桶是否设置了访问策略限制
- [ ] 是否限制了IP白名单
- [ ] 是否限制了Referer

**如何查看**：
1. 进入COS控制台 → 选择存储桶
2. 点击"权限管理" → "存储桶访问权限"
3. 查看"Policy权限设置"
4. 如果有策略，确保不会拒绝你的密钥访问

**建议配置**：
- 公共权限：私有读写（Private）
- Policy权限：不设置（或确保允许你的密钥）

### 5. 检查跨域配置（CORS）

虽然不影响后端上传，但前端直传需要配置CORS：

**配置步骤**：
1. 进入COS控制台 → 选择存储桶
2. 点击"安全管理" → "跨域访问CORS设置"
3. 添加规则：
   ```
   来源 Origin: *（或你的域名）
   操作 Methods: GET, POST, PUT, DELETE, HEAD
   Allow-Headers: *
   Expose-Headers: ETag
   超时 Max-Age: 3600
   ```

### 6. 常见错误配置

#### 错误1：存储桶名称不完整
```env
# ❌ 错误
COS_BUCKET=my-bucket

# ✓ 正确（包含appid后缀）
COS_BUCKET=my-bucket-1234567890
```

#### 错误2：区域标识符错误
```env
# ❌ 错误
COS_REGION=guangzhou
COS_REGION=cn-guangzhou

# ✓ 正确
COS_REGION=ap-guangzhou
```

**常用区域标识符**：
- 广州：`ap-guangzhou`
- 上海：`ap-shanghai`
- 北京：`ap-beijing`
- 成都：`ap-chengdu`
- 重庆：`ap-chongqing`
- 香港：`ap-hongkong`
- 新加坡：`ap-singapore`

#### 错误3：密钥包含空格
```env
# ❌ 错误（有空格）
COS_SECRET_ID= <your_secret_id_here>
COS_SECRET_KEY=<your_secret_key_here>

# ✓ 正确
COS_SECRET_ID=AKIDxxxxx
COS_SECRET_KEY=<your_secret_key_here>
```

### 7. 测试COS连接

使用我们提供的诊断脚本：

```bash
cd backend
node src/utils/diagnose.js
```

如果看到：
```
✓ COS连接成功
✓ 存储桶访问正常
✓ 上传权限正常
```

说明配置正确！

### 8. 手动测试上传

如果诊断脚本通过，但前端仍然失败，可以手动测试：

```bash
# 启动后端服务
cd backend
npm run dev

# 在另一个终端测试上传接口
curl -X POST http://localhost:3000/api/upload/avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/test.jpg"
```

## 解决方案

### 方案1：重新创建密钥

如果密钥有问题，建议重新创建：

1. 进入 [API密钥管理](https://console.cloud.tencent.com/cam/capi)
2. 点击"新建密钥"
3. 复制新的 SecretId 和 SecretKey
4. 更新 `backend/.env` 文件
5. 重启后端服务

### 方案2：使用子账号密钥

如果主账号密钥不想暴露，可以创建子账号：

1. 进入 [用户管理](https://console.cloud.tencent.com/cam)
2. 点击"新建用户" → "自定义创建"
3. 选择"可访问资源并接收消息"
4. 设置用户名和访问方式（勾选"编程访问"）
5. 关联策略：`QcloudCOSFullAccess`
6. 完成后获取 SecretId 和 SecretKey

### 方案3：检查账号欠费

如果账号欠费，COS服务会被停用：

1. 进入 [费用中心](https://console.cloud.tencent.com/expense)
2. 查看账户余额
3. 如果欠费，请充值

## 配置示例

### 完整的 .env 配置示例

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blog_system

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# 腾讯云COS配置
COS_SECRET_ID=<your_secret_id_here>
COS_SECRET_KEY=<your_secret_key_here>
COS_REGION=ap-guangzhou
COS_BUCKET=my-blog-images-1234567890
COS_CDN_DOMAIN=https://img.yourdomain.com
```

### 如何获取完整的存储桶名称

1. 进入COS控制台
2. 点击存储桶列表
3. 存储桶名称格式：`bucket-name-appid`
   - 例如：`my-blog-1234567890`
   - 其中 `1234567890` 是你的APPID

### 如何获取CDN域名

**如果使用自定义域名**：
```env
COS_CDN_DOMAIN=https://img.yourdomain.com
```

**如果使用COS默认域名**：
```env
COS_CDN_DOMAIN=https://my-bucket-1234567890.cos.ap-guangzhou.myqcloud.com
```

## 常见问题

### Q1: 提示"存储桶不存在"
**A**: 检查存储桶名称是否包含appid后缀

### Q2: 提示"签名错误"
**A**: 检查SecretId和SecretKey是否正确，是否有多余空格

### Q3: 提示"权限不足"
**A**: 检查密钥是否有COS访问权限

### Q4: 前端上传失败，后端正常
**A**: 检查CORS配置，确保允许前端域名访问

### Q5: 图片上传成功但无法访问
**A**: 检查存储桶公共权限，确保设置为"公开读"或配置了正确的访问策略

## 获取帮助

如果以上步骤都无法解决问题，请提供以下信息：

1. 诊断脚本的完整输出
2. 后端服务启动日志
3. 浏览器控制台的错误信息
4. 存储桶的基本信息（名称、区域）
5. 使用的是主账号还是子账号密钥

## 相关文档

- [腾讯云COS快速入门](https://cloud.tencent.com/document/product/436/38484)
- [COS API密钥管理](https://cloud.tencent.com/document/product/436/68282)
- [COS权限管理](https://cloud.tencent.com/document/product/436/12473)
