import { ipcMain, dialog } from "electron";
import { readFileSync } from "fs";
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


ipcMain.handle("UploadFile", async () => {
    const resp = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
    const files = [] as NCFile[];
    if (resp.canceled) return files;
    for (let f = 0; f < resp.filePaths.length; f++) {
        const file = resp.filePaths[f];
        const buffer = readFileSync(file);
        files.push(new NCFile(buffer, file, path.basename(file)));
    }
    return files;
});