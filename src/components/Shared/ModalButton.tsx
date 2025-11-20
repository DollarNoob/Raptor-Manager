import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { UI_STYLES } from "../../constants/ui";
import type { IModalButtonProps } from "../../types/editProfileModal";

interface ExtendedModalButtonProps extends IModalButtonProps {
    as?: "button" | "div";
    [key: string]: any;
}

export default function ModalButton({
    icon,
    onClick,
    children,
    as = "button",
}: ExtendedModalButtonProps) {
    const style: CSSProperties = {
        display: "flex",
        flex: 1,
        gap: UI_STYLES.SPACING.TINY,
        width: children ? "fit-content" : UI_STYLES.DIMENSIONS.BUTTON_HEIGHT,
        minWidth: children ? "fit-content" : UI_STYLES.DIMENSIONS.BUTTON_HEIGHT,
        height: UI_STYLES.DIMENSIONS.BUTTON_HEIGHT,
        paddingLeft: children ? UI_STYLES.SPACING.SMALL : 0,
        paddingRight: children ? UI_STYLES.SPACING.SMALL : 0,
        backgroundColor: UI_STYLES.COLORS.BACKGROUND_MEDIUM,
        border: `1px solid ${UI_STYLES.COLORS.BORDER}`,
        borderRadius: UI_STYLES.SPACING.MEDIUM,
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    };

    const textStyle: CSSProperties = {
        color: UI_STYLES.COLORS.TEXT_BRIGHT,
        fontFamily: UI_STYLES.TYPOGRAPHY.FONT_FAMILY_AVENIR,
        fontSize: UI_STYLES.TYPOGRAPHY.FONT_SIZE_NORMAL,
        fontWeight: UI_STYLES.TYPOGRAPHY.FONT_WEIGHT_BOLD,
        marginTop: 1,
    };

    if (as === "button") {
        return (
            <motion.button
                type="button"
                style={style}
                onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
            >
                {icon}
                {children && <span style={textStyle}>{children}</span>}
            </motion.button>
        );
    } else {
        return (
            <motion.div
                style={style}
                onClick={onClick as React.MouseEventHandler<HTMLDivElement>}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
            >
                {icon}
                {children && <span style={textStyle}>{children}</span>}
            </motion.div>
        );
    }
}
