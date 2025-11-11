const colors = {
	red: "oklch(0.68 0.22 30)",
	green: "oklch(0.68 0.22 150)",
	darkgreen: "oklch(0.58 0.22 150)",
};

interface Props {
	icon?: React.ReactNode;
	color: keyof typeof colors;
	cursor?: boolean;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	children?: React.ReactNode;
}

export default function Button({
	icon,
	color,
	cursor,
	onClick,
	children,
}: Props) {
	const style: React.CSSProperties = {
		display: "flex",
		gap: 6,
		width: "100%",
		height: 36,
		backgroundColor: colors[color],
		border: "2px solid #FFFFFF20",
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		cursor: cursor === false ? "default" : "pointer", // defaults to true
	};

	const textStyle: React.CSSProperties = {
		color: "white",
		fontFamily: "Avenir",
		fontSize: 18,
		fontWeight: 700,
		marginTop: 1,
	};

	return (
		<>
			<div style={style} onClick={onClick}>
				{icon}
				<span style={textStyle}>{children}</span>
			</div>
		</>
	);
}
