"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeSlash } from "@gravity-ui/icons";
import {
  Button,
  FieldError,
  Form,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";

// Inline Google SVG Icon component
function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Email & Password Sign In Handler
  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          toast.success("Signed in successfully!");
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setIsLoading(false);
          toast.error(ctx.error.message || "Failed to sign in. Please check your credentials.");
        },
      }
    );
  };

  // Google Social Sign In Handler
  const handleGoogleLogin = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => {
          setIsGoogleLoading(true);
        },
        onError: (ctx) => {
          setIsGoogleLoading(false);
          toast.error(ctx.error.message || "Google sign-in failed.");
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Form
        className="flex w-full max-w-md flex-col gap-4 rounded-xl border p-6 shadow-sm"
        onSubmit={onSubmit}
      >
        <h2 className="text-2xl font-bold text-center">Welcome Back</h2>

        {/* Google Sign-In Button */}
        <Button
          type="button"
          variant="secondary"
          className="flex w-full items-center justify-center gap-2"
          isLoading={isGoogleLoading}
          isDisabled={isLoading || isGoogleLoading}
          onPress={handleGoogleLogin}
        >
          {!isGoogleLoading && <GoogleIcon />}
          Sign in with Google
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="h-[1px] flex-1 bg-gray-200" />
          <span className="text-xs uppercase text-gray-400 font-semibold">Or</span>
          <div className="h-[1px] flex-1 bg-gray-200" />
        </div>

        {/* Email Field */}
        <TextField
          isRequired
          name="email"
          type="email"
          validate={(value) => {
            if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
              return "Please enter a valid email address";
            }
            return null;
          }}
        >
          <Label>Email</Label>
          <InputGroup>
            <InputGroup.Input placeholder="john@example.com" />
          </InputGroup>
          <FieldError />
        </TextField>

        {/* Password Field */}
        <TextField isRequired name="password">
          <div className="flex justify-between items-center">
            <Label>Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <InputGroup>
            <InputGroup.Input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Enter your password"
            />
            <InputGroup.Suffix className="pr-0">
              <Button
                isIconOnly
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                size="sm"
                variant="ghost"
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeSlash className="size-4" />
                )}
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
          <FieldError />
        </TextField>

        {/* Submit Actions */}
        <div className="pt-2">
          <Button
            className="w-full flex items-center justify-center gap-2"
            type="submit"
            isLoading={isLoading}
            isDisabled={isLoading || isGoogleLoading}
          >
            Sign In
            {!isLoading && <ArrowRight />}
          </Button>
        </div>

        {/* Sign Up Navigation Link */}
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-blue-600 hover:underline"
          >
            Create account
          </Link>
        </p>
      </Form>
    </div>
  );
}