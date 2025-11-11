interface Props {
    children?: React.ReactNode;
}

export default function LoadingIcon({}: Props) {
    const style: React.CSSProperties = {
        width: 16,
        height: 16,
        padding: 4,
        color: "white",
    };

    return (
            <svg
                style={style}
                viewBox="0 0 40 40"
                xmlns="http://www.w3.org/2000/svg"
                stroke="white"
            >
                <g fill="none" fillRule="evenodd">
                    <g transform="translate(2 2)" strokeWidth="6">
                        <circle strokeOpacity=".25" cx="18" cy="18" r="18" />
                        <path d="M36 18c0-9.94-8.06-18-18-18">
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="0 18 18"
                                to="360 18 18"
                                dur=".5s"
                                repeatCount="indefinite"
                            />
                        </path>
                    </g>
                </g>
            </svg>
    );
}
