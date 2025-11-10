interface Props {
  children?: React.ReactNode;
}

export default function StopIcon({}: Props) {
  const style: React.CSSProperties = {
    width: 24,
    height: 24,
    color: "white"
  };

  return (<>
    <svg style={ style } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd"/>
    </svg>
  </>);
}
