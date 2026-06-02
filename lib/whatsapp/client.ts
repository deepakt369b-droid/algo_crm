import { MessagePayload, MessageResponse, QrCodeResponse } from "./types";

export class WhatsAppClient {
  private static apiUrl = process.env.WHATSAPP_API_URL || "http://localhost:3001";
  private static apiKey = process.env.WHATSAPP_API_KEY || "your_global_secret";

  private static getHeaders() {
    return {
      "Content-Type": "application/json",
      "X-Api-Key": this.apiKey,
    };
  }

  /**
   * Request QR code from the serverless container
   */
  static async getQrCode(instanceId: string): Promise<QrCodeResponse> {
    try {
      console.log(`[WhatsApp Client] Fetching QR for: ${instanceId}`);
      const response = await fetch(`${this.apiUrl}/api/${instanceId}/qr`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch QR code: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        qrCode: data.qrCode || data.qr || "",
      };
    } catch (error: any) {
      console.error(`[WhatsApp Client] Error in getQrCode:`, error);
      return {
        success: false,
        message: error.message || "Failed to fetch QR code.",
      };
    }
  }

  /**
   * Send text message via serverless container instance or Official API
   */
  static async sendMessage(
    instanceId: string, 
    payload: MessagePayload, 
    settings?: { whatsappOfficialApiUrl?: string; whatsappOfficialApiKey?: string; }
  ): Promise<MessageResponse> {
    try {
      console.log(`[WhatsApp Client] Sending message via: ${instanceId} to ${payload.to}`);
      
      let endpoint = `${this.apiUrl}/api/${instanceId}/send`;
      let headers: Record<string, string> = this.getHeaders();
      let body: any = { to: payload.to, message: payload.message };

      if (settings?.whatsappOfficialApiUrl && settings?.whatsappOfficialApiKey) {
        endpoint = settings.whatsappOfficialApiUrl;
        headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${settings.whatsappOfficialApiKey}`
        };
        body = {
          messaging_product: "whatsapp",
          to: payload.to,
          type: "text",
          text: { body: payload.message }
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.messageId || data.messages?.[0]?.id || data.id || "",
      };
    } catch (error: any) {
      console.error(`[WhatsApp Client] Error in sendMessage:`, error);
      return {
        success: false,
        error: error.message || "Failed to send message.",
      };
    }
  }

  /**
   * Disconnect/Logout WhatsApp instance in container
   */
  static async disconnect(instanceId: string): Promise<boolean> {
    try {
      console.log(`[WhatsApp Client] Disconnecting instance: ${instanceId}`);
      const response = await fetch(`${this.apiUrl}/api/${instanceId}/disconnect`, {
        method: "POST",
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error(`[WhatsApp Client] Error in disconnect:`, error);
      return false;
    }
  }

  /**
   * Get the current connection status of the instance
   */
  static async getStatus(instanceId: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/api/${instanceId}/status`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.status || "DISCONNECTED";
      }
      return "DISCONNECTED";
    } catch (error) {
      console.error(`[WhatsApp Client] Error in getStatus:`, error);
      return "DISCONNECTED";
    }
  }
}
