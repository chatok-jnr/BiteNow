import React from 'react';
import { AlertCircle, Clock, XCircle, Ban } from 'lucide-react';

/**
 * Component to display approval status messages
 * Shows different messages and styles based on account status
 */
const ApprovalMessage = ({ 
  status, 
  entityType = 'account', 
  message,
  showIcon = true 
}) => {
  // Determine status configuration
  const getStatusConfig = () => {
    const normalizedStatus = status?.toLowerCase();
    
    switch (normalizedStatus) {
      case 'pending':
        return {
          icon: Clock,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500',
          textColor: 'text-yellow-800',
          title: 'Approval Pending - Action Required',
          defaultMessage: `To get approved and access all features, you need to add the required documents that prove you are eligible for this ${entityType}. Once you add your documents, our admin team will review them and approve your account.`
        };
      
      case 'rejected':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          textColor: 'text-red-800',
          title: 'Account Rejected',
          defaultMessage: `Your ${entityType} has been rejected. Please contact support for more information.`
        };
      
      case 'suspended':
        return {
          icon: Ban,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-500',
          textColor: 'text-orange-800',
          title: 'Account Suspended',
          defaultMessage: `Your ${entityType} has been suspended. Please contact support to resolve this issue.`
        };
      
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500',
          textColor: 'text-gray-800',
          title: 'Not Approved',
          defaultMessage: `Your ${entityType} is not approved yet. Please wait for admin approval.`
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-6 max-w-2xl mx-auto`}>
      <div className="flex items-start space-x-4">
        {showIcon && (
          <div className={`${config.iconColor} flex-shrink-0`}>
            <Icon className="w-8 h-8" />
          </div>
        )}
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${config.textColor} mb-2`}>
            {config.title}
          </h3>
          <p className={`${config.textColor} text-base leading-relaxed`}>
            {displayMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApprovalMessage;
