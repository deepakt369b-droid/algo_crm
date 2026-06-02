export interface WhatsAppInstance {
  id: string;
  tenantId: string;
  instanceName: string;
  status: "CONNECTED" | "PENDING" | "DISCONNECTED";
  phoneNumber?: string;
  createdAt: number;
}

export interface QrCodeResponse {
  success: boolean;
  qrCode?: string; // base64 representation of QR code
  message?: string;
}

export interface MessagePayload {
  to: string;
  message: string;
}

export interface MessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
