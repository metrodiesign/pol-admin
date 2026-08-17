import Image from "next/image";
import { UPGRADE_ILLUSTRATION } from "@/lib/mock/file";

/** Dark upgrade plan card with illustration. */
export function FileUpgradeCard() {
  return (
    <div className="relative overflow-hidden rounded-card bg-grey-900 px-6 py-8 text-white">
      <h6 className="relative z-10 max-w-[150px] text-lg font-semibold leading-snug">
        Upgrade your plan and get more space
      </h6>
      <button
        type="button"
        className="relative z-10 mt-4 rounded-lg bg-warning px-3 py-1.5 text-sm font-bold text-[#1C252E] transition-colors duration-[250ms] hover:bg-warning-dark"
      >
        Upgrade plan
      </button>
      <Image
        src={UPGRADE_ILLUSTRATION}
        alt="Upgrade Illustration"
        width={160}
        height={160}
        className="absolute right-0 bottom-0 object-contain"
        unoptimized
      />
    </div>
  );
}
