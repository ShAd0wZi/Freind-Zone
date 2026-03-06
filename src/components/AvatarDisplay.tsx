interface AvatarDisplayProps {
  avatar: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  name?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-2xl",
  "2xl": "w-20 h-20 text-4xl",
};

export default function AvatarDisplay({ avatar, size = "md", name, className = "" }: AvatarDisplayProps) {
  // Check if avatar is a URL (custom image)
  const isCustom = avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("data:");
  
  if (isCustom) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg overflow-hidden border border-border flex-shrink-0 ${className}`}
        title={name}
      >
        <img
          src={avatar}
          alt={name || "avatar"}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Emoji avatar
  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center flex-shrink-0 ${className}`}
      title={name}
    >
      {avatar}
    </div>
  );
}
