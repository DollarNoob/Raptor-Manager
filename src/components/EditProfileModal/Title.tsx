import type { CSSProperties } from "react";
import { UI_STYLES } from "../../constants/ui";
import type { IModalTitleProps } from "../../types/editProfileModal";

export default function Title({ children }: IModalTitleProps) {
    const style: CSSProperties = {
        paddingLeft: UI_STYLES.SPACING.XLARGE,
        paddingRight: UI_STYLES.SPACING.XLARGE,
        color: UI_STYLES.COLORS.TEXT_BRIGHT,
        fontFamily: UI_STYLES.TYPOGRAPHY.FONT_FAMILY_AVENIR,
        fontSize: UI_STYLES.TYPOGRAPHY.FONT_SIZE_LARGE,
        fontWeight: UI_STYLES.TYPOGRAPHY.FONT_WEIGHT_BOLD,
        textAlign: "center",
    };

    return <span style={style}>{children}</span>;
}
