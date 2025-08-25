import React from 'react';

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '💪', '🙏'],
    'Objects': ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🥘', '🍝', '🍜']
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-h-64 overflow-y-auto z-20">
      <div className="space-y-4">
        {Object.entries(emojiCategories).map(([category, emojis]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
            <div className="grid grid-cols-8 gap-2">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => onEmojiSelect(emoji)}
                  className="text-xl hover:bg-gray-100 rounded p-1 transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;