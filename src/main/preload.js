const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send(channel, ...data) {
      ipcRenderer.send(channel, ...data);
    },
    on(channel, func) {
      ipcRenderer.on(channel, (event, ...args) => {
        try {
          func(...args);
        }
        catch (e) {
          console.error(`Failed to exe-cute ${channel} with ${e}`);
        }
      });
    },
    once(channel, func) {
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    },
    removeAllListeners(channel) {
      ipcRenderer.removeAllListeners(channel);
    },
    async invoke(channel, ...data) {
      const v = await ipcRenderer.invoke(channel, ...data);
      return v;
    }
  }
});
