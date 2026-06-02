import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local"), override: true });

async function main() {
  // Dynamically import prismadb so it loads AFTER dotenv has run
  const { prismadb } = await import("../lib/prisma");

  const result = await prismadb.users.update({
    where: { email: "deepakt369b@gmail.com" },
    data: {
      userStatus: "ACTIVE",
      role: "admin",
      isSuperAdmin: true,
    },
  });
  console.log("Success! Updated user to Admin:", result.email);
}

main()
  .catch((err) => {
    console.error("Failed to promote user:", err);
    process.exit(1);
  });
