const { z } = require("zod");
const { idField } = require("./common.schema");

const MAX_TITLE_LENGTH = 200;

/**
 * Hanya nilai boolean `true` yang dianggap true. String "true" atau angka 1 diabaikan
 * (bukan ditolak), sama seperti perilaku sebelumnya.
 */
function onlyExactlyTrue(value) {
  return value === true;
}

/**
 * POST /api/conversations
 * Body: { type?, title?, participantIds?, withAi? }
 * Nilai default diterapkan di sini supaya controller tidak perlu mengisi sendiri.
 */
const storeConversationSchema = z.object({
  type: z
    .string({ invalid_type_error: "type must be a string" })
    .trim()
    .min(1, { message: "type must not be empty" })
    .default("dm"),
  title: z
    .string({ invalid_type_error: "title must be a string" })
    .trim()
    .min(1, { message: "title must not be empty" })
    .max(MAX_TITLE_LENGTH, {
      message: `title must be at most ${MAX_TITLE_LENGTH} characters`,
    })
    .default("New chat"),
  participantIds: z
    .array(idField("participantId"), {
      invalid_type_error: "participantIds must be an array",
    })
    .default([]),
  withAi: z.unknown().transform(onlyExactlyTrue),
});

/**
 * POST /api/conversations/direct
 * Body: { userId }
 */
const directConversationSchema = z.object({
  userId: idField("userId"),
});

/**
 * Params :id pada /api/conversations/:id/...
 */
const conversationIdParamsSchema = z.object({
  id: idField("conversation id"),
});

/**
 * Params :id dan :messageId pada /api/conversations/:id/messages/:messageId
 */
const messageIdParamsSchema = z.object({
  id: idField("conversation id"),
  messageId: idField("message id"),
});

module.exports = {
  storeConversationSchema: storeConversationSchema,
  directConversationSchema: directConversationSchema,
  conversationIdParamsSchema: conversationIdParamsSchema,
  messageIdParamsSchema: messageIdParamsSchema,
};
