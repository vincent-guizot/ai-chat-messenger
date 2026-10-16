const { z } = require('zod');

// Batas wajar agar satu request tidak membawa riwayat yang terlalu panjang ke provider.
const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 20000;

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant'], {
    errorMap: () => ({ message: 'message role must be "user" or "assistant"' }),
  }),
  content: z
    .string({ required_error: 'message content required', invalid_type_error: 'message content must be a string' })
    .max(MAX_CONTENT_LENGTH, { message: `message content must be at most ${MAX_CONTENT_LENGTH} characters` }),
});

/**
 * POST /api/ai/reply
 * Body: { messages: [{ role, content }] } -> riwayat percakapan, pesan terakhir dari user.
 */
const replySchema = z.object({
  messages: z
    .array(chatMessageSchema, {
      required_error: 'messages required',
      invalid_type_error: 'messages must be an array',
    })
    .min(1, { message: 'messages must not be empty' })
    .max(MAX_MESSAGES, { message: `messages must contain at most ${MAX_MESSAGES} items` }),
});

module.exports = { replySchema: replySchema };
