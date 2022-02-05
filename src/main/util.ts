/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { app } from "electron";
import path from "path";
import { URL } from "url";

export const isDevelopment = process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true";

export function resolveHtmlPath(htmlFileName: string) {
  if (isDevelopment) {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}/`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, "../renderer/", htmlFileName)}`;
}

const RESOURCES_PATH = app.isPackaged
? path.join(process.resourcesPath, "assets")
: path.join(__dirname, "../../assets");

export const getAssetPath = (...paths: string[]): string => {
return path.join(RESOURCES_PATH, ...paths);
};
