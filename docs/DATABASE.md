# 个人博客系统 数据库结构

## 用户表
- id（主键）
- username（用户名，唯一）
- email（邮箱，唯一）
- password（密码，加密存储）
- avatar（头像 URL）
- created_at（创建时间）

## 文章表
- id
- tilte（标题）
- content（内容，Markdown格式）
- cover（封面图 URL）
- category（分类）
- tags （标签，JSON数组）
- author_id（作者ID，外键关联users）
- views（浏览次数）
- created_at（创建时间）
- up_dated_at（更新时间）

## 分类表
- id
- name（分类名称）
- description（分类描述）