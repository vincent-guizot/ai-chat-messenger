"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = await bcrypt.hash("password123", 10);

    await queryInterface.bulkInsert("Users", [
      {
        id: "11111111-1111-4111-8111-111111111111",
        email: "demo@example.com",
        name: "Demo User",
        passwordHash,
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        email: "assistant@ai-chat.local",
        name: "AI Assistant",
        passwordHash: await bcrypt.hash("assistant-secret", 10),
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const [userRow] = await queryInterface.sequelize.query(
      "SELECT id FROM \"Users\" WHERE email = 'demo@example.com' LIMIT 1;",
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const [assistantRow] = await queryInterface.sequelize.query(
      "SELECT id FROM \"Users\" WHERE email = 'assistant@ai-chat.local' LIMIT 1;",
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const conversationId = "33333333-3333-4333-8333-333333333333";

    await queryInterface.bulkInsert("Conversations", [
      {
        id: conversationId,
        type: "ai",
        title: "AI Assistant",
        createdById: userRow.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("Participants", [
      {
        id: "44444444-4444-4444-8444-444444444444",
        conversationId,
        userId: userRow.id,
        role: "member",
        joinedAt: new Date(),
      },
      {
        id: "55555555-5555-4555-8555-555555555555",
        conversationId,
        userId: assistantRow.id,
        role: "assistant",
        joinedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("Messages", [
      {
        id: "66666666-6666-4666-8666-666666666666",
        conversationId,
        senderId: userRow.id,
        senderRole: "user",
        content: "Halo AI, bantu saya belajar Node.js.",
        metadata: { provider: "demo" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "77777777-7777-4777-8777-777777777777",
        conversationId,
        senderId: assistantRow.id,
        senderRole: "assistant",
        content:
          "Tentu! Node.js adalah runtime JavaScript berbasis V8 untuk backend. Kita bisa belajar tentang event loop, Express, serta API dan database.",
        metadata: { provider: "assistant", model: "demo" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Messages", null, {});
    await queryInterface.bulkDelete("Participants", null, {});
    await queryInterface.bulkDelete("Conversations", null, {});
    await queryInterface.bulkDelete("Users", {
      email: {
        [Sequelize.Op.in]: ["demo@example.com", "assistant@ai-chat.local"],
      },
    });
  },
};
