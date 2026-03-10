const Post = require('../models/Post');
const { deleteOldImage, deletePostContentImages, cleanupUnusedImages } = require('../utils/imageCleanup');

// 创建文章
exports.createPost = async (req, res) => {
  try {
    const { title, content, cover, category_id, tags } = req.body;

    // 调试信息
    console.log('创建文章请求：', {
      title,
      content: content?.substring(0, 50),
      cover,
      category_id,
      tags,
      author_id: req.user?.id
    });

    // 参数验证
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空'
      });
    }

    // 从 token 中获取 author_id
    const author_id = req.user.id;

    // 处理 tags 格式（支持数组、字符串、空值）
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags;
      } else if (typeof tags === 'string') {
        // 如果是字符串，按逗号分割
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    // 创建文章
    const postId = await Post.create({
      title,
      content,
      cover: cover || null,
      category_id: category_id || null,
      tags: processedTags,
      author_id
    });

    // 获取创建的文章信息
    const post = await Post.findById(postId);

    res.status(201).json({
      success: true,
      message: '文章创建成功',
      data: post
    });

  } catch (error) {
    console.error('创建文章错误：', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，创建文章失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取文章列表
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, category_id, keyword } = req.query;

    const result = await Post.findAll({
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      category_id,
      keyword
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('获取文章列表错误：', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，获取文章列表失败'
    });
  }
};

// 获取文章详情
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 增加浏览次数
    await Post.incrementViews(id);
    post.views += 1;

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('获取文章详情错误：', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，获取文章详情失败'
    });
  }
};

// 更新文章
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, cover, category_id, tags } = req.body;

    // 检查文章是否存在
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 检查是否是文章作者
    const isOwner = await Post.isOwner(id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: '无权限修改此文章'
      });
    }

    // 保存旧内容用于清理不再使用的图片
    const oldContent = post.content;

    // 更新文章
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (cover !== undefined) updateData.cover = cover;
    if (category_id !== undefined) updateData.category_id = category_id;

    // 处理 tags 格式
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        updateData.tags = tags;
      } else if (typeof tags === 'string') {
        updateData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else {
        updateData.tags = [];
      }
    }

    await Post.update(id, updateData);

    // 清理不再使用的图片
    if (content !== undefined) {
      await cleanupUnusedImages(oldContent, content);
    }

    // 获取更新后的文章
    const updatedPost = await Post.findById(id);

    res.json({
      success: true,
      message: '文章更新成功',
      data: updatedPost
    });

  } catch (error) {
    console.error('更新文章错误：', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，更新文章失败'
    });
  }
};

// 删除文章
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查文章是否存在
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 检查是否是文章作者
    const isOwner = await Post.isOwner(id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: '无权限删除此文章'
      });
    }

    // 删除封面图片（如果存在且为上传的图片）
    if (post.cover) {
      await deleteOldImage(post.cover);
    }

    // 删除文章内容中的所有图片
    await deletePostContentImages(id, post.content);

    // 删除文章
    await Post.delete(id);

    res.json({
      success: true,
      message: '文章删除成功'
    });

  } catch (error) {
    console.error('删除文章错误：', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，删除文章失败'
    });
  }
};

// 获取当前用户的文章列表
exports.getMyPosts = async (req, res) => {
  try {
    const { page = 1, pageSize = 100 } = req.query;
    const authorId = req.user.id;

    const result = await Post.findByAuthor(authorId, {
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('获取我的文章列表错误：', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，获取文章列表失败'
    });
  }
};

// 获取当前用户的统计信息
exports.getMyStats = async (req, res) => {
  try {
    const authorId = req.user.id;

    const stats = await Post.getUserStats(authorId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取用户统计信息错误：', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，获取统计信息失败'
    });
  }
};
