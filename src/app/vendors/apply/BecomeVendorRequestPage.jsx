"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Clock, ShieldCheck, Shield, ArrowRight, FaceFun } from "@gravity-ui/icons";
import {
  Button,
  FieldError,
  Form,
  InputGroup,
  Label,
  TextField,
  Select,
  ListBox,
} from "@heroui/react";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";
import { submitApplicationForVendor } from "@/lib/actions/vendors";
import { checkVendorRequestStatus } from "@/lib/api/vendors";
import { getAdminCategories } from "@/lib/api/categories";

export function BecomeVendorRequestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [existingRequest, setExistingRequest] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await getAdminCategories();
        if (res && res.success && Array.isArray(res.data)) {
          const formattedCategories = res.data.map((cat) => ({
            label: cat.name,
            value: cat._id,
          }));
          setCategories(formattedCategories);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function checkVendorStatus() {
      if (!session?.user?.id) {
        setIsCheckingStatus(false);
        return;
      }

      try {
        const res = await checkVendorRequestStatus(session.user.id);

        if (res?.success && res?.request) {
          setExistingRequest(res.request);
        }
      } catch (err) {
        console.error("Failed to check vendor request status:", err);
      } finally {
        setIsCheckingStatus(false);
      }
    }

    checkVendorStatus();
  }, [session]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (!session?.user) {
      toast.error("Please login first to apply!");
      return;
    }

    if (!selectedCategory) {
      toast.error("Please select a shop category!");
      return;
    }

    const formData = new FormData(form);

    const shopName = formData.get("shopName")?.toString();
    const shopImage = formData.get("shopImage")?.toString();
    const phone = formData.get("phone")?.toString();

    try {
      setIsLoading(true);

      const payload = {
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name,
        userAvatar: session.user.image,
        shopName,
        shopImage: shopImage || undefined,
        category: selectedCategory,
        phone,
        status: "pending",
      };

      const result = await submitApplicationForVendor(payload);

      if (result?.success || result?.ok) {
        toast.success(
          result.message ||
            "Vendor request submitted successfully! Waiting for admin approval."
        );

        setExistingRequest(payload);
      } else {
        toast.error(result?.message || "Failed to submit request.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-sm text-gray-500">Checking application status...</p>
      </div>
    );
  }

  if (existingRequest) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border p-8 shadow-md bg-background text-center">
          
          {existingRequest.status === "approved" && (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 animate-bounce">
                <FaceFun className="h-10 w-10" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                Approved Partner
              </span>
              <h2 className="text-2xl font-bold text-foreground">
                Congratulations, {session?.user?.name || "Vendor"}! 🎉
              </h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Your application for{" "}
                <span className="font-semibold text-foreground">
                  "{existingRequest.shopName}"
                </span>{" "}
                has been approved by the admin. You are now an official Vendor!
              </p>

              <div className="mt-4 w-full">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 transition-all shadow-lg shadow-emerald-600/20"
                >
                  Go to Vendor Dashboard
                  <ArrowRight />
                </Link>
              </div>
            </>
          )}

          {existingRequest.status === "pending" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <Clock className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">Application Under Review</h2>
              <p className="text-sm text-gray-500">
                You have submitted a request for shop{" "}
                <span className="font-semibold text-foreground">
                  "{existingRequest.shopName}"
                </span>
                . Please wait for the admin to review and approve your application.
              </p>
            </>
          )}

          {existingRequest.status === "rejected" && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <Shield className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">Application Rejected</h2>
              <p className="text-sm text-gray-500">
                Unfortunately, your vendor application was not approved. Please contact support for more details.
              </p>
            </>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Form
        className="flex w-full max-w-md flex-col gap-4 rounded-xl border p-6 shadow-sm bg-background"
        onSubmit={onSubmit}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold">Apply to Become a Vendor</h2>
          <p className="text-sm text-gray-500 mt-1">
            Submit your shop details for admin review
          </p>
        </div>

        <TextField
          isRequired
          name="shopName"
          type="text"
          validate={(value) => (!value ? "Shop name is required" : null)}
        >
          <Label>Shop Name</Label>
          <InputGroup>
            <InputGroup.Input placeholder="My Awesome Store" />
          </InputGroup>
          <FieldError />
        </TextField>

        <Select
          className="w-full"
          placeholder="Select a department"
          selectedKey={selectedCategory || undefined}
          onSelectionChange={(key) =>
            setSelectedCategory(key?.toString() || "")
          }
        >
          <Label>Shop Department / Category</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>

          <Select.Popover>
            <ListBox>
              {categories.map((category) => (
                <ListBox.Item
                  id={category.value}
                  key={category.value}
                  textValue={category.label}
                >
                  {category.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <TextField
          isRequired
          name="shopImage"
          type="url"
          validate={(value) => {
            if (!value) return "Shop image URL is required";
            try {
              new URL(value);
              return null;
            } catch {
              return "Please enter a valid image URL";
            }
          }}
        >
          <Label>Shop Image / Logo URL</Label>
          <InputGroup>
            <InputGroup.Input placeholder="https://example.com/shop-logo.jpg" />
          </InputGroup>
          <FieldError />
        </TextField>

        <TextField
          isRequired
          name="phone"
          type="tel"
          minLength={11}
          maxLength={14}
          validate={(value) => {
            if (!value) return "Phone number is required";
            if (!/^[0-9+]{11,14}$/.test(value)) {
              return "Please enter a valid phone number";
            }
            return null;
          }}
        >
          <Label>Contact Number</Label>
          <InputGroup>
            <InputGroup.Input placeholder="017XXXXXXXX" />
          </InputGroup>
          <FieldError />
        </TextField>

        <Button
          className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-2"
          type="submit"
          isLoading={isLoading}
          isDisabled={isLoading}
        >
          {!isLoading && <Check />}
          Submit Application
        </Button>
      </Form>
    </div>
  );
}