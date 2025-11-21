import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { UI_STYLES } from "../../constants/ui";
import type { IModalOptionProps } from "../../types/editProfileModal";

export default function Option({
    settings,
    name,
    children,
}: IModalOptionProps) {
    const [value, setValue] = useState(false);

    useEffect(() => {
        setValue(settings[0]?.[name] ?? false);
    }, [settings[0]?.[name]]);

    useEffect(() => {
        if (!settings[0] || !settings[1]) return;
        const newSettings = {
            ...settings[0],
            [name]: value,
        };
        settings[1](newSettings);
    }, [value]);

    const style: CSSProperties = {
        display: "flex",
        minWidth: "max-content",
        padding: `2px ${UI_STYLES.SPACING.TINY}px`,
        backgroundColor: UI_STYLES.COLORS.BACKGROUND_MEDIUM,
        color: UI_STYLES.COLORS.TEXT_BRIGHT,
        border: "1px solid " + UI_STYLES.COLORS.BORDER,
        borderRadius: UI_STYLES.SPACING.MEDIUM,
        outline: 0,
        gap: UI_STYLES.SPACING.TINY,
        fontFamily: UI_STYLES.TYPOGRAPHY.FONT_FAMILY_AVENIR,
        fontSize: UI_STYLES.TYPOGRAPHY.FONT_SIZE_SMALL,
        fontWeight: UI_STYLES.TYPOGRAPHY.FONT_WEIGHT_NORMAL,
        alignItems: "center",
    };

    return (
        <label style={style}>
            <input
                type="checkbox"
                checked={value}
                onChange={(event) => setValue(event.target.checked)}
            />
            {children}
        </label>
    );
}
