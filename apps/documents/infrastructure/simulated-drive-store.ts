import type { FileStore } from "@/application/ports/file-store";

/** The demo's Drive: it keeps no bytes and answers with the path. The browser draws the folder. */
export class SimulatedDriveStore implements FileStore {
  save(entry: { folder: string; fileName: string }): Promise<{ path: string }> {
    return Promise.resolve({ path: `${entry.folder}/${entry.fileName}` });
  }
}
