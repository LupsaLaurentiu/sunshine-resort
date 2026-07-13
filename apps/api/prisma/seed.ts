import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type SeedAdmin = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is missing from environment variables.`);
  }

  return value;
}

async function upsertAdmin(admin: SeedAdmin): Promise<void> {
  const passwordHash = await bcrypt.hash(admin.password, 12);
  const email = admin.email.trim().toLowerCase();

  await prisma.admin.upsert({
    where: { email },
    update: {
      passwordHash,
      firstName: admin.firstName,
      lastName: admin.lastName,
      isActive: true,
    },
    create: {
      email,
      passwordHash,
      firstName: admin.firstName,
      lastName: admin.lastName,
      isActive: true,
    },
  });
}

async function main(): Promise<void> {
  await upsertAdmin({
    email: getRequiredEnv('ADMIN_1_EMAIL'),
    password: getRequiredEnv('ADMIN_1_PASSWORD'),
    firstName: 'Admin',
    lastName: 'One',
  });

  await upsertAdmin({
    email: getRequiredEnv('ADMIN_2_EMAIL'),
    password: getRequiredEnv('ADMIN_2_PASSWORD'),
    firstName: 'Admin',
    lastName: 'Two',
  });

  console.log('Admin seed completed.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });