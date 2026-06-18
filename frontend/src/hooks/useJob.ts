import { useState, useCallback, useRef } from 'react';
import { submitJob, streamJob, type JobStatus } from '../api/client';

export function useJob(operation: string) {
  const [status, setStatus] = useState<JobStatus['status'] | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const submit = useCallback(async (fileKeys: string[], options?: Record<string, string>) => {
    setStatus('queued');
    setProgress(0);
    setDownloadUrl(null);
    setError(null);
    setFileSizeBytes(null);

    try {
      const { jobId } = await submitJob(operation, fileKeys, options);
      cleanupRef.current = streamJob(jobId, (jobStatus) => {
        setStatus(jobStatus.status);
        setProgress(jobStatus.progress);
        if (jobStatus.downloadUrl) setDownloadUrl(jobStatus.downloadUrl);
        if (jobStatus.error) setError(jobStatus.error);
        if (jobStatus.fileSizeBytes) setFileSizeBytes(jobStatus.fileSizeBytes);
      });
    } catch (err) {
      setStatus('failed');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [operation]);

  const reset = useCallback(() => {
    if (cleanupRef.current) cleanupRef.current();
    setStatus(null);
    setProgress(0);
    setDownloadUrl(null);
    setError(null);
    setFileSizeBytes(null);
  }, []);

  return { submit, status, progress, downloadUrl, error, fileSizeBytes, reset };
}
