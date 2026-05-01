import { prisma } from './src/app';

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: { username: true, email: true }
    });
    console.log("Current Users in DB:", users);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
main();
