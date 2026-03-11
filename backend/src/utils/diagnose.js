const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

console.log('=== 图片上传功能诊断 ===\n');

// 1. 检查环境变量
console.log('1. 环境变量检查:');
const requiredEnvs = [
  'COS_SECRET_ID',
  'COS_SECRET_KEY',
  'COS_REGION',
  'COS_BUCKET',
  'COS_CDN_DOMAIN',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME'
];

let envOk = true;
requiredEnvs.forEach(key => {
  const value = process.env[key];
  if (!value || value === 'your_' + key.toLowerCase() || value.includes('your-')) {
    console.log(`   ❌ ${key}: 未配置或使用默认值`);
    envOk = false;
  } else {
    console.log(`   ✓ ${key}: 已配置 (${value.substring(0, 10)}...)`);
  }
});

if (!envOk) {
  console.log('\n⚠️  请检查 backend/.env 文件，确保所有COS配置都已正确填写\n');
  process.exit(1);
}

// 2. 测试数据库连接
console.log('\n2. 数据库连接测试:');
const db = require('../config/database');

(async () => {
  try {
    const [rows] = await db.query('SELECT 1 as test');
    console.log('   ✓ 数据库连接成功');

    // 检查images表是否存在
    const [tables] = await db.query("SHOW TABLES LIKE 'images'");
    if (tables.length === 0) {
      console.log('   ❌ images表不存在，请运行: node src/models/Image.js');
    } else {
      console.log('   ✓ images表已存在');
    }
  } catch (error) {
    console.log('   ❌ 数据库连接失败:', error.message);
    console.log('   请检查数据库配置和MySQL服务是否启动');
  }

  // 3. 测试COS连接
  console.log('\n3. 腾讯云COS连接测试:');
  try {
    const COS = require('cos-nodejs-sdk-v5');
    const cos = new COS({
      SecretId: process.env.COS_SECRET_ID,
      SecretKey: process.env.COS_SECRET_KEY
    });

    // 测试获取存储桶信息
    cos.headBucket({
      Bucket: process.env.COS_BUCKET,
      Region: process.env.COS_REGION
    }, (err, data) => {
      if (err) {
        console.log('   ❌ COS连接失败:', err.message);
        console.log('   请检查:');
        console.log('   - COS_SECRET_ID 和 COS_SECRET_KEY 是否正确');
        console.log('   - COS_BUCKET 和 COS_REGION 是否正确');
        console.log('   - 存储桶是否存在');
        console.log('   - 密钥是否有访问该存储桶的权限');
      } else {
        console.log('   ✓ COS连接成功');
        console.log('   ✓ 存储桶访问正常');

        // 测试上传权限
        const testKey = 'test-upload-' + Date.now() + '.txt';
        cos.putObject({
          Bucket: process.env.COS_BUCKET,
          Region: process.env.COS_REGION,
          Key: testKey,
          Body: 'test'
        }, (err, data) => {
          if (err) {
            console.log('   ❌ 上传权限测试失败:', err.message);
            console.log('   请检查密钥是否有写入权限');
          } else {
            console.log('   ✓ 上传权限正常');

            // 删除测试文件
            cos.deleteObject({
              Bucket: process.env.COS_BUCKET,
              Region: process.env.COS_REGION,
              Key: testKey
            }, () => {
              console.log('   ✓ 删除权限正常');

              // 4. 检查依赖包
              console.log('\n4. 依赖包检查:');
              try {
                require('multer');
                console.log('   ✓ multer 已安装');
              } catch (e) {
                console.log('   ❌ multer 未安装，请运行: npm install multer');
              }

              try {
                require('sharp');
                console.log('   ✓ sharp 已安装');
              } catch (e) {
                console.log('   ❌ sharp 未安装，请运行: npm install sharp');
              }

              try {
                require('cos-nodejs-sdk-v5');
                console.log('   ✓ cos-nodejs-sdk-v5 已安装');
              } catch (e) {
                console.log('   ❌ cos-nodejs-sdk-v5 未安装，请运行: npm install cos-nodejs-sdk-v5');
              }

              console.log('\n=== 诊断完成 ===\n');
              process.exit(0);
            });
          }
        });
      }
    });
  } catch (error) {
    console.log('   ❌ COS SDK初始化失败:', error.message);
    process.exit(1);
  }
})();
