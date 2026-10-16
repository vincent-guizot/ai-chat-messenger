const { z } = require("zod");

// Id di database adalah UUID, tetapi diperiksa secara longgar (string non-kosong, panjang wajar)
// agar id dari sumber lain tetap bisa diproses dan error-nya jelas.
const MAX_ID_LENGTH = 64;

/**
 * Field id (UUID atau string pendek). `label` dipakai dalam pesan error, mis. "userId".
 */
function idField(label) {
  return z
    .string({
      required_error: `${label} required`,
      invalid_type_error: `${label} must be a string`,
    })
    .trim()
    .min(1, { message: `${label} required` })
    .max(MAX_ID_LENGTH, { message: `${label} is too long` });
}

module.exports = { idField: idField };
