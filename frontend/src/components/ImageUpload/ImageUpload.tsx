import React, { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import './ImageUpload.css';

interface ImageUploadProps {
  type: 'avatar' | 'cover' | 'content';
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  currentImage?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  type,
  onUploadSuccess,
  onUploadError,
  currentImage,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 压缩配置
  const COMPRESSION_OPTIONS = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg'
  };

  // 文件大小限制（字节）
  const MAX_SIZE = {
    avatar: 2 * 1024 * 1024,    // 2MB
    cover: 5 * 1024 * 1024,     // 5MB
    content: 10 * 1024 * 1024   // 10MB
  };

  // 允许的文件类型
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      const error = '不支持的文件类型，仅支持 JPEG、PNG、WebP、GIF 格式';
      onUploadError?.(error);
      alert(error);
      return;
    }

    // 验证文件大小
    if (file.size > MAX_SIZE[type]) {
      const maxSizeMB = MAX_SIZE[type] / (1024 * 1024);
      const error = `文件大小超出限制，最大支持 ${maxSizeMB}MB`;
      onUploadError?.(error);
      alert(error);
      return;
    }

    try {
      setUploading(true);

      // 压缩图片（用户无感知）
      const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);

      // 显示预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // 上传压缩后的文件
      await uploadFile(compressedFile);
    } catch (error) {
      const errorMsg = '图片处理失败，请稍后重试';
      onUploadError?.(errorMsg);
      alert(errorMsg);
      setUploading(false);
    }
  };

  // 上传文件到服务器
  const uploadFile = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // 如果有旧图片，传递给后端用于删除
      if (currentImage) {
        formData.append('oldCover', currentImage);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/upload/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setPreview(data.data.url);
        onUploadSuccess?.(data.data.url);
      } else {
        throw new Error(data.message || '上传失败');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '上传失败，请稍后重试';
      onUploadError?.(errorMsg);
      alert(errorMsg);
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  // 触发文件选择
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 获取上传按钮文本
  const getButtonText = () => {
    if (uploading) return '上传中...';
    if (preview) return '更换图片';
    return '选择图片';
  };

  return (
    <div className={`image-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {preview && (
        <div className="image-preview">
          <img src={preview} alt="预览" loading="lazy" />
        </div>
      )}

      <button
        type="button"
        className="upload-button"
        onClick={handleClick}
        disabled={uploading}
      >
        {getButtonText()}
      </button>

      <div className="upload-tips">
        <p>支持 JPEG、PNG、WebP、GIF 格式</p>
        <p>最大 {MAX_SIZE[type] / (1024 * 1024)}MB</p>
      </div>
    </div>
  );
};

export default ImageUpload;
