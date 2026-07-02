require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const nome = process.env.SEED_ADMIN_NAME || 'Administrador';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@sarc2.local';
  const senha = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

  const senhaHash = await bcrypt.hash(senha, 10);

  const admin = await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: {
      nome,
      email,
      senhaHash,
      role: 'ADMIN',
      ativo: true,
    },
  });

  console.log(`[seed] Administrador pronto: ${admin.email} (id=${admin.id})`);
}

main()
  .catch((err) => {
    console.error('[seed] Falha ao criar administrador inicial:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
