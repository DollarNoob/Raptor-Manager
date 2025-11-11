interface Props {
    displayName: string;
    username: string;
    children?: React.ReactNode;
}

export default function Username({ displayName, username }: Props) {
    const style: React.CSSProperties = {
        color: "oklch(0.9 0 0)",
        fontFamily: "Avenir",
        fontSize: 16,
        fontWeight: 700,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
    };

    return (
            <span style={style}>
                {displayName} (@{username})
            </span>
    );
}
