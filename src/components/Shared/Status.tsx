import { STATUS_COLORS, UI_STYLES } from "../../constants/ui";

interface Props {
    color: keyof typeof STATUS_COLORS;
    draggable?: boolean;
    children?: React.ReactNode;
}

export default function Status({ color, draggable, children }: Props) {
    const style: React.CSSProperties = {
        width: "fit-content",
        minWidth: "fit-content",
        height: "fit-content",
        lineHeight: 1,
        backgroundColor: STATUS_COLORS[color],
        color: UI_STYLES.COLORS.TEXT_BRIGHT,
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 2,
        paddingBottom: 1,
        border: `1px solid ${UI_STYLES.COLORS.BORDER}`,
        borderRadius: 20,
        fontFamily: UI_STYLES.TYPOGRAPHY.FONT_FAMILY_AVENIR,
        fontSize: 10,
        fontWeight: UI_STYLES.TYPOGRAPHY.FONT_WEIGHT_NORMAL,
    };

    return (
        <div style={style} data-tauri-drag-region={draggable}>
            {children}
        </div>
    );
}
