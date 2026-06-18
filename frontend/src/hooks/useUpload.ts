import { useState } from 'react';
import { presign } from '../api/client';

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function upload(file: File): Promise<string> {
    setUploading(true);
    setProgress(0);
    try {
      const { uploadUrl, fileKey } = await presign(file.name, file.type || 'application/pdf');
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'application/pdf');
        xhr.send(file);
      });
      return fileKey;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, progress };
}
