import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';

const ViewOnceImage = ({ message, isViewOnce = false }) => {
  const [isViewed, setIsViewed] = useState(false);
  const [showImage, setShowImage] = useState(!isViewOnce);
  const { markImageAsViewed } = useChatContext();

  const handleViewImage = async () => {
    if (isViewOnce && !isViewed) {
      try {
        await markImageAsViewed(message.images[0].id);
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
      setShowImage(true);
    }
  };

  if (isViewOnce && isViewed && !showImage) {
    return (
      <div className="flex items-center justify-center w-48 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">View Once</p>
          <p className="text-xs text-gray-400">Photo expired</p>
        </div>
      </div>
    );
  }

  if (isViewOnce && !isViewed) {
    return (
      <div className="relative">
        <div className="w-48 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
          <button
            onClick={handleViewImage}
            className="flex flex-col items-center space-y-2 p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Eye className="w-8 h-8 text-gray-400" />
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">View Once</p>
              <p className="text-xs text-gray-500">Tap to view photo</p>
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
  const imageUrl = message.images?.[0]?.file_path;
  
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