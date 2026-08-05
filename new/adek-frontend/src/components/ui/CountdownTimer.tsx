import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  discountStartDate: string;
  discountEndTime: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  discountStartDate,
  discountEndTime,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [status, setStatus] = useState<"notStarted" | "active" | "ended">(
    "notStarted"
  );

  useEffect(() => {
    const startTime = new Date(discountStartDate).getTime();
    const endTime = new Date(discountEndTime).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();

      if (now < startTime) {
        setStatus("notStarted");
        return;
      } else if (now > endTime) {
        setStatus("ended");
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      } else {
        setStatus("active");
      }

      const diff = endTime - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [discountStartDate, discountEndTime]);

  return (
    <div className="flex justify-between items-center flex-wrap gap-1 py-2.5 pl-3 pr-6 bg-[#FDEFEE] border-[1px] border-[#F8CCCC] rounded-[4px] mt-2 sm:mt-6">
      {status === "notStarted" && (
        <h5 className="lg:text-xl text-xs sm:text-base text-[#FF0606]">
          Offer not started yet
        </h5>
      )}

      {status === "ended" && (
        <h5 className="lg:text-xl text-xs sm:text-base text-[#FF0606]">
          Offer ended
        </h5>
      )}

      {status === "active" && (
        <>
          <h5 className="lg:text-xl text-xs sm:text-base text-[#FF0606]">
            Hurry up! Offer ends in:
          </h5>
          <p className="lg:text-[20px] text-sm sm:text-lg text-[#FF0606] font-jos font-semibold">
            <span>{String(timeLeft.days).padStart(2, "0")}</span>:
            <span>{String(timeLeft.hours).padStart(2, "0")}</span>:
            <span>{String(timeLeft.minutes).padStart(2, "0")}</span>:
            <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
          </p>
        </>
      )}
    </div>
  );
};

export default CountdownTimer;
