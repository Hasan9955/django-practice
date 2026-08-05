import CommissionSection from "./ General-settings/CommissionSection";
import CurrencySection from "./ General-settings/CurrencySection";
import ShippingPolicySection from "./ General-settings/ShippingPolicySection";

const SettingsPage = () => {
  return (
    <div className="w-full p-6">
      <h2 className="text-[#1C1C1C] font-medium text-2xl leading-normal mb-8">
        General settings
      </h2>

      <div className="flex flex-col gap-12">
        <CurrencySection />
        <CommissionSection />
        <ShippingPolicySection />
      </div>
    </div>
  );
};

export default SettingsPage;
