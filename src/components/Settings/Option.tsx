import Button from "../Shared/Button";
import Text from "./Text";

interface Props {
    title?: string;
    onClick?: () => void;
    children?: React.ReactNode;
}

export default function Option({
    title,
    onClick,
    children,
}: Props) {
    const style: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: 1,
        height: "fit-content",
        padding: 12,
        border: "1px solid #FFFFFF20",
        borderRadius: 12,
        alignItems: "center",
    };

    const buttonContainerStyle: React.CSSProperties = {
        display: "flex",
        width: "100%",
        gap: 6,
        marginTop: 8,
    };

    return (
        <div style={style}>
            <Text>{title}</Text>
            <div style={buttonContainerStyle}>
                <Button
                    variant="settings"
                    color="blue"
                    onClick={onClick}
                >
                    {children}
                </Button>
            </div>
        </div>
    );
}
