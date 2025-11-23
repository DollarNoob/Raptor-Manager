import { motion } from "motion/react";
import React from "react";
import Text from "./Text";
import Title from "./Title";

interface Props {
    title: string;
    text: string;
    children?: React.ReactNode;
    progress?: number;
    progressText?: string;
    isIndeterminate?: boolean;
}

export default function Modal({
    title,
    text,
    children,
    progress,
    progressText,
    isIndeterminate,
}: Props) {
    const lines = React.useMemo(
        () =>
            text.split("\n").map((line) => ({
                id: crypto.randomUUID(),
                content: line,
            })),
        [text],
    );

    const style: React.CSSProperties = {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        transformOrigin: "center",
        display: "flex",
        flexDirection: "column",
        minWidth: 240,
        padding: 12,
        backgroundColor: "oklch(0.24 0 0)",
        border: "1px solid #FFFFFF20",
        borderRadius: 12,
        zIndex: 2,
    };

    const buttonContainerStyle: React.CSSProperties = {
        display: "flex",
        gap: 8,
        marginTop: 8,
    };

    const blurStyle: React.CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backdropFilter: "blur(4px)",
        zIndex: 0,
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                transition={{ duration: 0.2 }}
                style={{
                    ...style,
                    top: "50%",
                    left: "50%",
                }}
            >
                <Title>{title}</Title>
                <Text>
                    {lines.map((line) => (
                        <React.Fragment key={line.id}>
                            {line.content}
                            <br />
                        </React.Fragment>
                    ))}
                </Text>
                {/* progress bar and info text */}
                {(progress !== undefined ||
                    progressText ||
                    isIndeterminate) && (
                    <div
                        style={{
                            marginTop: 12,
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "80%",
                                height: 6,
                                backgroundColor: "oklch(0.15 0 0)",
                                borderRadius: 3,
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    width: `${Math.min(100, Math.max(0, progress ?? 0))}%`,
                                    height: "100%",
                                    backgroundColor: "oklch(0.74 0.14 254)",
                                    transition: "width 0.3s ease",
                                }}
                            />
                        </div>
                        {progressText && (
                            <Text style={{ marginTop: 5 }}>{progressText}</Text>
                        )}
                    </div>
                )}
                {React.Children.count(children) !== 0 && (
                    <div style={buttonContainerStyle}>{children}</div>
                )}
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={blurStyle}
            />
        </>
    );
}
