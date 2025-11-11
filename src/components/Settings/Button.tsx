const colors = {
	red: "oklch(0.64 0.18 30)",
	green: "oklch(0.64 0.18 160)",
	blue: "oklch(0.64 0.18 260)",
};

interface Props {
	icon?: React.ReactNode;
	color: keyof typeof colors;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	children?: React.ReactNode;
}

export default function Button({ icon, color, onClick, children }: Props) {
	const style: React.CSSProperties = {
		display: "flex",
		flex: 1,
		gap: 4,
		height: 28,
		backgroundColor: colors[color],
		border: "2px solid #FFFFFF20",
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		cursor: "pointer",
	};

	const textStyle: React.CSSProperties = {
		color: "oklch(0.9 0 0)",
		fontFamily: "Avenir",
		fontSize: 14,
		fontWeight: 700,
		marginTop: 1,
	};

	return (
		<>
			<div style={style} onClick={onClick}>
				{icon}
				{children && <span style={textStyle}>{children}</span>}
			</div>
		</>
	);
}
