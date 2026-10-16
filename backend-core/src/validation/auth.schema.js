const { z } = require("zod");

// Pesan ini dipakai untuk email maupun password yang kosong, agar sama dengan perilaku lama
// (client cukup tahu bahwa keduanya wajib diisi).
const REQUIRED_MESSAGE = "email and password required";
const MIN_PASSWORD_LENGTH = 6;

const emailField = z
  .string({
    required_error: REQUIRED_MESSAGE,
    invalid_type_error: "email must be a string",
  })
  .min(1, { message: REQUIRED_MESSAGE })
  .email({ message: "email must be a valid email address" });

const passwordField = z
  .string({
    required_error: REQUIRED_MESSAGE,
    invalid_type_error: "password must be a string",
  })
  .min(1, { message: REQUIRED_MESSAGE });

/**
 * POST /api/auth/signup
 * Panjang minimal password hanya diperiksa saat mendaftar; saat login user lama
 * dengan password pendek tetap harus bisa masuk.
 */
const signupSchema = z.object({
  email: emailField,
  password: passwordField.min(MIN_PASSWORD_LENGTH, {
    message: `password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  }),
  name: z
    .string({ invalid_type_error: "name must be a string" })
    .trim()
    .max(100)
    .optional(),
});

/**
 * POST /api/auth/login
 */
const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

module.exports = { signupSchema: signupSchema, loginSchema: loginSchema };
