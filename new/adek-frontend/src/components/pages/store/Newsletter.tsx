/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { Form, Input } from "antd";
import SubscribImage1 from "@/assets/images/store/image 2.png";
import SubscribImage2 from "@/assets/images/store/image 3.png";
import { Button } from "@/components/ui/Button/Button";
import MainTitle from "@/components/shared/MainTitle/MainTitle";
import Subtitle from "@/components/shared/Subtitle/Subtitle";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useSubscribeStoreMutation } from "@/redux/features/storeapi/storeApi";
import { usePathname } from "next/navigation";

const Subscribe = () => {
  const [subscribeStore, { isLoading }] = useSubscribeStoreMutation();
  const [form] = Form.useForm();
  const path = usePathname();
  const storeId = path?.split("/")[2]; 

  const handleSubmit = async (values: { email: string }) => {
    const toastId = toast.loading("Subscribing...");

    const payload = {
      storeId: storeId,
      userEmail: values.email,
    };

    try {
      const response = await subscribeStore(payload).unwrap();
      toast.dismiss(toastId);

      if (response?.success) {
        Swal.fire({
          title: "Subscribed!",
          text: "Thank you for subscribing to our store updates.",
          icon: "success",
          confirmButtonColor: "#004899",
        });
        form.resetFields();
      } else {
        toast.error("Failed to subscribe!", { id: toastId });
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      const errorMessage =
        error?.data?.message ||
        error?.data?.errorMessages?.[0]?.message ||
        "Something went wrong while subscribing.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col justify-between bg-[#F6F6F6] mx-10 lg:mx-20 md:mx-10">
      <div className="flex items-center justify-center py-6 mx-auto gap-5">
        {/* Left image */}
        <div className="hidden md:block">
          <Image
            src={SubscribImage1}
            alt="Model Left"
            width={300}
            height={600}
          />
        </div>

        {/* Center form */}
        <div className="text-center md:max-w-xl mx-auto">
          <div className="space-y-3 mb-5 md:mb-7">
            <MainTitle>Subscribe To Our Newsletter</MainTitle>
            <Subtitle>
              Stay in the loop with the latest news, offers, and updates!
              Subscribe to our store and never miss an exciting announcement.
            </Subtitle>
          </div>

          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter a valid email!",
                },
              ]}
              className="drop-shadow-lg"
            >
              <Input
                placeholder="something@example.com"
                className="border-none rounded-sm py-4 px-5"
              />
            </Form.Item>

            <div className="mt-5 lg:mt-8">
              <Button
                size="default"
                className="bg-[#004899] text-[#FBFCFD] font-normal text-sm md:text-base"
                type="submit"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </Form>
        </div>

        {/* Right image */}
        <div className="hidden md:block">
          <Image
            src={SubscribImage2}
            alt="Model Right"
            width={300}
            height={600}
          />
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
