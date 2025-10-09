import { useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { axiosInstance } from '../../api/axios';

interface AvatarUploadProps {
  profileId: string;
  currentAvatar?: string;
  name?: string;
  onUploadSuccess: (updatedProfile: any) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({
  profileId,
  currentAvatar,
  name,
  onUploadSuccess,
  className,
  size = 'md',
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axiosInstance.post(
        `/profile/${profileId}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Ensure we're using the full URL from the response
      if (response.data?.profile?.avatar && !response.data.profile.avatar.startsWith('http')) {
        response.data.profile.avatar = `http://localhost:3000${response.data.profile.avatar}`;
      }
      
      onUploadSuccess(response.data.profile);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    // You might want to add an API call to remove the avatar here
  };

  const displayUrl = previewUrl || currentAvatar;

  return (
    <div className={cn('relative group', className)}>
      <div
        className={cn(
          'relative rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700',
          'transition-all duration-200 hover:border-blue-500 hover:shadow-lg',
          sizeClasses[size]
        )}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : name ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold select-none"
               style={{ fontSize: size === 'sm' ? '1.25rem' : size === 'md' ? '2rem' : '2.5rem' }}>
            {name
              .split(' ')
              .slice(0, 2)
              .map(word => word[0])
              .join('')
              .toUpperCase()}
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <div className="text-white text-center">
              <Camera className="h-6 w-6 mx-auto mb-1" />
              <span className="text-xs">Change Photo</span>
            </div>
          )}
        </div>

        {displayUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            disabled={isUploading}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <input
        type="file"
        id={`avatar-upload-${profileId}`}
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}
