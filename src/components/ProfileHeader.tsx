import { MapPin, User } from "lucide-react";

type Profile = {
  username: string;
  location?: string;
  bio?: string;
};

interface ProfileHeaderProps {
  profile?: Profile;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const username = profile?.username ?? "Usuario";
  const initial = username.trim().charAt(0)?.toUpperCase() ?? "U";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background-card p-6">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-semibold">
          {profile.username ? (
            <span>{initial}</span>
          ) : (
            <User className="h-6 w-6" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-text-main">
            {username}
          </h2>
          {profile?.location && (
            <div className="mt-1 flex items-center gap-2 text-sm text-text-muted">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>
      {profile?.bio && (
        <p className="text-sm text-text-muted leading-relaxed">{profile.bio}</p>
      )}
    </div>
  );
};

export default ProfileHeader;
