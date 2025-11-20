import { motion } from "motion/react";
import { useState } from "react";
import CloseIcon from "../icons/CloseIcon";
import MinimizeIcon from "../icons/MinimizeIcon";

interface Props {
    color: "red" | "yellow";
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    children?: React.ReactNode;
}

export default function TrafficLight({ color, onClick, children }: Props) {
    const [active, setActive] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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
        <motion.div
            style={{
                ...style,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            onClick={onClick}
            onMouseDown={() => setActive(true)}
            onMouseUp={() => setActive(false)}
            onMouseLeave={() => {
                setActive(false);
                setIsHovered(false);
            }}
            onMouseEnter={() => setIsHovered(true)}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
        >
            {isHovered && color === "red" && <CloseIcon />}
            {isHovered && color === "yellow" && <MinimizeIcon />}
            {children}
        </motion.div>
    );
}
