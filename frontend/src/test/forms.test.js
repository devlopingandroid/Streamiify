import { describe, it, expect } from "vitest";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

describe("Form Validation Schemas (Zod) Tests", () => {
  it("1. Login schema accepts valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Password123!",
    });
    expect(result.success).toBe(true);
  });

  it("2. Login schema rejects malformed email and short password", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = result.error.format();
      expect(formatted.email._errors).toContain("Invalid email address");
      expect(formatted.password._errors).toContain(
        "Password must be at least 6 characters"
      );
    }
  });

  it("3. Registration schema rejects missing fields and short username", () => {
    const result = registerSchema.safeParse({
      fullname: "",
      username: "ab",
      email: "invalid-email",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});
