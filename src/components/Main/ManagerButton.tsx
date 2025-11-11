interface Props {
    active?: boolean;
    icon?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    children?: React.ReactNode;
}

export default function ManagerButton({
    active,
    icon,
    onClick,
    children,
}: Props) {
    const style: React.CSSProperties = {
        display: "flex",
        gap: 4,
        width: "fit-content",
        minWidth: 26,
        height: 26,
        paddingLeft: children ? 6 : 0,
        paddingRight: children ? 6 : 0,
        backgroundColor: "oklch(0.22 0 0)",
        border: "1px solid #FFFFFF20",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        cursor: active === false ? "default" : "pointer",
    };

    const textStyle: React.CSSProperties = {
        color: "oklch(0.9 0 0)",
        fontFamily: "Avenir",
        fontSize: 14,
        fontWeight: 700,
        marginTop: 1,
    };

    return (
        <div style={style} onClick={onClick}>
            {icon}
            {children && <span style={textStyle}>{children}</span>}
        </div>
    );
}
