import React from "react";
import Title from "./Title";
import Text from "./Text";

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
            <div style={style}>
                <Title>{title}</Title>
                <Text>{text}</Text>
                {React.Children.count(children) !== 0 && (
                    <div style={buttonContainerStyle}>{children}</div>
                )}
            </div>
            <div style={blurStyle} />
        </>
    );
}
