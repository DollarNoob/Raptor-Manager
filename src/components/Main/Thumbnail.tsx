interface Props {
    thumbnail: string;
    size: number;
    children?: React.ReactNode;
}

export default function Thumbnail({ thumbnail, size }: Props) {
    const style: React.CSSProperties = {
        width: size,
        minWidth: size,
        height: size,
        minHeight: size,
        borderRadius: 4,
    };

    return (
        <img
            src={
                "https://tr.rbxcdn.com/" +
                thumbnail +
                "/420/420/AvatarHeadshot/Png/noFilter"
            }
            style={style}
            draggable={false}
        />
    );
}
