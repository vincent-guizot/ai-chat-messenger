const bcrypt = require('bcrypt');
const prisma = require('./prisma');

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

// User tambahan agar daftar kontak & direct message bisa langsung dicoba.
// Semua memakai password yang sama dengan DEMO_USER.
const CONTACT_USERS = [
  { email: 'andi@mail.com', name: 'Andi', password: 'password123', lastSeenMinutesAgo: 2 },
  { email: 'sarah@mail.com', name: 'Sarah', password: 'password123', lastSeenMinutesAgo: 10 },
  { email: 'budi@mail.com', name: 'Budi', password: 'password123', lastSeenMinutesAgo: 60 },
  { email: 'david@mail.com', name: 'David', password: 'password123', lastSeenMinutesAgo: 180 },
];

const DEMO_ASSISTANT_REPLY = [
  'Tentu! Node.js adalah runtime JavaScript berbasis V8 untuk backend. Beberapa hal yang perlu dipelajari:',
  '',
  '1. Event loop dan asynchronous programming',
  '2. Module system (CommonJS & ES Modules)',
  '3. Membuat REST API dengan Express',
  '4. Koneksi ke database',
  '',
  'Contoh server Express sederhana:',
  '',
  '```js',
  "const express = require('express');",
  '',
  'const app = express();',
  '',
  "app.get('/', (request, response) => {",
  "  response.json({ message: 'Hello World' });",
  '});',
  '',
  'app.listen(3000);',
  '```',
  '',
  'Mau mulai dari `event loop` dulu?',
].join('\n');

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
    console.log('Demo AI conversation already exists, skipping.');
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
      content: DEMO_ASSISTANT_REPLY,
      metadata: { provider: 'assistant', model: 'demo' },
    },
  });
}

async function upsertContact(contactData) {
  const user = await upsertUser(contactData);
  const lastSeenAt = new Date(Date.now() - contactData.lastSeenMinutesAgo * 60 * 1000);

  return prisma.user.update({
    where: { id: user.id },
    data: { lastSeenAt: lastSeenAt },
  });
}

/**
 * Membuat contoh direct message antara user demo dan satu kontak.
 */
async function createDemoDirectMessage(demoUser, contactUser) {
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      type: 'dm',
      AND: [
        { participants: { some: { userId: demoUser.id } } },
        { participants: { some: { userId: contactUser.id } } },
      ],
    },
  });

  if (existingConversation) {
    console.log('Demo direct message already exists, skipping.');
    return;
  }

  const conversation = await prisma.conversation.create({
    data: {
      type: 'dm',
      createdById: contactUser.id,
      participants: {
        create: [
          { userId: demoUser.id, role: 'member' },
          { userId: contactUser.id, role: 'member' },
        ],
      },
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: contactUser.id,
      senderRole: 'user',
      content: 'Halo! Sudah coba fitur chat langsung?',
    },
  });
}

async function seed() {
  try {
    const demoUser = await upsertUser(DEMO_USER);
    const assistantUser = await upsertUser(ASSISTANT_USER);

    await createDemoConversation(demoUser, assistantUser);

    const contacts = [];
    for (const contactData of CONTACT_USERS) {
      contacts.push(await upsertContact(contactData));
    }

    await createDemoDirectMessage(demoUser, contacts[0]);

    console.log('Seed finished successfully.');
    console.log(`Demo login -> email: ${DEMO_USER.email} | password: ${DEMO_USER.password}`);
    console.log('Other users  -> andi@mail.com, sarah@mail.com, budi@mail.com, david@mail.com (password sama)');
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
