const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  let connection;

  try {
    // 首先连接到 MySQL 服务器（不指定数据库）
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✓ 已连接到 MySQL 服务器');

    // 读取 SQL 文件
    const sqlFile = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // 执行 SQL 语句
    await connection.query(sql);
    console.log('✓ 数据库和表创建成功');

    // 验证表是否创建成功
    const [tables] = await connection.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}'
    `);

    console.log('\n已创建的表：');
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    console.log('\n✓ 数据库初始化完成！');

  } catch (error) {
    console.error('✗ 数据库初始化失败：', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行初始化
initDatabase();
