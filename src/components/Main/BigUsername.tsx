interface Props {
    displayName: string;
    username: string;
    children?: React.ReactNode;
}

export default function BigUsername({ displayName, username }: Props) {
    const style: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    };

    const displayNameStyle: React.CSSProperties = {
        color: "oklch(0.9 0 0)",
        fontFamily: "Avenir",
        fontSize: 16,
        fontWeight: 700,
        textAlign: "center",
        wordBreak: "break-all",
    };

    const usernameStyle: React.CSSProperties = {
        color: "oklch(0.9 0 0)",
        fontFamily: "Avenir",
        fontSize: 12,
        fontWeight: 500,
    };

    return (
        <div style={style}>
            <span style={displayNameStyle}>{displayName}</span>
            <span style={usernameStyle}>@{username}</span>
        </div>
    );
}
