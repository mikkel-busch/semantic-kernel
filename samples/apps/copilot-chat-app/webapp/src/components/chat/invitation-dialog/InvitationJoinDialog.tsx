// Copyright (c) Microsoft. All rights reserved.

import { useMsal } from "@azure/msal-react";
import { Button, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Divider, Input, Label, makeStyles, tokens } from "@fluentui/react-components";
import React from "react";
import { AuthHelper } from "../../../libs/auth/AuthHelper";
import { ChatService } from "../../../libs/services/ChatService";
import { useChat } from "../../../libs/useChat";

const useStyles = makeStyles({
    content: {
        display: "flex",
        flexDirection: "column",
        rowGap: tokens.spacingVerticalMNudge,
    },
    divider: {
        marginTop: tokens.spacingVerticalXL,
        marginBottom: tokens.spacingVerticalXL,
    },
});

interface InvitationJoinDialogProps {
    onCloseDialog: () => void;
}

export const InvitationJoinDialog: React.FC<InvitationJoinDialogProps> = ({ onCloseDialog }) => {
    const { instance, inProgress } = useMsal();
    const account = instance.getActiveAccount();
    const chatService = new ChatService(process.env.REACT_APP_BACKEND_URI as string);
    const chat = useChat();
    const [errorOccurred, setErrorOccurred] = React.useState<boolean>(false);
    const [errorMessage, setErrorMessage] = React.useState<string>("");

    const classes = useStyles();

    const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => { 
        ev.preventDefault();
        setErrorOccurred(false);

        const chatId = ev.currentTarget.elements.namedItem("chat-id-input") as HTMLInputElement;

        try {
            await chatService.joinChatAsync(
                account!.homeAccountId!,
                chatId.value,
                await AuthHelper.getSKaaSAccessToken(instance, inProgress)
            );
            await chat.loadChats();
            onCloseDialog();
        } catch (error: any) {
            const message = `Error joining chat ${chatId.value}: ${(error as Error).message}`;
            console.log(message);
            setErrorOccurred(true);
            setErrorMessage(message);
        }
    };

    return (
        <div>
            <DialogSurface>
                <form onSubmit={ handleSubmit }>
                    <DialogBody>
                        <DialogTitle>Join a Bot</DialogTitle>
                        <DialogContent className={classes.content}>
                            <Label required htmlFor="chat-id-input">
                                Please enter the chat ID of the chat you would like to join
                            </Label>
                            <Input required type="text" id="chat-id-input" />
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" onClick={onCloseDialog}>Cancel</Button>
                            <Button type="submit" appearance="primary">Join</Button>
                        </DialogActions>
                    </DialogBody>
                </form>
                {errorOccurred && <div>
                    <Divider className={classes.divider} />
                    <Label size="large">{errorMessage}</Label>
                </div>}
            </DialogSurface>
        </div>
    );
};