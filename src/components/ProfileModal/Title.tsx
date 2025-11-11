import Text from "../Shared/Text";

interface Props {
    children?: React.ReactNode;
}

export default function Title({ children }: Props) {
    return <Text variant="title">{children}</Text>;
}
