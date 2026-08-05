/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card/Card";
import {
  useUpdatePlatformMutation,
} from "@/redux/features/dashborad/platform/platformManagementApi";
import { toast } from "sonner";

interface LogoSettingsProps {
  preview: string;
  setPreview: React.Dispatch<React.SetStateAction<string>>;
  validateFile: (file: File | null) => boolean;
}

const LogoSettings: React.FC<LogoSettingsProps> = ({ preview, setPreview, validateFile }) => {
  const [updatePlatform] = useUpdatePlatformMutation();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    try {
      const formData = new FormData();
      formData.append("logo", file);
      await updatePlatform(formData).unwrap();
      setPreview(URL.createObjectURL(file));
      toast.success("Logo updated successfully!");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update logo");
    }
  };

  return (
    <Card className="mb-10">
      <CardHeader>
        <h2 className="text-2xl font-medium mb-3">Default Logo</h2>
        <p className="text-gray-500">Add your preferred logo for platform</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted rounded-lg overflow-hidden flex items-start justify-start h-40">
          <Image src={preview} alt="Logo Preview" width={320} height={160} className="object-contain h-full w-auto" />
        </div>
        <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
          + Change logo
        </Button>
        <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
      </CardContent>
    </Card>
  );
};

export default LogoSettings;