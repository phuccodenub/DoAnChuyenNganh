/**
 * Message Delivery Tracking
 * Handles message delivery status and acknowledgments
 */

export interface MessageDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'read';
  deliveredAt?: Date;
  readAt?: Date;
  deliveredTo?: string; // user who received/read it
}

export interface MessageDeliveryAck {
  messageId: string;
  tempId?: string; // temporary ID from client while pending
  senderId: string;
  courseId: string;
  status: 'pending' | 'delivered' | 'failed';
  timestamp: Date;
  error?: string;
}

export interface DeliveryReceipt {
  messageId: string;
  userId: string;
  receiptType: 'delivered' | 'read';
  timestamp: Date;
}

// In-memory delivery tracking (for active sessions)
export class MessageDeliveryTracker {
  private deliveryMap: Map<string, MessageDeliveryStatus> = new Map();
  private receipts: Map<string, DeliveryReceipt[]> = new Map();

  /**
   * Mark message as delivered
   */
  markDelivered(messageId: string, deliveredTo: string): MessageDeliveryStatus {
    const status = this.deliveryMap.get(messageId) || {
      messageId,
      status: 'sent',
      deliveredAt: new Date()
    };

    status.status = 'delivered';
    status.deliveredAt = new Date();
    status.deliveredTo = deliveredTo;

    this.deliveryMap.set(messageId, status);
    return status;
  }

  /**
   * Mark message as read
   */
  markRead(messageId: string, readBy: string): MessageDeliveryStatus {
    const status = this.deliveryMap.get(messageId) || {
      messageId,
      status: 'sent'
    };

    status.status = 'read';
    status.readAt = new Date();
    status.deliveredTo = readBy;

    this.deliveryMap.set(messageId, status);
    return status;
  }

  /**
   * Get delivery status
   */
  getStatus(messageId: string): MessageDeliveryStatus | undefined {
    return this.deliveryMap.get(messageId);
  }

  /**
   * Add receipt record
   */
  addReceipt(receipt: DeliveryReceipt): void {
    const key = receipt.messageId;
    if (!this.receipts.has(key)) {
      this.receipts.set(key, []);
    }
    this.receipts.get(key)!.push(receipt);
  }

  /**
   * Get all receipts for a message
   */
  getReceipts(messageId: string): DeliveryReceipt[] {
    return this.receipts.get(messageId) || [];
  }

  /**
   * Cleanup old deliveries (older than 1 hour)
   */
  cleanup(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    let cleaned = 0;

    for (const [messageId, status] of this.deliveryMap.entries()) {
      const timestamp = status.deliveredAt || status.readAt;
      if (timestamp && timestamp.getTime() < oneHourAgo) {
        this.deliveryMap.delete(messageId);
        this.receipts.delete(messageId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[DeliveryTracker] Cleaned up ${cleaned} old delivery records`);
    }
  }
}

// Export singleton instance
export const deliveryTracker = new MessageDeliveryTracker();

// Run cleanup every 30 minutes
setInterval(() => {
  deliveryTracker.cleanup();
}, 30 * 60 * 1000);
