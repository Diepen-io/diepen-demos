import type { UploadedFile } from "./ocr-service";

/** Where a checked file is filed. The demo keeps no bytes; a client build puts Google Drive here. */
export interface FileStore {
  save(entry: { folder: string; fileName: string; file: UploadedFile }): Promise<{ path: string }>;
}
