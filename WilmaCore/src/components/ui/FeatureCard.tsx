import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
  iconClassName,
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-all duration-200 hover:border-[#5851ea]/20",
        className
      )}
    >
      <div
        className={cn(
          "w-12 h-12 bg-[#5851ea] bg-opacity-10 rounded-lg flex items-center justify-center mb-4",
          iconClassName
        )}
      >
        <Icon className="w-6 h-6 text-[#5851ea]" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;

