import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { createCroppedImage } from '../../utils/cropImage';
import './AvatarCropModal.css';

interface AvatarCropModalProps {
  imageSrc: string;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function AvatarCropModal({ imageSrc, onConfirm, onCancel }: AvatarCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedBlob = await createCroppedImage(imageSrc, croppedAreaPixels);
      onConfirm(croppedBlob);
    } catch (error) {
      console.error('裁剪失败:', error);
      alert('裁剪失败，请重试');
    }
  };

  return (
    <div className="avatar-crop-modal">
      <div className="crop-container">
        <div className="crop-header">
          <h2>裁剪头像</h2>
        </div>

        <div className="crop-area">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="crop-controls">
          <label>缩放</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="zoom-slider"
          />
        </div>

        <div className="crop-actions">
          <button onClick={onCancel} className="crop-button cancel">
            取消
          </button>
          <button onClick={handleConfirm} className="crop-button confirm">
            确认裁剪
          </button>
        </div>
      </div>
    </div>
  );
}
