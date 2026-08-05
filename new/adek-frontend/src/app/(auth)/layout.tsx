import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <div className="bg-[#F3F4F8]">{children}</div>
    </div>
  );
};

export default layout;
