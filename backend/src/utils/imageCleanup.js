const db = require('../config/database');
const { deleteFromCOS, extractCOSKey, COS_CONFIG } = require('../config/cos');

/**
 * 删除旧图片（仅删除通过上传功能上传的图片）
 * @param {string} imageUrl - 图片 URL
 * @returns {Promise<boolean>} - 是否成功删除
 */
async function deleteOldImage(imageUrl) {
  if (!imageUrl) return false;

  try {
    // 1. 检查是否为 CDN 域名下的图片
    if (!imageUrl.startsWith(COS_CONFIG.CDNDomain)) {
      console.log('图片不在 CDN 域名下，跳过删除:', imageUrl);
      return false;
    }

    // 2. 查询 images 表，检查是否为上传的图片
    const [rows] = await db.query(
      'SELECT id, cos_key, is_uploaded FROM images WHERE url = ? AND is_uploaded = TRUE',
      [imageUrl]
    );

    if (rows.length === 0) {
      console.log('图片不存在或非上传图片，跳过删除:', imageUrl);
      return false;
    }

    const image = rows[0];

    // 3. 删除 COS 中的文件
    try {
      await deleteFromCOS(image.cos_key);
      console.log('COS 文件删除成功:', image.cos_key);
    } catch (cosError) {
      console.error('COS 文件删除失败:', cosError);
      // 继续删除数据库记录，即使 COS 删除失败
    }

    // 4. 删除数据库记录
    await db.query('DELETE FROM images WHERE id = ?', [image.id]);
    console.log('数据库记录删除成功:', image.id);

    return true;
  } catch (error) {
    console.error('删除旧图片失败:', error);
    return false;
  }
}

module.exports = {
  deleteOldImage
};
