interface Props {
    children?: React.ReactNode;
}

export default function StaticInfo(_props: Props) {
    const style: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        width: 260,
        padding: 10,
        backgroundColor: "oklch(0.22 0 0)",
        border: "1px solid #FFFFFF20",
        borderRadius: 12,
        justifyContent: "space-between",
    };

    const textStyle: React.CSSProperties = {
        color: "oklch(0.9 0 0)",
        fontFamily: "Avenir",
        fontSize: 13,
        fontWeight: 500,
        textAlign: "center",
    };

    return (
        <div style={style}>
            <span style={textStyle}>Raptor Manager is currently on BETA!</span>
            <span style={textStyle}>
                Expect random changes and improvements.
            </span>
            <span style={textStyle}>
                Vanilla and Hydrogen are supported, however they are not fully
                tested. If you experience any bugs please report them!
            </span>
            <span style={textStyle}>
                It is normal for Hydrogen to use the port 6969 across all
                instances. It is Hydrogen not supporting multi instance
                execution properly, not us. This is not what I can fix.
            </span>
        </div>
    );
}
