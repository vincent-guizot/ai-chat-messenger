const bcrypt = require('bcrypt');
const prisma = require('../src/config/database');

const DEMO_USER = {
  email: 'admin@mail.com',
  name: 'Admin 125',
  password: 'password123',
};

const ASSISTANT_USER = {
  email: 'assistant@ai-chat.local',
  name: 'AI Assistant',
  password: 'assistant-secret',
};

async function upsertUser(userData) {
  const passwordHash = await bcrypt.hash(userData.password, 10);

  return prisma.user.upsert({
    where: { email: userData.email },
    update: {},
    create: {
      email: userData.email,
      name: userData.name,
      passwordHash: passwordHash,
    },
  });
}

/**
 * Membuat percakapan demo dengan AI, hanya jika user demo belum punya percakapan AI.
 * Dengan begitu seed aman dijalankan berkali-kali.
 */
async function createDemoConversation(demoUser, assistantUser) {
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      createdById: demoUser.id,
      type: 'ai',
    },
  });

  if (existingConversation) {
    console.log('Demo conversation already exists, skipping.');
    return;
  }

  const conversation = await prisma.conversation.create({
    data: {
      type: 'ai',
      title: 'AI Assistant',
      createdById: demoUser.id,
      participants: {
        create: [
          { userId: demoUser.id, role: 'member' },
          { userId: assistantUser.id, role: 'assistant' },
        ],
      },
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: demoUser.id,
      senderRole: 'user',
      content: 'Halo AI, bantu saya belajar Node.js.',
      metadata: { provider: 'demo' },
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: assistantUser.id,
      senderRole: 'assistant',
      content: 'Tentu! Node.js adalah runtime JavaScript berbasis V8 untuk backend. Kita bisa belajar tentang event loop, Express, serta API dan database.',
      metadata: { provider: 'assistant', model: 'demo' },
    },
  });
}

async function seed() {
  try {
    const demoUser = await upsertUser(DEMO_USER);
    const assistantUser = await upsertUser(ASSISTANT_USER);

    await createDemoConversation(demoUser, assistantUser);

    console.log('Seed finished successfully.');
    console.log(`Demo login -> email: ${DEMO_USER.email} | password: ${DEMO_USER.password}`);
  } catch (error) {
    console.error('Seed error:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
