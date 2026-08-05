
import React from "react";
import clsx from "clsx"; 

interface TitleProps {
  children: React.ReactNode;
  className?: string;
}

const Subtitle: React.FC<TitleProps> = ({ children, className }) => {
  return (
    <p
      className={clsx(
        "text-[#808081] text-sm md:text-base font-normal tracking-wide font-poppins px-5",
        className
      )}
    >
      {children}
    </p>
  );
};

export default Subtitle;
