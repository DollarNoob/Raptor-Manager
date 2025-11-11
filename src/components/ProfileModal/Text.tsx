import type { CSSProperties } from "react";
import { UI_STYLES } from "../../constants/ui";

interface Props {
    children?: React.ReactNode;
}

export default function Text({ children }: Props) {
    const style: CSSProperties = {
        paddingLeft: UI_STYLES.SPACING.XLARGE,
        paddingRight: UI_STYLES.SPACING.XLARGE,
        color: UI_STYLES.COLORS.TEXT_BRIGHT,
        fontFamily: UI_STYLES.TYPOGRAPHY.FONT_FAMILY_AVENIR,
        fontSize: UI_STYLES.TYPOGRAPHY.FONT_SIZE_NORMAL,
        fontWeight: UI_STYLES.TYPOGRAPHY.FONT_WEIGHT_NORMAL,
        textAlign: "center",
    };

    return <span style={style}>{children}</span>;
}
