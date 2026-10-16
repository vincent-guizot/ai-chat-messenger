const { z } = require("zod");
const { idField } = require("./common.schema");

/**
 * PATCH /api/notifications/read-all
 * Body (opsional): { conversationId } -> hanya notifikasi dari percakapan tersebut.
 * Body boleh kosong sama sekali, karena itu object-nya dibuat opsional dengan default {}.
 */
const readAllNotificationsSchema = z
  .object({
    conversationId: idField("conversationId").optional(),
  })
  .default({});

/**
 * Params :id pada /api/notifications/:id/read
 */
const notificationIdParamsSchema = z.object({
  id: idField("notification id"),
});

module.exports = {
  readAllNotificationsSchema: readAllNotificationsSchema,
  notificationIdParamsSchema: notificationIdParamsSchema,
};
