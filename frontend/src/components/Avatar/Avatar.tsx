import './Avatar.css';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Avatar({ src, name, size = 'medium', className = '' }: AvatarProps) {
  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {src ? (
        <img src={src} alt={name} className="avatar-image" />
      ) : (
        <span className="avatar-fallback">{name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
