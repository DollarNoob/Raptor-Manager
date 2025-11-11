import type { CSSProperties } from "react";
import { BUTTON_COLOR_THEMES, UI_STYLES } from "../../constants/ui";
import type { ButtonProps } from "../../types/button";

export default function Button(props: ButtonProps) {
    const { icon, onClick, children, className } = props;

    // default to 'default' if not specified
    const variant:
        | "default"
        | "modal"
        | "header"
        | "main"
        | "settings"
        | "status" =
        "variant" in props && props.variant ? props.variant : "default";
    const active = "active" in props ? props.active : false;
    const mainColor =
        "color" in props && variant === "main"
            ? (props.color as keyof typeof BUTTON_COLOR_THEMES.main)
            : undefined;
    const settingsColor =
        "color" in props && variant === "settings"
            ? (props.color as keyof typeof BUTTON_COLOR_THEMES.settings)
            : undefined;
    const statusColor =
        "color" in props && variant === "status"
            ? (props.color as keyof typeof BUTTON_COLOR_THEMES.status)
            : undefined;
    const cursor = "cursor" in props ? props.cursor : true;

    let style: CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: UI_STYLES.SPACING.TINY,
        width: children ? "fit-content" : UI_STYLES.DIMENSIONS.BUTTON_HEIGHT,
        minWidth: children ? "fit-content" : UI_STYLES.DIMENSIONS.BUTTON_HEIGHT,
        height: UI_STYLES.DIMENSIONS.BUTTON_HEIGHT,
        paddingLeft: children ? UI_STYLES.SPACING.SMALL : 0,
        paddingRight: children ? UI_STYLES.SPACING.SMALL : 0,
        border: `1px solid ${UI_STYLES.COLORS.BORDER}`,
        borderRadius: UI_STYLES.SPACING.MEDIUM,
        cursor: "pointer",
        outline: "none",
        fontFamily: UI_STYLES.TYPOGRAPHY.FONT_FAMILY_AVENIR,
        fontSize: UI_STYLES.TYPOGRAPHY.FONT_SIZE_NORMAL,
        fontWeight: UI_STYLES.TYPOGRAPHY.FONT_WEIGHT_NORMAL,
    };

    switch (variant) {
        case "header":
            style = {
                ...style,
                backgroundColor: BUTTON_COLOR_THEMES.header.background(
                    active as boolean,
                ),
            };
            break;
        case "main":
            if (mainColor) {
                style = {
                    ...style,
                    width: "100%",
                    height: 36,
                    backgroundColor: BUTTON_COLOR_THEMES.main[mainColor],
                    border: "2px solid #FFFFFF20",
                    cursor: cursor ? "pointer" : "default",
                };
            }
            break;
        case "settings":
            if (settingsColor) {
                style = {
                    ...style,
                    backgroundColor:
                        BUTTON_COLOR_THEMES.settings[settingsColor],
                    flex: 1,
                    height: 28,
                };
            }
            break;
        case "status":
            if (statusColor) {
                style = {
                    ...style,
                    backgroundColor: BUTTON_COLOR_THEMES.status[statusColor],
                    color: UI_STYLES.COLORS.TEXT_BRIGHT,
                    width: "fit-content",
                    minWidth: "fit-content",
                    height: "fit-content",
                    lineHeight: 1,
                    paddingLeft: 4,
                    paddingRight: 4,
                    paddingTop: 2,
                    paddingBottom: 2,
                };
            }
            break;
        default:
            style = {
                ...style,
                backgroundColor: BUTTON_COLOR_THEMES.default.background,
                color: BUTTON_COLOR_THEMES.default.text,
            };
            break;
    }

    // only for non-status buttons
    let textStyle: CSSProperties | undefined;
    if (variant !== "status" && children) {
        textStyle = {
            color:
                variant === "main" ? "white" : BUTTON_COLOR_THEMES.default.text,
            fontFamily: UI_STYLES.TYPOGRAPHY.FONT_FAMILY_AVENIR,
            fontSize:
                variant === "main" ? 18 : UI_STYLES.TYPOGRAPHY.FONT_SIZE_NORMAL,
            fontWeight: UI_STYLES.TYPOGRAPHY.FONT_WEIGHT_BOLD,
            marginTop: 1,
        };
    }

    if (variant === "main") {
        // Use div for main variant
        return (
            <div
                style={style}
                onClick={onClick as React.MouseEventHandler<HTMLDivElement>}
                className={className}
            >
                {icon}
                {children && textStyle && (
                    <span style={textStyle}>{children}</span>
                )}
            </div>
        );
    } else {
        // Use button for other variants
        return (
            <button
                type="button"
                style={style}
                onClick={onClick}
                className={className}
            >
                {icon}
                {children && textStyle && (
                    <span style={textStyle}>{children}</span>
                )}
                {children && !textStyle && children} {/* For status buttons */}
            </button>
        );
    }
}
