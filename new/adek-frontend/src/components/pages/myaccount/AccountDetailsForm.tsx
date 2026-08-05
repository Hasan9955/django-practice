/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card/Card";
import { Label } from "@/components/ui/Label/label";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";
import {
  useGetMyProfileQuery,
  useUpdatePasswordMutation,
  useUpdateUserProfileMutation,
} from "@/redux/features/auth/authApi";
import { useState } from "react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { Eye, EyeOff } from "lucide-react";
import { set } from "date-fns";

// Profile form schema
const profileFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  location: z.string().min(1, "Location is required."),
  email: z
    .string()
    .email("Invalid email address.")
    .min(1, "Email address is required."),
  profileImage: z.any().optional(),
});

// Password form schema
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character."
      ),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileFormSchema>;
type PasswordFormData = z.infer<typeof passwordFormSchema>;

export default function AccountDetailsForm() {
  const [updateUserProfile, { isLoading: isUpdatingProfile }] =
    useUpdateUserProfileMutation();
  const [updatePassword, { isLoading: isUpdatingPassword }] =
    useUpdatePasswordMutation();
  const { data: profileData } = useGetMyProfileQuery({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const userData = profileData?.result || {};
  const dispatch = useAppDispatch();
  console.log(userData);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: userData?.fullName,
      location: userData?.location,
      email: userData?.email,
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("location", data.location);
      formData.append("email", data.email);

      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      await updateUserProfile(formData).unwrap();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    console.log(data);
    try {
      await updatePassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success("Password updated successfully!");
      resetPasswordForm();
      setShowPasswordForm(false);
      dispatch(logout());
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (error) {
      console.error("Failed to update password:", error);
      toast.error("Failed to update password. Please try again.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  return (
    <div className="w-full lg:px-8">
      <Card className="w-full max-w-4xl mx-auto mt-6 sm:mt-8 lg:mt-12 mb-12 sm:mb-16 lg:mb-24">
        <CardContent className="p-4 sm:p-6 space-y-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-xl sm:text-2xl font-semibold">
              Account details
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-500">
              Update your account details or change your password
            </CardDescription>
          </CardHeader>

          {/* Profile Form */}
          <form
            onSubmit={handleProfileSubmit(onProfileSubmit)}
            className="space-y-4 sm:space-y-6"
          >
            {/* Full Name */}
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-sm sm:text-base font-medium"
              >
                Full name
              </Label>
              <Input
                id="fullName"
                placeholder="Your full name"
                className={cn(
                  "text-sm sm:text-base",
                  profileErrors.fullName &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
                {...registerProfile("fullName")}
                aria-invalid={profileErrors.fullName ? "true" : "false"}
              />
              {profileErrors.fullName && (
                <p className="text-xs sm:text-sm text-red-500" role="alert">
                  {profileErrors.fullName.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-sm sm:text-base font-medium"
              >
                Location
              </Label>
              <Input
                id="location"
                placeholder="Your location"
                className={cn(
                  "text-sm sm:text-base",
                  profileErrors.location &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
                {...registerProfile("location")}
                aria-invalid={profileErrors.location ? "true" : "false"}
              />
              {profileErrors.location && (
                <p className="text-xs sm:text-sm text-red-500" role="alert">
                  {profileErrors.location.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm sm:text-base font-medium"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                className={cn(
                  "text-sm sm:text-base",
                  profileErrors.email &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
                {...registerProfile("email")}
                aria-invalid={profileErrors.email ? "true" : "false"}
              />
              {profileErrors.email && (
                <p className="text-xs sm:text-sm text-red-500" role="alert">
                  {profileErrors.email.message}
                </p>
              )}
            </div>

            {/* Profile Image */}
            <div className="space-y-2">
              <Label
                htmlFor="profileImage"
                className="text-sm sm:text-base font-medium"
              >
                Profile Image
              </Label>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm sm:text-base flex items-start justify-start "
              />
              {selectedImage && (
                <p className="text-xs sm:text-sm text-gray-600">
                  Selected: {selectedImage.name}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto text-sm sm:text-base bg-blue-primary px-6 py-2"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Updating..." : "Update Profile"}
            </Button>
          </form>

          {/* Password Section */}
          <div className="pt-4 sm:pt-6 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-medium">Password</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {showPasswordForm
                    ? "Update your password"
                    : "Change your account password"}
                </p>
              </div>
              {!showPasswordForm && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  Change Password
                </Button>
              )}
            </div>

            {showPasswordForm && (
              <form
                onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                className="space-y-4 sm:space-y-6"
              >
                {/* Current Password */}
                <div className="space-y-2 relative">
                  <Label
                    htmlFor="currentPassword"
                    className="text-sm sm:text-base font-medium"
                  >
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      placeholder="Enter current password"
                      className={cn(
                        "text-sm sm:text-base pr-10",
                        passwordErrors.currentPassword &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
                      {...registerPassword("currentPassword")}
                      aria-invalid={
                        passwordErrors.currentPassword ? "true" : "false"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    >
                      {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-xs sm:text-sm text-red-500" role="alert">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2 relative">
                  <Label
                    htmlFor="newPassword"
                    className="text-sm sm:text-base font-medium"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      placeholder="Enter new password"
                      className={cn(
                        "text-sm sm:text-base pr-10",
                        passwordErrors.newPassword &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
                      {...registerPassword("newPassword")}
                      aria-invalid={
                        passwordErrors.newPassword ? "true" : "false"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    >
                      {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-xs sm:text-sm text-red-500" role="alert">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2 relative">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm sm:text-base font-medium"
                  >
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      className={cn(
                        "text-sm sm:text-base pr-10",
                        passwordErrors.confirmPassword &&
                          "border-red-500 focus-visible:ring-red-500"
                      )}
                      {...registerPassword("confirmPassword")}
                      aria-invalid={
                        passwordErrors.confirmPassword ? "true" : "false"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs sm:text-sm text-red-500" role="alert">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto text-sm bg-blue-primary sm:text-base px-6 py-2"
                  >
                    Update Password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordForm(false);
                      resetPasswordForm();
                    }}
                    className="w-full sm:w-auto text-sm sm:text-base px-6 py-2"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
