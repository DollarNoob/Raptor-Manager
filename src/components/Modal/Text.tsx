interface Props {
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

export default function Text({ children, style: customStyle }: Props) {
    const defaultStyle: React.CSSProperties = {
        paddingLeft: 12,
        paddingRight: 12,
        color: "oklch(0.9 0 0)",
        fontFamily: "TASA Explorer",
        fontSize: 14,
        fontWeight: 500,
        textAlign: "center",
    };

    const combinedStyle = customStyle
        ? { ...defaultStyle, ...customStyle }
        : defaultStyle;

    return <span style={combinedStyle}>{children}</span>;
}
