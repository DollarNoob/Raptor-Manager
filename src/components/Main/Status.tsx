const colors = {
	red: "oklch(0.64 0.18 30)",
	green: "oklch(0.64 0.18 150)",
};

interface Props {
	color: keyof typeof colors;
	children?: React.ReactNode;
}

export default function Status({ color, children }: Props) {
	const style: React.CSSProperties = {
		width: "fit-content",
		minWidth: "fit-content",
		height: "fit-content",
		lineHeight: 1,
		backgroundColor: colors[color],
		color: "oklch(0.9 0 0)",
		paddingLeft: 4,
		paddingRight: 4,
		paddingTop: 2,
		paddingBottom: 1,
		border: "1px solid #FFFFFF20",
		borderRadius: 20,
		fontFamily: "Avenir",
		fontSize: 10,
		fontWeight: 500,
	};

	return (
		<>
			<div style={style}>{children}</div>
		</>
	);
}
