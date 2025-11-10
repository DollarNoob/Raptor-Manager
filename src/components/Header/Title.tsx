interface Props {
  version?: string;
  children?: React.ReactNode;
}

export default function Title({ version, children }: Props) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    gap: 10,
    alignItems: "center"
  };

  const textStyle: React.CSSProperties = {
    color: "oklch(0.9 0 0)",
    fontFamily: "Avenir",
    fontSize: 20,
    fontWeight: 800
  };

  const versionStyle: React.CSSProperties = {
    paddingLeft: 4,
    paddingRight: 4,
    backgroundColor: "oklch(0.4 0 0)",
    color: "oklch(0.9 0 0)",
    border: "1px solid #FFFFFF20",
    borderRadius: 12,
    fontFamily: "Avenir",
    fontSize: 10,
    fontWeight: 500
  };

  return (<>
    <div style={ style } data-tauri-drag-region>
      <span style={ textStyle } data-tauri-drag-region>
        { children }
      </span>
      {
        version &&
          <div style={ versionStyle } data-tauri-drag-region>
            v{ version }
          </div>
      }
    </div>
  </>);
}
