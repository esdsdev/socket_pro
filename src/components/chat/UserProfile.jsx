import React, { useState } from 'react';
import { X, User, Mail, Calendar, Shield, Download, Users, Bell, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChatContext } from '../../contexts/ChatContext';

const UserProfile = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { blockedUsers, unblockUser } = useChatContext();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'blocked', label: 'Blocked Users', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Bell }
  ];

  const handleUnblock = async (userId) => {
    try {
      await unblockUser(userId);
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Profile & Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-1 p-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{user?.username}</h3>
                <p className="text-gray-500">{user?.email}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Conversations</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">248</div>
                  <div className="text-sm text-gray-600">Messages</div>
                </div>
              </div>

              {/* Account Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Email</div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Joined</div>
                    <div className="text-sm text-gray-500">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Read Receipts</div>
                    <div className="text-xs text-gray-500">Let others know when you've read their messages</div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Online Status</div>
                    <div className="text-xs text-gray-500">Show when you're online to others</div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Typing Indicators</div>
                    <div className="text-xs text-gray-500">Show typing status to others</div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blocked' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Blocked Users</h3>
              
              {blockedUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No blocked users</p>
                  <p className="text-sm">Users you block will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedUsers.map((userId) => (
                    <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">U</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">User {userId}</div>
                          <div className="text-xs text-gray-500">Blocked</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblock(userId)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">App Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Notifications</div>
                    <div className="text-xs text-gray-500">Receive push notifications</div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Sound</div>
                    <div className="text-xs text-gray-500">Play sound for new messages</div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Auto-download Media</div>
                    <div className="text-xs text-gray-500">Automatically download images and files</div>
                  </div>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;