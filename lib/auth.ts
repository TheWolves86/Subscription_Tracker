const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmailAddress = (value: string): string | null => {
  const email = value.trim();

  if (!email) return "Email is required.";
  if (!emailPattern.test(email)) return "Enter a valid email address.";

  return null;
};

export const validatePassword = (value: string): string | null => {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";

  return null;
};

export const validateVerificationCode = (value: string): string | null => {
  const code = value.trim();

  if (!code) return "Verification code is required.";
  if (code.length < 6) return "Enter the 6-digit verification code.";

  return null;
};

export const getClerkErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
};
