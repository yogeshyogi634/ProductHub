import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Create 5 Products ───
  const products = [
    {
      name: "Perkle",
      slug: "perkle",
      icon: "flame",
      color: "#F97316",
      order: 0,
    },
    {
      name: "Blutic",
      slug: "blutic",
      icon: "droplet",
      color: "#3B82F6",
      order: 1,
    },
    {
      name: "Collectbot",
      slug: "collectbot",
      icon: "bot",
      color: "#22C55E",
      order: 2,
    },
    {
      name: "ProfileX",
      slug: "profilex",
      icon: "user",
      color: "#8B5CF6",
      order: 3,
    },
    {
      name: "Svitch",
      slug: "svitch",
      icon: "toggle-left",
      color: "#EF4444",
      order: 4,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    console.log(`  ✅ Product: ${product.name}`);
  }

  // ─── Create management users ───
  const managementUsers = [
    {
      email: "cto@neokred.tech", 
      name: "CTO",
      role: "MANAGEMENT",
    },
    {
      email: "manager1@neokred.tech",
      name: "Manager One",
      role: "MANAGEMENT",
    },
  ];

  for (const mgmtUser of managementUsers) {
    const user = await prisma.user.upsert({
      where: { email: mgmtUser.email },
      update: {},
      create: mgmtUser,
    });
    console.log(`  ✅ Management user: ${user.email}`);
  }

  // ─── Create a test employee user ───
  const employeeUser = await prisma.user.upsert({
    where: { email: "madhav@neokred.tech" },
    update: {},
    create: {
      email: "madhav@neokred.tech",
      name: "Madhav",
      role: "EMPLOYEE",
    },
  });
  console.log(`  ✅ Employee user: ${employeeUser.email}`);

  // ─── Create sample updates ───
  const collectbot = await prisma.product.findUnique({
    where: { slug: "collectbot" },
  });

  if (collectbot) {
    const sampleUpdate = await prisma.update.create({
      data: {
        title: "Payment Integration on Collectbot",
        description:
          "We are integrating with our own payment gateway and from next quarter we will be integrating this to all our internal products.",
        status: "WIP",
        productId: collectbot.id,
        authorId: adminUser.id,
      },
    });
    console.log(`  ✅ Sample update: ${sampleUpdate.title}`);

    // ─── Create sample feedback ───
    const sampleFeedback = await prisma.feedback.create({
      data: {
        message: "New UI is good!",
        isAnonymous: true,
        productId: collectbot.id,
        authorId: employeeUser.id,
      },
    });
    console.log(`  ✅ Sample feedback: "${sampleFeedback.message}"`);
  }

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
