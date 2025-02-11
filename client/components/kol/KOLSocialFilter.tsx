import { Checkbox } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/16/solid";
import { KOLSocialFilter as KOLSocialFilterType } from "@/types/kol";

interface KOLSocialFilterProps {
  value: KOLSocialFilterType;
  onChange: (value: KOLSocialFilterType) => void;
}

const socialOptions = [
  { value: "telegram", label: "텔레그램", icon: "/icons/telegram.svg" },
  { value: "youtube", label: "유튜브", icon: "/icons/youtube.svg" },
  { value: "x", label: "X (트위터)", icon: "/icons/x.svg" },
] as const;

export default function KOLSocialFilter({
  value,
  onChange,
}: KOLSocialFilterProps) {
  const handleChange = (social: "telegram" | "youtube" | "x") => {
    const newValue = value.includes(social)
      ? value.filter((v) => v !== social)
      : [...value, social];
    onChange(newValue);
  };

  return (
    <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        필터:
      </span>
      <div className="flex gap-3">
        {socialOptions.map((option) => (
          <Checkbox
            key={option.value}
            checked={value.includes(option.value)}
            onChange={() => handleChange(option.value)}
            className="group relative flex items-center"
          >
            {({ checked }) => (
              <>
                <div
                  className={`
                    flex h-8 items-center gap-2 rounded-lg px-3 
                    ${
                      checked
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }
                    transition-colors duration-200
                    hover:bg-opacity-90
                    cursor-pointer
                  `}
                >
                  <div className="relative size-4">
                    <img
                      src={option.icon}
                      alt=""
                      className={`size-4 ${
                        checked ? "brightness-0 invert" : ""
                      }`}
                    />
                    {checked && (
                      <CheckIcon className="absolute -right-1 -top-1 size-2.5 text-white bg-blue-600 rounded-full p-0.5" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </>
            )}
          </Checkbox>
        ))}
      </div>
    </div>
  );
}
