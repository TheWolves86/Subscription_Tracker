import { useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { clsx } from "clsx";

import {
  getClerkErrorMessage,
  validateEmailAddress,
  validatePassword,
  validateVerificationCode,
} from "@/lib/auth";

const SafeAreaView = styled(RNSafeAreaView);
const tabsHref = "/(tabs)" as Href;

export default function SignUp() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const isFetching = fetchStatus === "fetching";
  const isVerifyingEmail =
    pendingVerification ||
    (signUp.status === "missing_requirements" &&
      signUp.unverifiedFields.includes("email_address") &&
      signUp.missingFields.length === 0);

  const emailError = localErrors.emailAddress ?? errors.fields.emailAddress?.message;
  const passwordError = localErrors.password ?? errors.fields.password?.message;
  const confirmPasswordError = localErrors.confirmPassword;
  const codeError = localErrors.code ?? errors.fields.code?.message;

  const finalizeSignUp = async () => {
    let didNavigate = false;
    let blockedByTask = false;

    const { error } = await signUp.finalize({
      navigate: ({ session }) => {
        if (session.currentTask) {
          blockedByTask = true;
          setFormError("Your account needs one more setup step before you can continue.");
          return;
        }

        didNavigate = true;
        router.replace(tabsHref);
      },
    });

    if (error) {
      setFormError(getClerkErrorMessage(error, "We could not finish creating your account."));
      return;
    }

    if (!blockedByTask && !didNavigate) {
      router.replace(tabsHref);
    }
  };

  const handleSubmit = async () => {
    const nextErrors = {
      emailAddress: validateEmailAddress(emailAddress),
      password: validatePassword(password),
      confirmPassword:
        password && confirmPassword && password !== confirmPassword
          ? "Passwords do not match."
          : validatePassword(confirmPassword),
    };

    setLocalErrors(nextErrors);
    setFormError(null);

    if (nextErrors.emailAddress || nextErrors.password || nextErrors.confirmPassword) return;

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      setFormError(getClerkErrorMessage(error, "We could not create your account."));
      return;
    }

    const { error: sendCodeError } = await signUp.verifications.sendEmailCode();

    if (sendCodeError) {
      setFormError(getClerkErrorMessage(sendCodeError, "We could not send a verification code."));
      return;
    }

    setPendingVerification(true);
  };

  const handleVerify = async () => {
    const nextErrors = {
      code: validateVerificationCode(code),
    };

    setLocalErrors(nextErrors);
    setFormError(null);

    if (nextErrors.code) return;

    const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });

    if (error) {
      setFormError(getClerkErrorMessage(error, "That verification code did not work."));
      return;
    }

    if (signUp.status === "complete") {
      await finalizeSignUp();
      return;
    }

    setFormError("Verification is not complete yet. Check the code and try again.");
  };

  const handleResendCode = async () => {
    setFormError(null);

    const { error } = await signUp.verifications.sendEmailCode();

    if (error) {
      setFormError(getClerkErrorMessage(error, "We could not send a new code."));
    }
  };

  const handleReset = async () => {
    await signUp.reset();
    setPendingVerification(false);
    setCode("");
    setLocalErrors({});
    setFormError(null);
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content justify-center">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark rounded-bl-3xl rounded-tr-3xl">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurly</Text>
                  <Text className="auth-wordmark-sub">Smart billing</Text>
                </View>
              </View>

              <Text className="auth-title">
                {isVerifyingEmail ? "Verify your email" : "Create account"}
              </Text>
              <Text className="auth-subtitle">
                {isVerifyingEmail
                  ? "Enter the code we sent to confirm your new account."
                  : "Start tracking renewals with a secure Recurly account."}
              </Text>
            </View>

            <View className="auth-card">
              {formError ? (
                <View className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3">
                  <Text className="text-sm font-sans-semibold text-destructive">{formError}</Text>
                </View>
              ) : null}

              {isVerifyingEmail ? (
                <View className="auth-form">
                  <View className="rounded-2xl bg-muted px-4 py-3">
                    <Text className="text-sm font-sans-semibold text-primary">
                      Code sent to {emailAddress.trim()}
                    </Text>
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={clsx("auth-input", codeError && "auth-input-error")}
                      value={code}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0, 0, 0, 0.45)"
                      onChangeText={(value) => {
                        setCode(value);
                        setLocalErrors((current) => ({ ...current, code: null }));
                      }}
                      keyboardType="number-pad"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      editable={!isFetching}
                    />
                    {codeError ? <Text className="auth-error">{codeError}</Text> : null}
                  </View>

                  <Pressable
                    className={clsx("auth-button", isFetching && "auth-button-disabled")}
                    onPress={handleVerify}
                    disabled={isFetching}
                  >
                    {isFetching ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Verify account</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={handleResendCode}
                    disabled={isFetching}
                  >
                    <Text className="auth-secondary-button-text">Send a new code</Text>
                  </Pressable>

                  <Pressable className="items-center py-2" onPress={handleReset} disabled={isFetching}>
                    <Text className="auth-link">Change email</Text>
                  </Pressable>
                </View>
              ) : (
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Email</Text>
                    <TextInput
                      className={clsx("auth-input", emailError && "auth-input-error")}
                      value={emailAddress}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(0, 0, 0, 0.45)"
                      onChangeText={(value) => {
                        setEmailAddress(value);
                        setLocalErrors((current) => ({ ...current, emailAddress: null }));
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      autoComplete="email"
                      editable={!isFetching}
                    />
                    {emailError ? <Text className="auth-error">{emailError}</Text> : null}
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <TextInput
                      className={clsx("auth-input", passwordError && "auth-input-error")}
                      value={password}
                      placeholder="Create a password"
                      placeholderTextColor="rgba(0, 0, 0, 0.45)"
                      onChangeText={(value) => {
                        setPassword(value);
                        setLocalErrors((current) => ({ ...current, password: null }));
                      }}
                      secureTextEntry
                      textContentType="newPassword"
                      autoComplete="new-password"
                      editable={!isFetching}
                    />
                    {passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Confirm password</Text>
                    <TextInput
                      className={clsx("auth-input", confirmPasswordError && "auth-input-error")}
                      value={confirmPassword}
                      placeholder="Repeat your password"
                      placeholderTextColor="rgba(0, 0, 0, 0.45)"
                      onChangeText={(value) => {
                        setConfirmPassword(value);
                        setLocalErrors((current) => ({ ...current, confirmPassword: null }));
                      }}
                      secureTextEntry
                      textContentType="newPassword"
                      autoComplete="new-password"
                      editable={!isFetching}
                    />
                    {confirmPasswordError ? (
                      <Text className="auth-error">{confirmPasswordError}</Text>
                    ) : null}
                  </View>

                  <Pressable
                    className={clsx("auth-button", isFetching && "auth-button-disabled")}
                    onPress={handleSubmit}
                    disabled={isFetching}
                  >
                    {isFetching ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Create account</Text>
                    )}
                  </Pressable>

                  <View className="auth-link-row">
                    <Text className="auth-link-copy">Already have an account?</Text>
                    <Link href="/sign-in" asChild>
                      <Pressable disabled={isFetching}>
                        <Text className="auth-link">Sign in</Text>
                      </Pressable>
                    </Link>
                  </View>

                  <View nativeID="clerk-captcha" />
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
