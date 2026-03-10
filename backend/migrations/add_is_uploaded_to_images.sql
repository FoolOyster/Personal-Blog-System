-- 添加 is_uploaded 字段到 images 表
ALTER TABLE images ADD COLUMN is_uploaded BOOLEAN DEFAULT TRUE COMMENT '是否通过上传功能上传';

-- 为现有记录设置默认值
UPDATE images SET is_uploaded = TRUE WHERE is_uploaded IS NULL;
