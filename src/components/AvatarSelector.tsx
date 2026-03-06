import { useState } from "react";
import { defaultAvatarEmojis } from "@/lib/avatarUtils";
import AvatarDisplay from "./AvatarDisplay";

interface AvatarSelectorProps {
  onSelectAvatar: (avatar: string) => void;
  selectedAvatar: string;
  allowCustom?: boolean;
}

export default function AvatarSelector({ onSelectAvatar, selectedAvatar, allowCustom = false }: AvatarSelectorProps) {
  const [uploadedAvatars, setUploadedAvatars] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to data URL for now (you can replace with URL storage later)
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedAvatars([...uploadedAvatars, dataUrl]);
      onSelectAvatar(dataUrl);
      setShowUpload(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs uppercase tracking-widest text-muted-foreground">
        Choose Avatar
      </label>
      
      <div className="flex flex-wrap gap-3">
        {/* Default emoji avatars */}
        {defaultAvatarEmojis.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectAvatar(option.displayValue)}
            title={option.label}
            className={`rounded-lg p-3 transition-all ${
              selectedAvatar === option.displayValue
                ? "bg-primary/20 ring-2 ring-primary"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <AvatarDisplay avatar={option.displayValue} size="lg" />
          </button>
        ))}

        {/* Custom uploaded avatars */}
        {uploadedAvatars.map((avatar, idx) => (
          <button
            key={`custom-${idx}`}
            onClick={() => onSelectAvatar(avatar)}
            className={`rounded-lg p-3 transition-all ${
              selectedAvatar === avatar
                ? "bg-primary/20 ring-2 ring-primary"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            <AvatarDisplay avatar={avatar} size="lg" />
          </button>
        ))}

        {/* Upload custom avatar button */}
        {allowCustom && (
          <div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="rounded-lg border-2 border-dashed border-muted-foreground/40 p-3 transition-all hover:border-primary hover:bg-primary/5"
            >
              <span className="text-2xl">+</span>
            </button>
            
            {showUpload && (
              <div className="absolute z-10 mt-2 rounded-lg border border-border bg-card p-4 shadow-lg">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Upload Custom Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
