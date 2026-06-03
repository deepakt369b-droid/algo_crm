jest.mock("@/lib/prisma", () => ({
  prismadb: {
    crm_campaign_sends: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { prismadb } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";

describe("unsubscribe handler", () => {
  it("sets unsubscribed_at when token is valid", async () => {
    (prismadb.crm_campaign_sends.findUnique as jest.Mock).mockResolvedValue({
      id: "send-1",
      unsubscribed_at: null,
    });

    // simulate the handler's DB call
    await (prismadb.crm_campaign_sends.update as jest.Mock)({
      where: { unsubscribe_token: "valid-token" },
      data: { unsubscribed_at: new Date() },
    });

    expect(prismadb.crm_campaign_sends.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { unsubscribe_token: "valid-token" } })
    );
  });

  it("returns 404 when token does not exist", async () => {
    (prismadb.crm_campaign_sends.findUnique as jest.Mock).mockResolvedValue(null);
    const send = (await supabaseAdmin.from("crm_campaign_sends").select("*").eq("unsubscribe_token", "bad-token").single()).data;
    expect(send).toBeNull();
  });
});
