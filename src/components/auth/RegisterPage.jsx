"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeSlash } from "@gravity-ui/icons";
import {
  Button,
  Description,
  FieldError,
  Form,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";

export function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const imageUrl = formData.get("imageUrl")?.toString();
    const password = formData.get("password")?.toString();

    // Trigger Better Auth Signup
    await authClient.signUp.email(
      {
        email,
        password,
        name,
        image: imageUrl || undefined,
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          setIsLoading(false);
          toast.success("Account created successfully!");
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setIsLoading(false);
          toast.error(ctx.error.message || "Failed to create account");
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Form
        className="flex w-full max-w-md flex-col gap-4 rounded-xl border p-6 shadow-sm"
        onSubmit={onSubmit}
      >
        <h2 className="text-2xl font-bold text-center">Create an Account</h2>

        {/* Full Name Field */}
        <TextField
          isRequired
          name="name"
          type="text"
          validate={(value) => (!value ? "Full Name is required" : null)}
        >
          <Label>Full Name</Label>
          <InputGroup>
            <InputGroup.Input placeholder="John Doe" />
          </InputGroup>
          <FieldError />
        </TextField>

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

        {/* Image URL Field */}
        <TextField
          name="imageUrl"
          type="url"
          validate={(value) => {
            if (!value) return null; // Optional field
            try {
              new URL(value);
              return null;
            } catch {
              return "Please enter a valid URL (e.g., https://example.com/avatar.jpg)";
            }
          }}
        >
          <Label>Profile Image URL (Optional)</Label>
          <InputGroup>
            <InputGroup.Input placeholder="https://example.com/avatar.jpg" />
          </InputGroup>
          <Description>
            Enter a direct link to your avatar or profile image
          </Description>
          <FieldError />
        </TextField>

        {/* Password Field */}
        <TextField
          isRequired
          minLength={8}
          name="password"
          validate={(value) => {
            if (value.length < 8) {
              return "Password must be at least 8 characters";
            }
            if (!/[A-Z]/.test(value)) {
              return "Password must contain at least one uppercase letter";
            }
            if (!/[0-9]/.test(value)) {
              return "Password must contain at least one number";
            }
            return null;
          }}
        >
          <Label>Password</Label>
          <InputGroup>
            <InputGroup.Input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputGroup.Suffix className="pr-0">
              <Button
                isIconOnly
                aria-label={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
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
          <Description>
            Must be at least 8 characters with 1 uppercase and 1 number
          </Description>
          <FieldError />
        </TextField>

        {/* Confirm Password Field */}
        <TextField
          isRequired
          name="confirmPassword"
          validate={(value) => {
            if (value !== password) {
              return "Passwords do not match";
            }
            return null;
          }}
        >
          <Label>Confirm Password</Label>
          <InputGroup>
            <InputGroup.Input
              type={isConfirmPasswordVisible ? "text" : "password"}
              placeholder="Re-enter your password"
            />
            <InputGroup.Suffix className="pr-0">
              <Button
                isIconOnly
                aria-label={
                  isConfirmPasswordVisible ? "Hide password" : "Show password"
                }
                size="sm"
                variant="ghost"
                onPress={() =>
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                }
              >
                {isConfirmPasswordVisible ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeSlash className="size-4" />
                )}
              </Button>
            </InputGroup.Suffix>
          </InputGroup>
          <FieldError />
        </TextField>

        {/* Form Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1"
            type="submit"
            isLoading={isLoading}
            isDisabled={isLoading}
          >
            {!isLoading && <Check />}
            Register
          </Button>
          <Button type="reset" variant="secondary" isDisabled={isLoading}>
            Reset
          </Button>
        </div>

        {/* Sign In Navigation Link */}
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Form>
    </div>
  );
}
