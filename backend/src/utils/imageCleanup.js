const db = require('../config/database');
const { deleteFromCOS, extractCOSKey, COS_CONFIG } = require('../config/cos');

/**
 * 从 Markdown 内容中提取所有图片 URL
 * @param {string} content - Markdown 内容
 * @returns {string[]} - 图片 URL 数组
 */
function extractImageUrls(content) {
  if (!content) return [];

  const imageUrls = [];
  // 匹配 Markdown 图片语法: ![alt](url)
  const markdownImageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
  let match;

  while ((match = markdownImageRegex.exec(content)) !== null) {
    imageUrls.push(match[1]);
  }

  return imageUrls;
}

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

/**
 * 删除文章的所有内容图片
 * @param {number} postId - 文章 ID
 * @param {string} content - 文章内容
 * @returns {Promise<void>}
 */
async function deletePostContentImages(postId, content) {
  try {
    // 提取文章内容中的所有图片 URL
    const imageUrls = extractImageUrls(content);

    if (imageUrls.length === 0) {
      console.log('文章无内容图片，跳过删除');
      return;
    }

    console.log(`准备删除文章 ${postId} 的 ${imageUrls.length} 张内容图片`);

    // 删除每张图片
    for (const imageUrl of imageUrls) {
      await deleteOldImage(imageUrl);
    }

    console.log(`文章 ${postId} 的内容图片删除完成`);
  } catch (error) {
    console.error('删除文章内容图片失败:', error);
  }
}

/**
 * 清理文章更新时不再使用的图片
 * @param {string} oldContent - 旧内容
 * @param {string} newContent - 新内容
 * @returns {Promise<void>}
 */
async function cleanupUnusedImages(oldContent, newContent) {
  try {
    const oldImageUrls = extractImageUrls(oldContent);
    const newImageUrls = extractImageUrls(newContent);

    // 找出不再使用的图片
    const unusedImageUrls = oldImageUrls.filter(url => !newImageUrls.includes(url));

    if (unusedImageUrls.length === 0) {
      console.log('没有需要清理的图片');
      return;
    }

    console.log(`准备清理 ${unusedImageUrls.length} 张不再使用的图片`);

    // 删除不再使用的图片
    for (const imageUrl of unusedImageUrls) {
      await deleteOldImage(imageUrl);
    }

    console.log('不再使用的图片清理完成');
  } catch (error) {
    console.error('清理不再使用的图片失败:', error);
  }
}

module.exports = {
  deleteOldImage,
  extractImageUrls,
  deletePostContentImages,
  cleanupUnusedImages
};
