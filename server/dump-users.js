const { PrismaClient } = require('./src/generated/client/client.js');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: { username: true, email: true }
    });
    console.log("Current Users in DB:", users);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
