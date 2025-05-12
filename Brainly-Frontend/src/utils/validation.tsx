import { z } from "zod";

// Validation schema for signup
export const signupValid = z.object({
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscore allowed"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Validation schema for signin
export const signinValid = z.object({
  username: z.string().min(4, "Username must be at least 4 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Type for validation errors
export type ValidationErrors = {
  username?: string;
  password?: string;
};

// Function to validate form data and return errors
export function validateForm(
  schema: typeof signupValid | typeof signinValid,
  data: { username: string; password: string }
): ValidationErrors {
  try {
    schema.parse(data);
    return {}; // No errors
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrors = {};
      error.errors.forEach((err) => {
        const path = err.path[0] as keyof ValidationErrors;
        errors[path] = err.message;
      });
      return errors;
    }
    return {}; // Return empty object for other errors
  }
}