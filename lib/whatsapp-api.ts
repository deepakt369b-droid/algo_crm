/**
 * This service abstracts the underlying WhatsApp API provider.
 * Initially, this will target the open-source MultiWA or OpenWA Easy API.
 * 
 * NOTE: For MVP, this provides mock functions for the frontend to build against.
 * Once the Docker container for MultiWA is running, these endpoints will be replaced with real fetch calls.
 */

export class WhatsAppApiService {
  /**
   * Request a new WhatsApp instance pairing QR code
   */
  static async getQrCode(instanceId: string): Promise<string> {
    console.log(`[WhatsApp API] Generating QR for instance: ${instanceId}`);
    try {
      const response = await fetch(`/api/whatsapp/qr?instanceId=${instanceId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch QR code from proxy route.");
      }
      const data = await response.json();
      return data.qrCode || "";
    } catch (error) {
      console.error("[WhatsApp API] Error in getQrCode:", error);
      // Fallback dummy QR
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    }
  }

  /**
   * Disconnect an instance
   */
  static async disconnect(instanceId: string): Promise<boolean> {
    console.log(`[WhatsApp API] Disconnecting instance: ${instanceId}`);
    try {
      const response = await fetch(`/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceId, action: "disconnect" }),
      });
      return response.ok;
    } catch (error) {
      console.error("[WhatsApp API] Error in disconnect:", error);
      return false;
    }
  }

  /**
   * Send a WhatsApp text message
   */
  static async sendMessage(instanceId: string, toPhone: string, message: string): Promise<boolean> {
    console.log(`[WhatsApp API] Sending message via ${instanceId} to ${toPhone}: ${message}`);
    try {
      const response = await fetch(`/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceId, to: toPhone, message }),
      });
      return response.ok;
    } catch (error) {
      console.error("[WhatsApp API] Error in sendMessage:", error);
      return false;
    }
  }
}
