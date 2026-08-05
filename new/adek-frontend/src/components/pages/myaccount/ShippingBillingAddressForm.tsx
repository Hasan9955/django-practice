"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateUserProfileMutation } from "@/redux/features/auth/authApi";
import { useGetMyProfileQuery } from "@/redux/features/auth/authApi";
import { Card, CardContent } from "@/components/ui/Card/Card";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { Label } from "@/components/ui/Label/label";
import { AddressSection } from "@/components/ui/address-section";
import { toast } from "sonner";


const formSchema = z
  .object({
    shippingAddress: z.string().min(1, "Shipping address is required."),
    sameAsShipping: z.boolean().default(false),
    billingAddress: z.string().optional(),

    // NEW FIELDS
    location: z.string().min(1, "Location is required."),
    deliveryAddress: z.string().min(1, "Delivery Address is required."),
    zipCode: z.string().min(1, "Zip Code is required."),
    city: z.string().min(1, "City is required."),
    state: z.string().min(1, "State is required."),
  })
  .superRefine((data, ctx) => {
    if (
      !data.sameAsShipping &&
      (!data.billingAddress || data.billingAddress.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing address is required if not same as shipping.",
        path: ["billingAddress"],
      });
    }
  });

type FormData = z.infer<typeof formSchema>;

export default function ShippingBillingAddressForm() {
  const { data: profileResponse, isLoading: isLoadingProfile } =
    useGetMyProfileQuery({});
  const userProfile = profileResponse?.result;

  const [updateAddress, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shippingAddress: "",
      sameAsShipping: false,
      billingAddress: "",
      location: "",
      deliveryAddress: "",
      zipCode: "",
      city: "",
      state: "",
    },
  });

  useEffect(() => {
    if (userProfile) {
      setValue("location", userProfile.location || "", {
        shouldValidate: true,
      });
      setValue("deliveryAddress", userProfile.deliveryAddress || "", {
        shouldValidate: true,
      });
      setValue("zipCode", userProfile.zipCode || "", { shouldValidate: true });
      setValue("city", userProfile.city || "", { shouldValidate: true });
      setValue("state", userProfile.state || "", { shouldValidate: true });
    }
  }, [userProfile, setValue]);

  const sameAsShipping = watch("sameAsShipping");
  const shippingAddress = watch("shippingAddress");

  // Copy shipping → billing
  useEffect(() => {
    if (sameAsShipping) {
      setValue("billingAddress", shippingAddress, { shouldValidate: true });
    }
  }, [sameAsShipping, shippingAddress, setValue]);


  const onSubmit = async (data: FormData) => {
    console.log("Form submitted:", data);

    const bodyData = {
      location: data.location,
      deliveryAddress: data.deliveryAddress,
      zipCode: data.zipCode,
      city: data.city,
      state: data.state,

      shippingAddress: data.shippingAddress,
      billingAddress: data.sameAsShipping
        ? data.shippingAddress
        : data.billingAddress,
    };

    console.log("Sending to API:", bodyData);

    const result = await updateAddress(bodyData);
    if (result) {
      toast.success("Address updated successfully!");
    } else {
      toast.error("Failed to update address. Please try again.");
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="mt-12 mb-24">
        <Card className="w-full">
          <CardContent className="p-6">
            <p className="text-center text-foreground/60">
              Loading profile information...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-24">
      <Card className="w-full border border-border shadow-sm">
        <CardContent className="p-8 space-y-8">
          <div className="space-y-2 border-b pb-6">
            <h2 className="text-2xl font-semibold text-foreground">
              Shipping & Billing Addresses
            </h2>
            <p className="text-sm text-foreground/60">
              Manage your shipping and billing addresses for orders
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Shipping Address */}
            <AddressSection
              title="Shipping Address"
              description="Add your preferred shipping zones"
              textareaId="shippingAddress"
              placeholder="Write your free shipping zone area"
              register={register("shippingAddress")}
              error={errors.shippingAddress}
              onUpdateClick={handleSubmit(onSubmit)}
              isSubmitting={isSubmitting}
            />

            {/* Billing Address */}
            <AddressSection
              title="Billing Address"
              description="Add your preferred billing address"
              textareaId="billingAddress"
              placeholder="Write your billing address"
              register={register("billingAddress")}
              error={errors.billingAddress}
              disabled={sameAsShipping}
              onUpdateClick={handleSubmit(onSubmit)}
              isSubmitting={isSubmitting}
            />

            {/* NEW FIELDS BELOW */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Personal Address Information
              </h3>
              <div className="space-y-6">
                <AddressSection
                  title="Location"
                  description="Enter your location"
                  textareaId="location"
                  placeholder="e.g., Bonosree, Dhaka"
                  register={register("location")}
                  error={errors.location}
                />

                <AddressSection
                  title="Delivery Address"
                  description="Add delivery address"
                  textareaId="deliveryAddress"
                  placeholder="e.g., Ramputa, Banasree, Block-D"
                  register={register("deliveryAddress")}
                  error={errors.deliveryAddress}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AddressSection
                    title="Zip Code"
                    description="Enter zip code"
                    textareaId="zipCode"
                    placeholder="1207"
                    register={register("zipCode")}
                    error={errors.zipCode}
                  />

                  <AddressSection
                    title="City"
                    description="Enter city name"
                    textareaId="city"
                    placeholder="Dhaka"
                    register={register("city")}
                    error={errors.city}
                  />

                  <AddressSection
                    title="State"
                    description="Enter state name"
                    textareaId="state"
                    placeholder="Bangladesh"
                    register={register("state")}
                    error={errors.state}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-background/50 p-4 rounded-lg border border-border">
              <Checkbox
                id="same-as-shipping"
                checked={sameAsShipping}
                onCheckedChange={(checked) =>
                  setValue("sameAsShipping", !!checked)
                }
              />
              <Label
                htmlFor="same-as-shipping"
                className="text-sm font-medium cursor-pointer text-foreground"
              >
                Use same address for billing
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                className="px-6 py-2.5 bg-background border border-border text-foreground font-medium rounded-lg hover:bg-background/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUpdating}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting || isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
