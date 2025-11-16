import { motion } from "motion/react";
import React from "react";
import Text from "./Text";
import Title from "./Title";

interface Props {
    title: string;
    text: string;
    children?: React.ReactNode;
}

export default function Modal({ title, text, children }: Props) {
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
                    {
                        text.split("\n")
                            .map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)
                    }
                </Text>
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
