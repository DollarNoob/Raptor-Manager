import type { IProfile } from "../../types";
import Note from "./Note";
import ProfileName from "./ProfileName";
import Username from "./Username";

interface Props {
    profile: IProfile;
    children?: React.ReactNode;
}

export default function Profile({ profile }: Props) {
    const style: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    };

    return (
            <div style={style}>
                <ProfileName>
                    {profile.name ?? `Profile: ${profile.id}`}
                </ProfileName>
                <Username
                    displayName={profile.displayName}
                    username={profile.username}
                />
                <Note lastPlayedAt={profile.lastPlayedAt}>{profile.note}</Note>
            </div>
    );
}
