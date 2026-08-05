import AboutUsSection from "@/components/pages/dashboard/adminDashboard/platform-management/cmsSetting/AboutUsSection";
import FAQSection from "@/components/pages/dashboard/adminDashboard/platform-management/cmsSetting/handleSubmitFAQ";
import PrivacyPolicySection from "@/components/pages/dashboard/adminDashboard/platform-management/cmsSetting/PrivacyPolicySection ";
import FooterInfoEditSection from "@/components/pages/dashboard/adminDashboard/platform-management/cmsSetting/theme/FooterInfoEditSection";

const page = () => {
  return (
    <div className="w-full bg-white">
      <h1 className="text-color-1c font-inter text-4xl font-medium leading-normal mb-[56px]">
        CMS settings
      </h1>
      <AboutUsSection />
      <FAQSection />
      <PrivacyPolicySection />
      <FooterInfoEditSection />
    </div>
  );
};

export default page;
