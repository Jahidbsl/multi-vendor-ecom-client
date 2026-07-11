"use client";

import { useState } from "react";
import { Check } from "@gravity-ui/icons";
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
const categories = [
  { label: "Fashion", value: "fashion" },
  { label: "Home & Living", value: "home_living" },
  { label: "Electronics", value: "electronics" },
  { label: "Beauty", value: "beauty" },
  { label: "Handmade", value: "handmade" },
  { label: "Groceries", value: "groceries" },
];

export function BecomeVendorRequestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { data: session } = authClient.useSession();

  const handleCategoryChange = (keys) => {
    const currentKey = Array.from(keys)[0];
    setSelectedCategory(currentKey?.toString() || "");
  };

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
            "Vendor request submitted successfully! Waiting for admin approval.",
        );

        form.reset();
        setSelectedCategory("");
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

        {/* Shop Name */}
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

        {/* Shop Category */}
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

        {/* Shop Image URL */}
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

        {/* Phone Number */}
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

        {/* Submit Button */}
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
