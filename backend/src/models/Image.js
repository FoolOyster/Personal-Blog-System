const db = require('../config/database');

/**
 * 创建images表
 */
const createImagesTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS images (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      type ENUM('avatar', 'cover', 'content') NOT NULL,
      url VARCHAR(500) NOT NULL,
      cos_key VARCHAR(500) NOT NULL,
      size INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_type (type),
      INDEX idx_cos_key (cos_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await db.query(createTableSQL);
    console.log('✓ Images表创建成功');
  } catch (error) {
    console.error('✗ Images表创建失败:', error.message);
    throw error;
  }
};

/**
 * 更新users表avatar字段长度
 */
const updateUsersTable = async () => {
  const alterTableSQL = `
    ALTER TABLE users MODIFY avatar VARCHAR(500);
  `;

  try {
    await db.query(alterTableSQL);
    console.log('✓ Users表avatar字段更新成功');
  } catch (error) {
    // 如果字段已经是VARCHAR(500)，会报错，但可以忽略
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error('✗ Users表更新失败:', error.message);
    }
  }
};

/**
 * 更新posts表cover字段长度
 */
const updatePostsTable = async () => {
  const alterTableSQL = `
    ALTER TABLE posts MODIFY cover VARCHAR(500);
  `;

  try {
    await db.query(alterTableSQL);
    console.log('✓ Posts表cover字段更新成功');
  } catch (error) {
    // 如果字段已经是VARCHAR(500)，会报错，但可以忽略
    if (error.code !== 'ER_DUP_FIELDNAME') {
      console.error('✗ Posts表更新失败:', error.message);
    }
  }
};

/**
 * 初始化图片上传相关数据库结构
 */
const initImageUpload = async () => {
  console.log('开始初始化图片上传数据库结构...');

  try {
    await createImagesTable();
    await updateUsersTable();
    await updatePostsTable();
    console.log('✓ 图片上传数据库结构初始化完成');
  } catch (error) {
    console.error('✗ 初始化失败:', error);
    throw error;
  }
};

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  initImageUpload()
    .then(() => {
      console.log('数据库初始化成功');
      process.exit(0);
    })
    .catch((error) => {
      console.error('数据库初始化失败:', error);
      process.exit(1);
    });
}

module.exports = {
  createImagesTable,
  updateUsersTable,
  updatePostsTable,
  initImageUpload
};
