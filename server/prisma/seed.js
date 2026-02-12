const { PrismaClient } = require("@prisma/client");

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
      name: "Collectbot",
      slug: "collectbot",
      icon: "code",
      color: "#22C55E",
      order: 1,
    },
    {
      name: "Approvals",
      slug: "approvals",
      icon: "check-circle",
      color: "#3B82F6",
      order: 2,
    },
    {
      name: "Sync Engine",
      slug: "sync-engine",
      icon: "refresh-cw",
      color: "#8B5CF6",
      order: 3,
    },
    {
      name: "Settings",
      slug: "settings",
      icon: "settings",
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

  // ─── Create a test admin user ───
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@neokred.tech" },
    update: {},
    create: {
      email: "admin@neokred.tech",
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log(`  ✅ Admin user: ${adminUser.email}`);

  // ─── Create a test member user ───
  const memberUser = await prisma.user.upsert({
    where: { email: "madhav@neokred.tech" },
    update: {},
    create: {
      email: "madhav@neokred.tech",
      name: "Madhav",
      role: "MEMBER",
    },
  });
  console.log(`  ✅ Member user: ${memberUser.email}`);

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
        authorId: memberUser.id,
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
