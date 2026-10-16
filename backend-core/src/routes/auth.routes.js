const express = require("express");
const AuthController = require("../controllers/AuthController");
const ValidationMiddleware = require("../middlewares/ValidationMiddleware");
const { signupSchema, loginSchema } = require("../validation/auth.schema");

const router = express.Router();

router.post(
  "/signup",
  ValidationMiddleware.validateBody(signupSchema),
  AuthController.signup,
);
router.post(
  "/login",
  ValidationMiddleware.validateBody(loginSchema),
  AuthController.login,
);

module.exports = router;
