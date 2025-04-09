import pickle from "@/assets/picke1.png";
import Image from "next/image";

interface UserProfilePictureProps {
  photoUrl?: string;
  size: number;
}

export const UserProfilePicture = ({ photoUrl = "", size }: UserProfilePictureProps) => {
    return (
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <Image
          src={photoUrl || pickle}
          alt="User Profile"
          fill
          className="object-cover scale-110"
          sizes={`${size}px`}
        />
      </div>
    );
  };