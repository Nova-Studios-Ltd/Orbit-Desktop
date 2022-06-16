const { contextBridge, ipcRenderer } = require("electron");

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type as keyof NodeJS.ProcessVersions]);
  }
});

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    send(channel: string, ...data: any[]) {
      ipcRenderer.send(channel, ...data);
    },
    on(channel: string, func: (...a: any[]) => void) {
      ipcRenderer.on(channel, (event, ...args) => {
        try {
          func(...args);
        }
        catch (e) {
          console.error(`Failed to exe-cute ${channel} with ${e}`);
        }
      });
    },
    once(channel: string, func: (...a: any[]) => void) {
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    },
    removeAllListeners(channel: string) {
      ipcRenderer.removeAllListeners(channel);
    },
    async invoke(channel: string, ...data: any[]) {
      const v = await ipcRenderer.invoke(channel, ...data);
      return v;
    },
    sendSync(channel: string, ...data: any[]) {
      return ipcRenderer.sendSync(channel, ...data);
    }
  }
});