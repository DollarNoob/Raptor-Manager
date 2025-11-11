import type { CSSProperties } from "react";
import { UI_STYLES } from "../../constants/ui";
import type { TextProps } from "../../types/text";

export default function Text({
    variant = "text",
    children,
    className,
}: TextProps) {
    let style: CSSProperties;

    switch (variant) {
        case "title":
            style = {
                paddingLeft: UI_STYLES.SPACING.XLARGE,
                paddingRight: UI_STYLES.SPACING.XLARGE,
                color: UI_STYLES.COLORS.TEXT_BRIGHT,
                fontFamily: UI_STYLES.TYPOGRAPHY.FONT_FAMILY_AVENIR,
                fontSize: UI_STYLES.TYPOGRAPHY.FONT_SIZE_LARGE,
                fontWeight: UI_STYLES.TYPOGRAPHY.FONT_WEIGHT_BOLD,
                textAlign: "center",
            };
            break;
        case "settings":
            style = {
                paddingLeft: UI_STYLES.SPACING.XLARGE,
                paddingRight: UI_STYLES.SPACING.XLARGE,
                color: UI_STYLES.COLORS.TEXT_BRIGHT,
                fontFamily: UI_STYLES.TYPOGRAPHY.FONT_FAMILY_AVENIR,
                fontSize: UI_STYLES.TYPOGRAPHY.FONT_SIZE_LARGE,
                fontWeight: UI_STYLES.TYPOGRAPHY.FONT_WEIGHT_BOLD,
                textAlign: "center",
            };
            break;
        default:
            style = {
                paddingLeft: UI_STYLES.SPACING.XLARGE,
                paddingRight: UI_STYLES.SPACING.XLARGE,
                color: UI_STYLES.COLORS.TEXT_BRIGHT,
                fontFamily: UI_STYLES.TYPOGRAPHY.FONT_FAMILY_AVENIR,
                fontSize: UI_STYLES.TYPOGRAPHY.FONT_SIZE_NORMAL,
                fontWeight: UI_STYLES.TYPOGRAPHY.FONT_WEIGHT_NORMAL,
                textAlign: "center",
            };
            break;
    }

    return (
        <span style={style} className={className}>
            {children}
        </span>
    );
}
