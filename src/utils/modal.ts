import { useModalStore } from "../store";

/**
 * Shows an error modal with an OK button.
 * @param title - The title of the modal
 * @param text - The error message to display
 */
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

/**
 * Shows a confirmation modal with Yes and No buttons.
 * @param title - The title of the modal
 * @param text - The message to display
 * @param onConfirm - Function to run when Yes is clicked
 */
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

/**
 * Shows a modal with custom buttons.
 * @param title - The title of the modal
 * @param text - The message to display
 * @param buttons - Array of button configurations
 */
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

/**
 * Shows a progress modal for operations like installation.
 * @param title - The title of the modal
 * @param text - The message to display
 * @param progress - Optional progress percentage (0-100)
 * @param progressText - Optional text describing current progress
 * @returns The modal ID for updating progress later
 */
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

/**
 * Updates a progress modal with new progress values.
 * @param id - The ID of the progress modal to update
 * @param progress - Optional progress percentage (0-100)
 * @param progressText - Optional text describing current progress
 */
export function updateProgressModal(
    id: string,
    progress?: number,
    progressText?: string,
) {
    const modal = useModalStore.getState();
    modal.update(id, { progress, progressText });
}
