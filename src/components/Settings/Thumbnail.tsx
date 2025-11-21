import { openUrl } from "@tauri-apps/plugin-opener";

interface Props {
    thumbnail: string;
    size: number;
    href?: string;
    children?: React.ReactNode;
}

export default function Thumbnail({ thumbnail, size, href }: Props) {
    const style: React.CSSProperties = {
        width: size,
        minWidth: size,
        height: size,
        minHeight: size,
        borderRadius: 12,
        border: "1px solid #FFFFFF20",
        cursor: href ? "pointer" : "default",
    };

    return (
        <img
            src={thumbnail}
            style={style}
            draggable={false}
            alt="Thumbnail"
            onClick={() => {
                href && openUrl(href);
            }}
        />
    );
}
