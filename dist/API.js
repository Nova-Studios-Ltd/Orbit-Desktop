"use strict";
exports.__esModule = true;
exports.InitAPI = void 0;
var electron_1 = require("electron");
function InitAPI() {
    electron_1.ipcMain.addListener("UploadFile", function () {
        console.log(electron_1.dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }));
    });
}
exports.InitAPI = InitAPI;
//# sourceMappingURL=API.js.map