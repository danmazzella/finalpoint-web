import React from 'react';
import { getAvatarUrl } from '@/lib/api';

interface AvatarProps {
    src?: string | null;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    fallback?: string;
}

export default function Avatar({
    src,
    alt = 'User avatar',
    size = 'md',
    className = '',
    fallback = '👤'
}: AvatarProps) {
    const [imageError, setImageError] = React.useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    };

    const baseClasses = 'rounded-full object-cover bg-gray-200 flex items-center justify-center text-gray-600 font-medium';
    const sizeClass = sizeClasses[size];
    const avatarUrl = getAvatarUrl(src);

    console.log('🔧 Avatar component - src:', src, 'avatarUrl:', avatarUrl, 'imageError:', imageError);

    // If no URL or image failed to load, show fallback
    if (!avatarUrl || imageError) {
        console.log('🔧 Avatar showing fallback for src:', src);
        return (
            <div className={`${baseClasses} ${sizeClass} ${className}`}>
                <span className="text-lg">{fallback}</span>
            </div>
        );
    }

    console.log('🔧 Avatar rendering image with URL:', avatarUrl);
    return (
        <img
            src={avatarUrl}
            alt={alt}
            className={`${baseClasses} ${sizeClass} ${className}`}
            onError={() => {
                console.log('🔧 Avatar image failed to load:', avatarUrl);
                setImageError(true);
            }}
        />
    );
}
