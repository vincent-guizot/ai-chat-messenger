const prisma = require('./prisma');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        email: 'demo@example.com',
        name: 'Demo User',
        passwordHash,
      }
    });

    const assistant = await prisma.user.upsert({
      where: { email: 'assistant@ai-chat.local' },
      update: {},
      create: {
        email: 'assistant@ai-chat.local',
        name: 'AI Assistant',
        passwordHash: await bcrypt.hash('assistant-secret', 10),
      }
    });

    const conversation = await prisma.conversation.upsert({
      where: { id: '33333333-3333-4333-8333-333333333333' },
      update: {},
      create: {
        id: '33333333-3333-4333-8333-333333333333',
        type: 'ai',
        title: 'AI Assistant',
        createdById: demoUser.id,
        participants: {
          create: [
            { userId: demoUser.id, role: 'member' },
            { userId: assistant.id, role: 'assistant' }
          ]
        }
      },
      include: { participants: true }
    });

    await prisma.message.upsert({
      where: { id: '66666666-6666-4666-8666-666666666666' },
      update: {},
      create: {
        id: '66666666-6666-4666-8666-666666666666',
        conversationId: conversation.id,
        senderId: demoUser.id,
        senderRole: 'user',
        content: 'Halo AI, bantu saya belajar Node.js.',
        metadata: { provider: 'demo' }
      }
    });

    await prisma.message.upsert({
      where: { id: '77777777-7777-4777-8777-777777777777' },
      update: {},
      create: {
        id: '77777777-7777-4777-8777-777777777777',
        conversationId: conversation.id,
        senderId: assistant.id,
        senderRole: 'assistant',
        content: 'Tentu! Node.js adalah runtime JavaScript berbasis V8 untuk backend. Kita bisa belajar tentang event loop, Express, serta API dan database.',
        metadata: { provider: 'assistant', model: 'demo' }
      }
    });

    console.log('Seed finished');
  } catch (err) {
    console.error('Seed error', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
