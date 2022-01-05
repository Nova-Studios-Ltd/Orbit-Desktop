/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';

export function resolveHtmlPath(htmlFileName: string) {
  const port = process.env.PORT || 1212;
  const url = new URL(`http://localhost:${port}`);
  url.pathname = htmlFileName;
  return url.href;
}
