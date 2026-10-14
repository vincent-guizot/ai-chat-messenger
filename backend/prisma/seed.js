const prisma = require('./prisma');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    // Create admin user (demo account)
    const passwordPlain = 'password123';
    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@mail.com' },
      update: {},
      create: {
        email: 'admin@mail.com',
        name: 'Admin 125',
        passwordHash: passwordHash,
      },
    });

    // Create an assistant user used by AI conversations
    const assistantHash = await bcrypt.hash('assistant-secret', 10);
    const assistantUser = await prisma.user.upsert({
      where: { email: 'assistant@ai-chat.local' },
      update: {},
      create: {
        email: 'assistant@ai-chat.local',
        name: 'AI Assistant',
        passwordHash: assistantHash,
      },
    });

    // Create an AI conversation and attach participants
    const conversation = await prisma.conversation.create({
      data: {
        type: 'ai',
        title: 'AI Assistant',
        createdById: adminUser.id,
        participants: {
          create: [
            {
              userId: adminUser.id,
              role: 'member',
            },
            {
              userId: assistantUser.id,
              role: 'assistant',
            },
          ],
        },
      },
      include: {
        participants: true,
      },
    });

    // Create a couple of starter messages in the conversation
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: adminUser.id,
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
        content:
          'Tentu! Node.js adalah runtime JavaScript berbasis V8 untuk backend. Kita bisa belajar tentang event loop, Express, serta API dan database.',
        metadata: { provider: 'assistant', model: 'demo' },
      },
    });

    console.log('Prisma seed finished successfully.');
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
