import type React from "react";
import type { IProfile } from "../types/profile";
import type { IMacsploitSettings } from "./macsploit";

export interface IEditProfileModalProps {
    profile: IProfile;
    destruct: () => void;
    children?: React.ReactNode;
}

export interface IProfileModalProps {
    destruct: () => void;
    children?: React.ReactNode;
}

export interface IClientModalProps {
    profile: IProfile;
    destruct: () => void;
    children?: React.ReactNode;
}

export interface IModalButtonProps {
    icon?: React.ReactNode;
    onClick?:
        | React.MouseEventHandler<HTMLButtonElement>
        | React.MouseEventHandler<HTMLDivElement>;
    children?: React.ReactNode;
}

export interface IModalInputProps {
    ref?: React.Ref<[string, React.Dispatch<React.SetStateAction<string>>]>;
    placeholder?: string;
    defaultValue?: string;
    children?: React.ReactNode;
}

export interface IModalOptionProps {
    settings: [
        IMacsploitSettings | undefined,
        React.Dispatch<React.SetStateAction<IMacsploitSettings | undefined>>,
    ];
    name: keyof IMacsploitSettings;
    children?: React.ReactNode;
}

export interface IModalTextProps {
    children?: React.ReactNode;
}

export interface IModalTitleProps {
    children?: React.ReactNode;
}
