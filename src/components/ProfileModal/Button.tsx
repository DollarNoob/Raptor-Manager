interface Props {
	icon?: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLDivElement>;
	children?: React.ReactNode;
}

export default function Button({ icon, onClick, children }: Props) {
	const style: React.CSSProperties = {
		display: "flex",
		flex: 1,
		gap: 4,
		width: children ? "fit-content" : 30,
		minWidth: children ? "fit-content" : 30,
		height: 30,
		paddingLeft: children ? 6 : 0,
		paddingRight: children ? 6 : 0,
		backgroundColor: "oklch(0.22 0 0)",
		border: "1px solid #FFFFFF20",
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
