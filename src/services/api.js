// Real API service
const BASE_URL = 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
};
// Authentication API
export const authAPI = {
  async login({ email, password }) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  async register({ username, email, password }) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return handleResponse(response);
  },

  async validateToken(token) {
    const response = await fetch(`${BASE_URL}/auth/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await handleResponse(response);
    return data.user;
  },

  async logout(token) {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ refreshToken })
    });
    return handleResponse(response);
  },

  async refreshToken(refreshToken) {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    return handleResponse(response);
  }
};

// Chat API
export const chatAPI = {
  async getConversations() {
    const response = await fetch(`${BASE_URL}/chat/conversations`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async getMessages(userId) {
    const response = await fetch(`${BASE_URL}/chat/messages/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async sendMessage(messageData) {
    const response = await fetch(`${BASE_URL}/chat/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(messageData)
    });
    return handleResponse(response);
  },

  async deleteMessage(messageId, forEveryone) {
    const response = await fetch(`${BASE_URL}/chat/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ forEveryone })
    });
    return handleResponse(response);
  },

  async editMessage(messageId, content) {
    const response = await fetch(`${BASE_URL}/chat/messages/${messageId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return handleResponse(response);
  },

  async markImageAsViewed(imageId) {
    const response = await fetch(`${BASE_URL}/chat/images/${imageId}/viewed`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async exportChat(userId, format) {
    const response = await fetch(`${BASE_URL}/chat/export/${userId}?format=${format}`, {
      headers: getAuthHeaders()
    });
    
    if (format === 'json') {
      return handleResponse(response);
    } else {
      return response.text();
    }
  },

  async searchMessages(query, conversationId) {
    const params = new URLSearchParams({ q: query });
    if (userId) params.append('userId', userId);
    
    const response = await fetch(`${BASE_URL}/chat/search?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async blockUser(userId) {
    const response = await fetch(`${BASE_URL}/chat/block/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async unblockUser(userId) {
    const response = await fetch(`${BASE_URL}/chat/block/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async getBlockedUsers() {
    const response = await fetch(`${BASE_URL}/chat/blocked`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async markMessageAsRead(messageId) {
    const response = await fetch(`${BASE_URL}/chat/messages/${messageId}/read`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Call API
export const callAPI = {
  async initiateCall(receiverId, callType) {
    const response = await fetch(`${BASE_URL}/calls/initiate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        receiver_id: receiverId,
        call_type: callType
      })
    });
    return handleResponse(response);
  },

  async answerCall(callId) {
    const response = await fetch(`${BASE_URL}/calls/${callId}/answer`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async declineCall(callId) {
    const response = await fetch(`${BASE_URL}/calls/${callId}/decline`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async endCall(callId, duration) {
    const response = await fetch(`${BASE_URL}/calls/${callId}/end`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ duration })
    });
    return handleResponse(response);
  },

  async getCallHistory() {
    const response = await fetch(`${BASE_URL}/calls/history`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Settings API
export const settingsAPI = {
  async getUserSettings() {
    const response = await fetch(`${BASE_URL}/settings`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async updateUserSettings(settings) {
    const response = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    return handleResponse(response);
  },

  async updateSetting(setting, value) {
    const response = await fetch(`${BASE_URL}/settings`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ setting, value })
    });
    return handleResponse(response);
  }
};

// Media API
export const mediaAPI = {
  async uploadImage(file, isViewOnce = false) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${BASE_URL}/media/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    const data = await handleResponse(response);
    return data.images[0]; // Return first image
  },

  async uploadVoiceMessage(audioBlob) {
    const formData = new FormData();
    formData.append('voice', audioBlob, 'voice.webm');
    
    const response = await fetch(`${BASE_URL}/media/upload/voice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    const data = await handleResponse(response);
    return data.voice;
  },

  async deleteMedia(publicId, resourceType = 'image') {
    const response = await fetch(`${BASE_URL}/media/delete/${encodeURIComponent(publicId)}?resourceType=${resourceType}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};