import { supabase } from '../lib/supabase';

// =====================================================
// NOTIFICATION TYPES
// =====================================================
export const NOTIFICATION_TYPES = {
  // Appointments/Viewings
  APPOINTMENT_APPROVED: 'appointment_approved',
  APPOINTMENT_REJECTED: 'appointment_rejected',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  VIEWING_BOOKED: 'viewing_booked',
  VIEWING_CONFIRMED: 'viewing_confirmed',
  VIEWING_CANCELLED: 'viewing_cancelled',
  VIEWING_RESCHEDULED: 'viewing_rescheduled',

  // Applications
  APPLICATION_UPDATE: 'application_update',
  APPLICATION_SUBMITTED: 'application_submitted',
  APPLICATION_APPROVED: 'application_approved',
  APPLICATION_REJECTED: 'application_rejected',
  DOCUMENTS_REQUESTED: 'documents_requested',

  // Verification
  DOCUMENT_VERIFIED: 'document_verified',
  PROFILE_VERIFIED: 'profile_verified',

  // Messages
  MESSAGE_RECEIVED: 'message_received',
  TICKET_RESPONSE: 'ticket_response',

  // Properties
  PROPERTY_SAVED: 'property_saved',
  PRICE_DROP: 'price_drop',
  NEW_PROPERTY_MATCH: 'new_property_match',
  PROPERTY_AVAILABLE: 'property_available',
  PROPERTY_UNAVAILABLE: 'property_unavailable',

  // Payments
  PAYMENT_REMINDER: 'payment_reminder',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',

  // Contracts
  CONTRACT_UPDATE: 'contract_update',
  CONTRACT_EXPIRING: 'contract_expiring',

  // System
  SYSTEM: 'system',
  WELCOME: 'welcome',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// =====================================================
// NOTIFICATION DATA INTERFACES
// =====================================================
export interface NotificationData {
  propertyId?: string;
  propertyTitle?: string;
  propertyAddress?: string;
  propertyImage?: string;
  applicationId?: string;
  viewingId?: string;
  messageId?: string;
  amount?: number;
  date?: string;
  time?: string;
  [key: string]: any;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
}

// =====================================================
// CORE NOTIFICATION FUNCTIONS
// =====================================================

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  data = {},
}: CreateNotificationParams): Promise<boolean> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yydtsteyknbpfpxjtlxe.supabase.co';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZDG6XjdzhFDxcFae0hDSraFhazdNsU';

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token || supabaseKey;

    const response = await fetch(`${supabaseUrl}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        type,
        title,
        message,
        data,
        read: false,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

// =====================================================
// VIEWING/APPOINTMENT NOTIFICATIONS
// =====================================================

export async function notifyViewingBooked(
  userId: string,
  propertyTitle: string,
  propertyId: string,
  date: string,
  time: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.VIEWING_BOOKED,
    title: 'Viewing Request Submitted',
    message: `Your viewing request for "${propertyTitle}" on ${date} at ${time} has been submitted. We'll notify you once it's confirmed.`,
    data: { propertyId, propertyTitle, date, time },
  });
}

export async function notifyViewingConfirmed(
  userId: string,
  propertyTitle: string,
  propertyId: string,
  date: string,
  time: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.VIEWING_CONFIRMED,
    title: 'Viewing Confirmed! ✓',
    message: `Great news! Your viewing for "${propertyTitle}" on ${date} at ${time} has been confirmed.`,
    data: { propertyId, propertyTitle, date, time },
  });
}

export async function notifyViewingCancelled(
  userId: string,
  propertyTitle: string,
  propertyId: string,
  date: string,
  reason?: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.VIEWING_CANCELLED,
    title: 'Viewing Cancelled',
    message: `Your viewing for "${propertyTitle}" on ${date} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
    data: { propertyId, propertyTitle, date, reason },
  });
}

export async function notifyViewingReminder(
  userId: string,
  propertyTitle: string,
  propertyId: string,
  date: string,
  time: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER,
    title: 'Viewing Tomorrow!',
    message: `Reminder: You have a viewing scheduled for "${propertyTitle}" tomorrow at ${time}.`,
    data: { propertyId, propertyTitle, date, time },
  });
}

// =====================================================
// APPLICATION NOTIFICATIONS
// =====================================================

export async function notifyApplicationSubmitted(
  userId: string,
  propertyTitle: string,
  propertyId: string,
  applicationId: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
    title: 'Application Submitted',
    message: `Your application for "${propertyTitle}" has been successfully submitted. We'll keep you updated on its progress.`,
    data: { propertyId, propertyTitle, applicationId },
  });
}

export async function notifyApplicationApproved(
  userId: string,
  propertyTitle: string,
  propertyId: string,
  applicationId: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.APPLICATION_APPROVED,
    title: 'Application Approved! 🎉',
    message: `Congratulations! Your application for "${propertyTitle}" has been approved!`,
    data: { propertyId, propertyTitle, applicationId },
  });
}

export async function notifyApplicationRejected(
  userId: string,
  propertyTitle: string,
  propertyId: string,
  applicationId: string,
  reason?: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.APPLICATION_REJECTED,
    title: 'Application Update',
    message: `Unfortunately, your application for "${propertyTitle}" was not successful.${reason ? ` Feedback: ${reason}` : ''}`,
    data: { propertyId, propertyTitle, applicationId, reason },
  });
}

export async function notifyDocumentsRequested(
  userId: string,
  propertyTitle: string,
  propertyId: string,
  applicationId: string,
  documents: string[]
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.DOCUMENTS_REQUESTED,
    title: 'Documents Required',
    message: `Additional documents are required for your application to "${propertyTitle}". Please upload: ${documents.join(', ')}.`,
    data: { propertyId, propertyTitle, applicationId, documents },
  });
}

// =====================================================
// PROPERTY NOTIFICATIONS
// =====================================================

export async function notifyPropertySaved(
  userId: string,
  propertyTitle: string,
  propertyId: string,
  propertyImage?: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.PROPERTY_SAVED,
    title: 'Property Saved',
    message: `"${propertyTitle}" has been added to your saved properties. You'll be notified of any price changes.`,
    data: { propertyId, propertyTitle, propertyImage },
  });
}

export async function notifyPriceDrop(
  userId: string,
  propertyTitle: string,
  propertyId: string,
  oldPrice: number,
  newPrice: number
): Promise<boolean> {
  const savings = oldPrice - newPrice;
  const percentage = Math.round((savings / oldPrice) * 100);
  
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.PRICE_DROP,
    title: 'Price Drop Alert! 📉',
    message: `Good news! "${propertyTitle}" has dropped from £${oldPrice.toLocaleString()} to £${newPrice.toLocaleString()} (${percentage}% off)!`,
    data: { propertyId, propertyTitle, oldPrice, newPrice, savings, percentage },
  });
}

export async function notifyNewPropertyMatch(
  userId: string,
  propertyTitle: string,
  propertyId: string,
  propertyAddress: string,
  price: number
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.NEW_PROPERTY_MATCH,
    title: 'New Property Match!',
    message: `A new property matching your criteria is available: "${propertyTitle}" in ${propertyAddress} for £${price.toLocaleString()}.`,
    data: { propertyId, propertyTitle, propertyAddress, price },
  });
}

// =====================================================
// MESSAGE NOTIFICATIONS
// =====================================================

export async function notifyMessageReceived(
  userId: string,
  senderName: string,
  messagePreview: string,
  messageId?: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.MESSAGE_RECEIVED,
    title: `New message from ${senderName}`,
    message: messagePreview.length > 100 ? `${messagePreview.substring(0, 100)}...` : messagePreview,
    data: { senderName, messageId },
  });
}

export async function notifyTicketResponse(
  userId: string,
  ticketSubject: string,
  ticketId: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.TICKET_RESPONSE,
    title: 'Support Ticket Update',
    message: `You have a new response on your support ticket: "${ticketSubject}".`,
    data: { ticketId, ticketSubject },
  });
}

// =====================================================
// VERIFICATION NOTIFICATIONS
// =====================================================

export async function notifyDocumentVerified(
  userId: string,
  documentType: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.DOCUMENT_VERIFIED,
    title: 'Document Verified ✓',
    message: `Your ${documentType} has been successfully verified.`,
    data: { documentType },
  });
}

export async function notifyProfileVerified(userId: string): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.PROFILE_VERIFIED,
    title: 'Profile Verified! 🎉',
    message: 'Congratulations! Your profile is now fully verified. You can now access all features.',
    data: {},
  });
}

// =====================================================
// PAYMENT NOTIFICATIONS
// =====================================================

export async function notifyPaymentReminder(
  userId: string,
  amount: number,
  dueDate: string,
  propertyTitle: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.PAYMENT_REMINDER,
    title: 'Payment Reminder',
    message: `Your payment of £${amount.toLocaleString()} for "${propertyTitle}" is due on ${dueDate}.`,
    data: { amount, dueDate, propertyTitle },
  });
}

export async function notifyPaymentReceived(
  userId: string,
  amount: number,
  propertyTitle: string
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.PAYMENT_RECEIVED,
    title: 'Payment Received ✓',
    message: `Your payment of £${amount.toLocaleString()} for "${propertyTitle}" has been received. Thank you!`,
    data: { amount, propertyTitle },
  });
}

// =====================================================
// SYSTEM NOTIFICATIONS
// =====================================================

export async function notifyWelcome(userId: string, userName: string): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.WELCOME,
    title: 'Welcome to EstoSpaces! 🏠',
    message: `Hi ${userName}! Welcome to EstoSpaces. Start exploring properties and find your perfect home.`,
    data: {},
  });
}

export async function notifySystem(
  userId: string,
  title: string,
  message: string,
  data?: NotificationData
): Promise<boolean> {
  return createNotification({
    userId,
    type: NOTIFICATION_TYPES.SYSTEM,
    title,
    message,
    data: data || {},
  });
}

// =====================================================
// NOTIFICATION PREFERENCES
// =====================================================

export interface NotificationPreferences {
  email_enabled: boolean;
  email_viewing_updates: boolean;
  email_application_updates: boolean;
  email_message_notifications: boolean;
  email_price_alerts: boolean;
  email_property_recommendations: boolean;
  email_marketing: boolean;
  push_enabled: boolean;
  push_viewing_updates: boolean;
  push_application_updates: boolean;
  push_message_notifications: boolean;
  push_price_alerts: boolean;
  sms_enabled: boolean;
  sms_viewing_reminders: boolean;
  sms_urgent_updates: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yydtsteyknbpfpxjtlxe.supabase.co';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZDG6XjdzhFDxcFae0hDSraFhazdNsU';

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token || supabaseKey;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/notification_preferences?user_id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (response.ok) {
      const [preferences] = await response.json();
      return preferences || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return null;
  }
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yydtsteyknbpfpxjtlxe.supabase.co';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZDG6XjdzhFDxcFae0hDSraFhazdNsU';

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token || supabaseKey;

    // First try to upsert (insert or update)
    const response = await fetch(
      `${supabaseUrl}/rest/v1/notification_preferences`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          user_id: userId,
          ...preferences,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}

export default {
  NOTIFICATION_TYPES,
  createNotification,
  notifyViewingBooked,
  notifyViewingConfirmed,
  notifyViewingCancelled,
  notifyViewingReminder,
  notifyApplicationSubmitted,
  notifyApplicationApproved,
  notifyApplicationRejected,
  notifyDocumentsRequested,
  notifyPropertySaved,
  notifyPriceDrop,
  notifyNewPropertyMatch,
  notifyMessageReceived,
  notifyTicketResponse,
  notifyDocumentVerified,
  notifyProfileVerified,
  notifyPaymentReminder,
  notifyPaymentReceived,
  notifyWelcome,
  notifySystem,
  getNotificationPreferences,
  updateNotificationPreferences,
};
