import type { ReactNode } from "react";

export interface IModal {
    id: string;
    title: string;
    text: string;
    buttons: IModalButton[];
    progress?: number;
    progressText?: string;
    isIndeterminate?: boolean;
}

export interface IModalButton {
    text: string;
    icon?: ReactNode;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}
