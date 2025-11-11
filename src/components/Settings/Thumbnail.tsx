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
        borderRadius: 12,
        border: "1px solid #FFFFFF20",
    };

    return (
        <img src={thumbnail} style={style} draggable={false} alt="Thumbnail" />
    );
}
