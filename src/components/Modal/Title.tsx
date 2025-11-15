interface Props {
    children?: React.ReactNode;
}

export default function Title({ children }: Props) {
    const style: React.CSSProperties = {
        paddingLeft: 12,
        paddingRight: 12,
        color: "oklch(0.9 0 0)",
        fontFamily: "DM Sans",
        fontSize: 20,
        fontWeight: 700,
        textAlign: "center",
    };

    return <span style={style}>{children}</span>;
}
