import type { CSSProperties } from "react";
import { useEffect, useImperativeHandle, useState } from "react";
import { UI_STYLES } from "../../constants/ui";

interface InputProps {
    ref?: React.Ref<[string, React.Dispatch<React.SetStateAction<string>>]>;
    placeholder?: string;
    defaultValue?: string;
    children?: React.ReactNode;
    className?: string;
}

export default function Input({
    ref,
    placeholder,
    defaultValue,
    className,
}: InputProps) {
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
            className={className}
            placeholder={placeholder}
            value={value}
            onChange={(event) => setValue(event.target.value)}
        />
    );
}
