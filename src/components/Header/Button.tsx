interface Props {
    active?: boolean;
    icon?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    children?: React.ReactNode;
}

export default function Button({ active, icon, onClick, children }: Props) {
    const style: React.CSSProperties = {
        display: "flex",
        gap: 4,
        width: children ? "fit-content" : 30,
        minWidth: children ? "fit-content" : 30,
        height: 30,
        paddingLeft: children ? 6 : 0,
        paddingRight: children ? 6 : 0,
        backgroundColor: active ? "oklch(0.64 0.18 260)" : "oklch(0.24 0 0)",
        border: "1px solid #FFFFFF20",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    };

    const textStyle: React.CSSProperties = {
        color: "oklch(0.9 0 0)",
        fontFamily: "Avenir",
        fontSize: 14,
        fontWeight: 700,
        marginTop: 1,
    };

    return (
        <button type="button" style={style} onClick={onClick}>
            {icon}
            {children && <span style={textStyle}>{children}</span>}
        </button>
    );
}
