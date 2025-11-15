interface Props {
    children?: React.ReactNode;
}

export default function ProfileName({ children }: Props) {
    const style: React.CSSProperties = {
        color: "oklch(0.6 0 0)",
        fontFamily: "DM Sans",
        fontSize: 9,
        fontWeight: 500,
        textAlign: "start",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
    };

    return <span style={style}>{children}</span>;
}
