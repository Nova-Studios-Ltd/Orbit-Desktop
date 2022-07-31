import { ipcMain, dialog, app, clipboard, Notification } from "electron";
import { existsSync, lstatSync, readFileSync, writeFile } from "fs";
import { basename } from "path";
import path = require("path");

/**
 * Class respresenting a uploaded file
 */
export class NCFile {
    readonly FileContents: Uint8Array;
    readonly FilePath: string;
    readonly Filename: string;

    constructor(fileContents: Uint8Array, filePath: string, filename: string) {
        this.FileContents = fileContents;
        this.FilePath = filePath;
        this.Filename = filename;
    }
}

// Handle file upload request
ipcMain.handle("UploadFile", async () : Promise<NCFile[]> => {
    const resp = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
    const files = [] as NCFile[];
    if (resp.canceled) return files;
    for (let f = 0; f < resp.filePaths.length; f++) {
        const file = resp.filePaths[f];
        const buffer = readFileSync(file);
        files.push(new NCFile(buffer, file, basename(file)));
    }
    return files;
});

// Handle file download request. Writes directly to downloads.
ipcMain.on("SaveFile", (_, file: Uint8Array, filename: string) => {
    writeFile(path.join(app.getPath("downloads"), `${Date.now()}-${filename}`), file, () => {});
    // TODO Maybe show a notification on save complete?
});

ipcMain.handle("GetClipboard", async () : Promise<NCFile | string> => {
    if (clipboard.readImage().isEmpty()) {
        const path = clipboard.readText();
        if (existsSync(path) && lstatSync(path).isFile()) {
            if (path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".jpeg")) {
                const buffer = readFileSync(path);
                return new NCFile(buffer, path, basename(path));
            }
        }
        return path;
    }
    return new NCFile(clipboard.readImage().toPNG(), "", "Unknown.png");
});

ipcMain.on("TriggerNotif", async (_, title: string, body: string, icon?: Uint8Array) => {
    new Notification({ title: title, body: body }).show();
});