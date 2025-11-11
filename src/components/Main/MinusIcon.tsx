interface Props {
	children?: React.ReactNode;
}

export default function MinusIcon({}: Props) {
	const style: React.CSSProperties = {
		width: 18,
		height: 18,
		color: "oklch(0.9 0 0)",
	};

	return (
		<>
			<svg
				style={style}
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={2.5}
				stroke="currentColor"
			>
				<path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
			</svg>
		</>
	);
}
