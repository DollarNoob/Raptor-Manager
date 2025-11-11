import type { CSSProperties } from "react";
import { useEffect, useImperativeHandle, useState } from "react";
import { UI_STYLES } from "../../constants/ui";
import type { IModalInputProps } from "../../types/editProfileModal";

export default function Input({
    ref,
    placeholder,
    defaultValue,
}: IModalInputProps) {
    const [value, setValue] = useState("");

    useImperativeHandle(ref, () => {
        return [value, setValue] as [
            string,
            React.Dispatch<React.SetStateAction<string>>,
        ];
    }, [value]);

    useEffect(() => {
        setValue(defaultValue ?? "");
    }, [defaultValue]);

    const style: CSSProperties = {
        margin: `${UI_STYLES.SPACING.TINY}px 0`,
        padding: `4px ${UI_STYLES.SPACING.MEDIUM}px`,
        backgroundColor: UI_STYLES.COLORS.BACKGROUND_LIGHT,
        color: UI_STYLES.COLORS.TEXT_BRIGHT,
        border: 0,
        borderRadius: UI_STYLES.SPACING.MEDIUM,
        outline: 0,
        fontFamily: UI_STYLES.TYPOGRAPHY.FONT_FAMILY_AVENIR,
        fontSize: UI_STYLES.TYPOGRAPHY.FONT_SIZE_NORMAL,
        fontWeight: UI_STYLES.TYPOGRAPHY.FONT_WEIGHT_NORMAL,
    };

    return (
        <input
            style={style}
            placeholder={placeholder}
            value={value}
            onChange={(event) => setValue(event.target.value)}
        />
    );
}
