interface Props {
    lastPlayedAt: number;
    children?: React.ReactNode;
}

export default function Note({ lastPlayedAt, children }: Props) {
    const style: React.CSSProperties = {
        color: "oklch(0.6 0 0)",
        fontFamily: "DM Sans",
        fontSize: 10,
        fontWeight: 500,
        textAlign: "start",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
    };

    const date = new Date(lastPlayedAt);
    let dateText = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
    const timeText = `${(date.getHours() % 12 || 12).toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    dateText += ` ${timeText}`;
    dateText += ` ${date.getHours() < 12 ? "AM" : "PM"}`;

    return (
        <span style={style}>
            {dateText} | {children}
        </span>
    );
}
