"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, QrCode, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateInstanceConfig, deleteInstance } from "@/actions/whatsapp";

interface WhatsAppInstanceCardProps {
  instance: {
    id: string;
    instanceName: string;
    status: string;
    phoneNumber?: string;
    connectionConfig?: any;
    credentials?: any;
  };
}

export function WhatsAppInstanceCard({ instance }: WhatsAppInstanceCardProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configUrl, setConfigUrl] = useState(instance.connectionConfig?.whatsappOfficialApiUrl || "");
  const [configKey, setConfigKey] = useState(instance.connectionConfig?.whatsappOfficialApiKey || "");

  const handleSaveConfig = async () => {
    try {
      await updateInstanceConfig({
        id: instance.id,
        connectionConfig: {
          whatsappOfficialApiUrl: configUrl,
          whatsappOfficialApiKey: configKey,
        }
      });
      setIsConfiguring(false);
    } catch (e: any) {
      setError(e.message || "Failed to save configuration");
    }
  };

  const fetchQrCode = async () => {
    setLoadingQr(true);
    setError(null);
    try {
      const response = await fetch(`/api/whatsapp/qr?instanceId=${instance.id}`);
      const data = await response.json();
      if (data.success && data.qrCode) {
        setQrCode(data.qrCode);
      } else {
        setError(data.error || "Failed to load QR code");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch QR code");
    } finally {
      setLoadingQr(false);
    }
  };

  useEffect(() => {
    if (instance.status !== "CONNECTED") {
      fetchQrCode();
    }
  }, [instance.status, instance.id]);

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden group">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium text-zinc-100">{instance.instanceName}</CardTitle>
          <Badge variant="outline" className={
            instance.status === "CONNECTED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
            instance.status === "PENDING" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : 
            "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
          }>
            {instance.status}
          </Badge>
        </div>
        <CardDescription className="text-zinc-500 text-sm">
          {instance.phoneNumber ? `Phone: ${instance.phoneNumber}` : "No phone linked yet"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        {instance.status !== "CONNECTED" && (
          <div className="bg-zinc-950 p-4 rounded-md mb-4 flex flex-col items-center justify-center border border-zinc-800">
            <h4 className="text-sm text-zinc-400 mb-2 font-medium">Scan to Connect</h4>
            {loadingQr ? (
              <div className="h-40 w-40 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-zinc-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="h-40 w-40 flex flex-col items-center justify-center text-red-400 text-xs text-center p-2">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={fetchQrCode} className="mt-2 text-xs">Retry</Button>
              </div>
            ) : qrCode ? (
              <div className="bg-white p-2 rounded-md">
                {/* Normally we'd use a QRCode library here. The API might return a base64 string or the raw string. */}
                <img src={qrCode} alt="WhatsApp QR Code" className="h-40 w-40 object-contain" />
              </div>
            ) : (
              <div className="h-40 w-40 flex flex-col items-center justify-center text-zinc-500">
                <QrCode className="h-10 w-10 mb-2 opacity-50" />
                <Button variant="outline" size="sm" onClick={fetchQrCode}>Show QR Code</Button>
              </div>
            )}
          </div>
        )}

        {isConfiguring && (
          <div className="bg-zinc-950 p-4 rounded-md mb-4 flex flex-col space-y-4 border border-zinc-800">
            <h4 className="text-sm font-medium text-zinc-300 border-b border-zinc-800 pb-2">API Configuration</h4>
            
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Official API URL</Label>
              <Input 
                value={configUrl} 
                onChange={(e) => setConfigUrl(e.target.value)} 
                placeholder="https://graph.facebook.com/v17.0/..." 
                className="bg-zinc-900 border-zinc-800 text-sm h-8"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Official API Key (Bearer Token)</Label>
              <Input 
                type="password"
                value={configKey} 
                onChange={(e) => setConfigKey(e.target.value)} 
                placeholder="EAA..." 
                className="bg-zinc-900 border-zinc-800 text-sm h-8"
              />
            </div>



            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsConfiguring(false)} className="h-7 text-xs">Cancel</Button>
              <Button size="sm" onClick={handleSaveConfig} className="h-7 text-xs bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Save</Button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800/50">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
            onClick={() => setIsConfiguring(!isConfiguring)}
          >
            <Settings className="w-4 h-4 mr-1" /> Config
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            onClick={async () => {
              try {
                await deleteInstance({ id: instance.id });
              } catch (e: any) {
                setError(e.message || "Failed to disconnect instance.");
              }
            }}
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
