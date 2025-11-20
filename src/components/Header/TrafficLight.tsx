import { useState } from "react";

interface Props {
    color: "red" | "yellow";
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    children?: React.ReactNode;
}

export default function TrafficLight({ color, onClick, children }: Props) {
    const [active, setActive] = useState(false);

    const colors = {
        red: {
            normal: "#EC6765",
            normalBorder: "#E24B41",
            active: "#C45554",
            activeBorder: "#A14239",
        },
        yellow: {
            normal: "#F2CA44",
            normalBorder: "#E1A73E",
            active: "#C9A738",
            activeBorder: "#A67F36",
        },
    };

    const style: React.CSSProperties = {
        width: 12,
        height: 12,
        backgroundColor: active ? colors[color].active : colors[color].normal,
        border:
            "1px solid " +
            (active ? colors[color].activeBorder : colors[color].normalBorder),
        borderRadius: "50%",
    };

    return (
        <div
            style={style}
            onClick={onClick}
            onMouseDown={() => setActive(true)}
            onMouseUp={() => setActive(false)}
            onMouseLeave={() => setActive(false)}
        >
            {children}
        </div>
    );
}
