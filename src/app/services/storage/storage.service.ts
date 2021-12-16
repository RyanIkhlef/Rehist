import { Injectable } from '@angular/core';
import {getDownloadURL, getStorage, ref, uploadBytes, UploadResult } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  /**
   * Uploads file in firebase storage.
   *
   * @param file the file that wants to add in the db
   * @param path the path in the storage (for example : associations/logos
   */
  uploadFile(file: File, path: string): Promise<UploadResult> {
    if(!path.endsWith("/"))
      path += "/";

    const almostUniqueFileName = Date.now().toString() + "-" + file.name;
    const location = path + almostUniqueFileName;
    const imgRef = ref(getStorage(), location);

    return uploadBytes(imgRef, file);
  }

  getUrlFromStoragePath(path: string): Promise<string> {
    return getDownloadURL(ref(getStorage(), path))
  }

}
