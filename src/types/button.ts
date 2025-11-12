import type { CSSProperties } from "react";

interface BaseButtonProps {
    icon?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLElement>;
    children?: React.ReactNode;
    className?: string;
    style?: CSSProperties;
}

interface DefaultButtonProps extends BaseButtonProps {
    variant?: "default" | "modal";
}

interface HeaderButtonProps extends BaseButtonProps {
    variant: "header";
    active?: boolean;
}

interface MainButtonProps extends BaseButtonProps {
    variant: "main";
    color: "red" | "green" | "darkgreen";
    cursor?: boolean;
}

interface SettingsButtonProps extends BaseButtonProps {
    variant: "settings";
    color: "red" | "green" | "blue";
}

interface StatusButtonProps extends BaseButtonProps {
    variant: "status";
    color: "red" | "green" | "orange";
}

export type ButtonProps =
    | DefaultButtonProps
    | HeaderButtonProps
    | MainButtonProps
    | SettingsButtonProps
    | StatusButtonProps;

export type {
    BaseButtonProps,
    DefaultButtonProps,
    HeaderButtonProps,
    MainButtonProps,
    SettingsButtonProps,
    StatusButtonProps,
};
