import { useEffect, useImperativeHandle, useState } from "react";

interface Props {
    ref?: React.Ref<[string, React.Dispatch<React.SetStateAction<string>>]>;
    placeholder?: string;
    defaultValue?: string;
    children?: React.ReactNode;
}

export default function Input({ ref, placeholder, defaultValue }: Props) {
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

    const style: React.CSSProperties = {
        margin: "4px 0",
        padding: "4px 8px",
        backgroundColor: "oklch(0.4 0 0)",
        color: "oklch(0.9 0 0)",
        border: 0,
        borderRadius: 8,
        outline: 0,
        fontFamily: "Avenir",
        fontSize: 14,
        fontWeight: 500,
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
