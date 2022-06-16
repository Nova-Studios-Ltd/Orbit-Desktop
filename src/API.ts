import { ipcMain, dialog } from "electron";

export function InitAPI() {
    ipcMain.addListener("UploadFile", () => {
        console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }))
    });
}