import React, { useEffect } from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';
import { formatRelativeTime, formatCallDuration } from '../../utils/dateUtils';

const CallHistory = ({ onClose }) => {
  const { callHistory, loadCallHistory } = useCall();

  useEffect(() => {
    loadCallHistory();
  }, []);

  const getCallIcon = (call, isOutgoing) => {
    const iconClass = "w-4 h-4";
    
    if (call.call_status === 'missed') {
      return <PhoneMissed className={`${iconClass} text-red-500`} />;
    }
    
    if (isOutgoing) {
      return <PhoneOutgoing className={`${iconClass} text-green-500`} />;
    }
    
    return <PhoneIncoming className={`${iconClass} text-blue-500`} />;
  };

  const getCallTypeIcon = (callType) => {
    return callType === 'video' ? 
      <Video className="w-4 h-4 text-gray-400" /> : 
      <Phone className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Call History</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Call history list */}
        <div className="overflow-y-auto max-h-96">
          {callHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Phone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No call history</p>
              <p className="text-sm">Your calls will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {callHistory.map((call) => {
                const isOutgoing = call.caller_id === call.user_id; // This would need proper user context
                const otherUser = isOutgoing ? call.receiver : call.caller;
                
                return (
                  <div key={call.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {otherUser.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">
                            {otherUser.username}
                          </h4>
                          {getCallIcon(call, isOutgoing)}
                          {getCallTypeIcon(call.call_type)}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{formatRelativeTime(call.started_at)}</span>
                          {call.duration > 0 && (
                            <>
                              <span>•</span>
                              <span>{formatCallDuration(call.duration)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400 capitalize">
                        {call.call_status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallHistory;