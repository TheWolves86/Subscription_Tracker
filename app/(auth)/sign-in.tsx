import { useSignIn } from "@clerk/expo";
import { clsx } from "clsx";
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

import {
    getClerkErrorMessage,
    validateEmailAddress,
    validatePassword,
    validateVerificationCode,
} from "@/lib/auth";

const SafeAreaView = styled(RNSafeAreaView);
const tabsHref = "/(tabs)" as Href;

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [localErrors, setLocalErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [needsEmailCode, setNeedsEmailCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emailError = localErrors.emailAddress;
  const passwordError = localErrors.password;
  const codeError = localErrors.code;

  const finalizeSignIn = async () => {
    let didNavigate = false;
    let blockedByTask = false;

    const { error } = await signIn.finalize({
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
      setFormError(getClerkErrorMessage(error, "We could not finish signing you in."));
      return;
    }

    if (!blockedByTask && !didNavigate) {
      router.replace(tabsHref);
    }
  };

  const handleSecondFactor = async () => {
    const emailFactor = signIn.supportedSecondFactors.find(
      (factor) => factor.strategy === "email_code",
    );

    if (!emailFactor) {
      setFormError("This account needs another verification method that is not available here yet.");
      return;
    }

    const { error } = await signIn.mfa.sendEmailCode();

    if (error) {
      setFormError(getClerkErrorMessage(error, "We could not send a verification code."));
      return;
    }

    setNeedsEmailCode(true);
  };

  const handleSubmit = async () => {
    if (!signIn) return;
    
    const nextErrors = {
      emailAddress: validateEmailAddress(emailAddress),
      password: validatePassword(password),
    };

    setLocalErrors(nextErrors);
    setFormError(null);
    setIsLoading(true);

    if (nextErrors.emailAddress || nextErrors.password) {
      setIsLoading(false);
      return;
    }

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      setIsLoading(false);
      setFormError(getClerkErrorMessage(error, "We could not sign you in."));
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSignIn();
      return;
    }

    if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
      await handleSecondFactor();
      setIsLoading(false);
      return;
    }

    setFormError("We need a little more information before signing you in.");
    setIsLoading(false);
  };

  const handleVerify = async () => {
    const nextErrors = {
      code: validateVerificationCode(code),
    };

    setLocalErrors(nextErrors);
    setFormError(null);

    if (nextErrors.code) return;

    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });

    if (error) {
      setFormError(getClerkErrorMessage(error, "That verification code did not work."));
      return;
    }

    if (signIn.status === "complete") {
      await finalizeSignIn();
      return;
    }

    setFormError("Verification is not complete yet. Check the code and try again.");
  };

  const handleResendCode = async () => {
    setFormError(null);

    const { error } = await signIn.mfa.sendEmailCode();

    if (error) {
      setFormError(getClerkErrorMessage(error, "We could not send a new code."));
    }
  };

  const handleReset = async () => {
    await signIn.reset();
    setNeedsEmailCode(false);
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
                {needsEmailCode ? "Check your email" : "Welcome back"}
              </Text>
              <Text className="auth-subtitle">
                {needsEmailCode
                  ? "Enter the code we sent to finish signing in securely."
                  : "Sign in to continue managing your subscriptions."}
              </Text>
            </View>

            <View className="auth-card">
              {formError ? (
                <View className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3">
                  <Text className="text-sm font-sans-semibold text-destructive">{formError}</Text>
                </View>
              ) : null}

              {needsEmailCode ? (
                <View className="auth-form">
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
                        editable={!isLoading}
                    />
                    {codeError ? <Text className="auth-error">{codeError}</Text> : null}
                  </View>

                  <Pressable
                    className={clsx("auth-button", isLoading && "auth-button-disabled")}
                    onPress={handleVerify}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Verify and continue</Text>
                    )}
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={handleResendCode}
                    disabled={isLoading}
                  >
                    <Text className="auth-secondary-button-text">Send a new code</Text>
                  </Pressable>

                  <Pressable className="items-center py-2" onPress={handleReset} disabled={isLoading}>
                    <Text className="auth-link">Start over</Text>
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
                      editable={!isLoading}
                    />
                    {emailError ? <Text className="auth-error">{emailError}</Text> : null}
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <TextInput
                      className={clsx("auth-input", passwordError && "auth-input-error")}
                      value={password}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(0, 0, 0, 0.45)"
                      onChangeText={(value) => {
                        setPassword(value);
                        setLocalErrors((current) => ({ ...current, password: null }));
                      }}
                      secureTextEntry
                      textContentType="password"
                      autoComplete="password"
                      editable={!isLoading}
                    />
                    {passwordError ? <Text className="auth-error">{passwordError}</Text> : null}
                  </View>

                  <Pressable
                    className={clsx("auth-button", isLoading && "auth-button-disabled")}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Sign in</Text>
                    )}
                  </Pressable>

                  <View className="auth-divider-row">
                    <View className="auth-divider-line" />
                    <Text className="auth-divider-text">Secure access</Text>
                    <View className="auth-divider-line" />
                  </View>

                  <View className="auth-link-row">
                    <Text className="auth-link-copy">New to Recurly?</Text>
                    <Link href="/sign-up" asChild>
                      <Pressable disabled={isLoading}>
                        <Text className="auth-link">Create an account</Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
