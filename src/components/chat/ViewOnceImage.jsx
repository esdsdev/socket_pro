import React, { useState } from 'react';
import { Eye, EyeOff, Download } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';

const ViewOnceImage = ({ message, isViewOnce = false, autoDownload = true, maxSize = 10 }) => {
  const [isViewed, setIsViewed] = useState(false);
  const [showImage, setShowImage] = useState(!isViewOnce);
  const [shouldLoadImage, setShouldLoadImage] = useState(false);
  const { markImageAsViewed } = useChatContext();

  const image = message.images?.[0];
  const fileSizeInMB = image?.file_size ? image.file_size / (1024 * 1024) : 0;
  const shouldAutoLoad = autoDownload && (maxSize >= 100 || fileSizeInMB <= maxSize);

  React.useEffect(() => {
    setShouldLoadImage(shouldAutoLoad && !isViewOnce);
  }, [shouldAutoLoad, isViewOnce]);

  const handleViewImage = async () => {
    if (isViewOnce && !isViewed) {
      try {
        await markImageAsViewed(image.id);
        setIsViewed(true);
        setShowImage(true);
        
        // Hide image after 10 seconds for view once
        setTimeout(() => {
          setShowImage(false);
        }, 10000);
      } catch (error) {
        console.error('Error marking image as viewed:', error);
      }
    } else {
      setShouldLoadImage(true);
      if (!isViewOnce) {
        setShowImage(true);
      }
    }
  };

  // Auto-download placeholder
  if (!shouldLoadImage && !isViewOnce) {
    return (
      <div className="flex items-center justify-center w-48 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <button
          onClick={handleViewImage}
          className="flex flex-col items-center space-y-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Download className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Image ({fileSizeInMB.toFixed(1)} MB)</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tap to download</p>
          </div>
        </button>
      </div>
    );
  }

  if (isViewOnce && isViewed && !showImage) {
    return (
      <div className="flex items-center justify-center w-48 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center">
          <EyeOff className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">View Once</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Photo expired</p>
        </div>
      </div>
    );
  }

  if (isViewOnce && !isViewed) {
    return (
      <div className="relative">
        <div className="w-48 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
          <button
            onClick={handleViewImage}
            className="flex flex-col items-center space-y-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Eye className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">View Once</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tap to view photo</p>
            </div>
          </button>
        </div>
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          1
        </div>
      </div>
    );
  }

  // Regular image or view once being shown
  const imageUrl = image?.file_path;
  
  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt="Shared image"
        className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => {
          // Open in modal/fullscreen
          console.log('Open image in modal');
        }}
      />
      {isViewOnce && showImage && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          View Once
        </div>
      )}
    </div>
  );
};

export default ViewOnceImage;