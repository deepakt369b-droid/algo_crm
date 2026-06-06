import { MessagePayload, MessageResponse, QrCodeResponse } from "./types";

export class WhatsAppClient {
  private static getApiUrl() {
    const apiUrl = process.env.WHATSAPP_API_URL?.replace(/\/+$/, "");
    if (!apiUrl || apiUrl.includes("your-")) {
      throw new Error("WHATSAPP_API_URL is not configured. Point it to your self-hosted openWA/OpenWA API base URL.");
    }
    return apiUrl;
  }

  private static getApiKey() {
    const apiKey = process.env.WHATSAPP_API_KEY;
    if (!apiKey || apiKey.includes("your-")) {
      throw new Error("WHATSAPP_API_KEY is not configured. Set it to the API key used by your WhatsApp API server.");
    }
    return apiKey;
  }

  private static getHeaders() {
    return {
      "Content-Type": "application/json",
      "X-API-Key": this.getApiKey(),
      "X-Api-Key": this.getApiKey(),
    };
  }

  private static normalizeChatId(phoneOrChatId: string) {
    const trimmed = phoneOrChatId.trim();
    if (trimmed.includes("@")) return trimmed;
    const digits = trimmed.replace(/[^\d]/g, "");
    return `${digits}@c.us`;
  }

  private static async readResponse(response: Response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    if (contentType.startsWith("image/")) {
      const bytes = Buffer.from(await response.arrayBuffer()).toString("base64");
      return `data:${contentType};base64,${bytes}`;
    }

    return response.text();
  }

  private static findQrCode(data: any) {
    const qr =
      data?.qrCode ||
      data?.qrcode ||
      data?.qr ||
      data?.base64 ||
      data?.image ||
      data?.data?.qrCode ||
      data?.data?.qrcode ||
      data?.data?.qr ||
      data?.data?.image ||
      (typeof data === "string" ? data : "");

    if (!qr || typeof qr !== "string") return "";
    if (qr.startsWith("data:image/")) return qr;
    if (qr.startsWith("iVBOR") || qr.startsWith("/9j/")) return `data:image/png;base64,${qr}`;
    return qr;
  }

  private static async getFirstOk(endpoints: string[]) {
    let lastError = "";

    for (const endpoint of endpoints) {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: this.getHeaders(),
      });
      const data = await this.readResponse(response);

      if (response.ok) return { data, endpoint };
      lastError = typeof data === "string" ? data : data?.error || data?.message || response.statusText;
    }

    throw new Error(lastError || "No WhatsApp QR endpoint returned a successful response.");
  }

  private static async postFirstOk(endpoints: Array<{ endpoint: string; body: any }>) {
    let lastError = "";

    for (const { endpoint, body } of endpoints) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      const data = await this.readResponse(response);

      if (response.ok) return { data, endpoint };
      lastError = typeof data === "string" ? data : data?.error || data?.message || response.statusText;
    }

    throw new Error(lastError || "No WhatsApp send endpoint returned a successful response.");
  }

  /**
   * Request QR code from the serverless container
   */
  static async getQrCode(instanceId: string): Promise<QrCodeResponse> {
    try {
      console.log(`[WhatsApp Client] Fetching QR for: ${instanceId}`);
      const apiUrl = this.getApiUrl();
      const { data } = await this.getFirstOk([
        `${apiUrl}/api/${instanceId}/qr`,
        `${apiUrl}/api/session/qr/${instanceId}`,
        `${apiUrl}/api/sessions/${instanceId}/qr`,
        `${apiUrl}/api/sessions/${instanceId}/qr/image`,
        `${apiUrl}/api/qr?sessionId=${encodeURIComponent(instanceId)}`,
      ]);
      const qrCode = this.findQrCode(data);

      if (!qrCode) {
        throw new Error("WhatsApp API responded successfully but did not include a QR code.");
      }

      return {
        success: true,
        qrCode,
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
      
      const apiUrl = this.getApiUrl();
      const chatId = this.normalizeChatId(payload.to);
      let endpoint = `${apiUrl}/api/${instanceId}/send`;
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

      let data: any;

      if (settings?.whatsappOfficialApiUrl && settings?.whatsappOfficialApiKey) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        data = await this.readResponse(response);

        if (!response.ok) {
          const message = typeof data === "string" ? data : data?.error?.message || data?.error || response.statusText;
          throw new Error(`Failed to send message: ${message}`);
        }
      } else {
        const result = await this.postFirstOk([
          {
            endpoint: `${apiUrl}/api/sendText`,
            body: { to: chatId, text: payload.message },
          },
          {
            endpoint: `${apiUrl}/api/messages/sendText`,
            body: { to: chatId, text: payload.message },
          },
          {
            endpoint: `${apiUrl}/api/sessions/${instanceId}/messages/send-text`,
            body: { chatId, text: payload.message },
          },
          {
            endpoint,
            body,
          },
        ]);
        data = result.data;
      }

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
      const response = await fetch(`${this.getApiUrl()}/api/${instanceId}/disconnect`, {
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
      const response = await fetch(`${this.getApiUrl()}/api/${instanceId}/status`, {
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
