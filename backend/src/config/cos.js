const COS = require('cos-nodejs-sdk-v5');

// 腾讯云COS配置
const cosClient = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY
});

// COS配置常量
const COS_CONFIG = {
  Bucket: process.env.COS_BUCKET,
  Region: process.env.COS_REGION,
  CDNDomain: process.env.COS_CDN_DOMAIN
};

// 文件类型白名单
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// 文件大小限制（字节）
const MAX_SIZE = {
  avatar: 2 * 1024 * 1024,    // 2MB
  cover: 5 * 1024 * 1024,     // 5MB
  content: 10 * 1024 * 1024   // 10MB
};

// COS目录结构
const COS_PATHS = {
  avatar: 'avatars',
  cover: 'covers',
  content: 'content'
};

/**
 * 上传文件到COS
 * @param {Buffer} fileBuffer - 文件缓冲区
 * @param {string} fileName - 文件名
 * @param {string} type - 文件类型（avatar/cover/content）
 * @param {string} contentType - MIME类型
 * @returns {Promise<string>} - 返回CDN URL
 */
const uploadToCOS = async (fileBuffer, fileName, type, contentType) => {
  const key = `${COS_PATHS[type]}/${fileName}`;

  return new Promise((resolve, reject) => {
    cosClient.putObject({
      Bucket: COS_CONFIG.Bucket,
      Region: COS_CONFIG.Region,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: 'max-age=2592000' // 缓存30天
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        // 返回CDN域名URL
        const url = `${COS_CONFIG.CDNDomain}/${key}`;
        resolve(url);
      }
    });
  });
};

/**
 * 从COS删除文件
 * @param {string} cosKey - COS对象键
 * @returns {Promise<void>}
 */
const deleteFromCOS = async (cosKey) => {
  return new Promise((resolve, reject) => {
    cosClient.deleteObject({
      Bucket: COS_CONFIG.Bucket,
      Region: COS_CONFIG.Region,
      Key: cosKey
    }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * 从URL提取COS Key
 * @param {string} url - 完整URL
 * @returns {string} - COS Key
 */
const extractCOSKey = (url) => {
  if (!url) return null;
  const cdnDomain = COS_CONFIG.CDNDomain;
  if (url.startsWith(cdnDomain)) {
    return url.replace(cdnDomain + '/', '');
  }
  return null;
};

module.exports = {
  cosClient,
  COS_CONFIG,
  ALLOWED_TYPES,
  MAX_SIZE,
  COS_PATHS,
  uploadToCOS,
  deleteFromCOS,
  extractCOSKey
};
