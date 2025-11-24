import { useModalStore } from "../store";

export function showErrorModal(title: string, text: string) {
    const modal = useModalStore.getState();
    const id = crypto.randomUUID();
    modal.add({
        id,
        title,
        text,
        buttons: [
            {
                text: "Okay",
                onClick: () => modal.remove(id),
            },
        ],
    });
}

export function showConfirmationModal(
    title: string,
    text: string,
    onConfirm: () => void,
) {
    const modal = useModalStore.getState();
    const id = crypto.randomUUID();
    modal.add({
        id,
        title,
        text,
        buttons: [
            {
                text: "No",
                onClick: () => modal.remove(id),
            },
            {
                text: "Yes",
                onClick: () => {
                    modal.remove(id);
                    onConfirm();
                },
            },
        ],
    });
}

export function showActionModal(
    title: string,
    text: string,
    buttons: Array<{ text: string; onClick: () => void }>,
) {
    const modal = useModalStore.getState();
    const id = crypto.randomUUID();
    modal.add({
        id,
        title,
        text,
        buttons: buttons.map((button) => ({
            ...button,
            onClick: () => {
                button.onClick();
                modal.remove(id);
            },
        })),
    });
}

export function showProgressModal(
    title: string,
    text: string,
    progress?: number,
    progressText?: string,
) {
    const modal = useModalStore.getState();
    const id = crypto.randomUUID();
    modal.add({
        id,
        title,
        text,
        progress,
        progressText,
        buttons: [],
    });
    return id;
}

export function updateProgressModal(
    id: string,
    progress?: number,
    progressText?: string,
) {
    const modal = useModalStore.getState();
    modal.update(id, { progress, progressText });
}
