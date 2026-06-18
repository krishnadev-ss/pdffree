const API_BASE = '/api';

export interface JobStatus {
  id: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  progress: number;
  downloadUrl?: string;
  error?: string;
  fileSizeBytes?: number;
}

interface PresignResponse {
  uploadUrl: string;
  fileKey: string;
}

interface JobResponse {
  jobId: string;
}

export async function presign(filename: string, contentType: string): Promise<PresignResponse> {
  const res = await fetch(`${API_BASE}/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType }),
  });
  if (!res.ok) throw new Error(`Presign failed: ${res.statusText}`);
  return res.json();
}

export async function submitJob(
  operation: string,
  fileKeys: string[],
  options?: Record<string, string>,
  idempotencyKey?: string
): Promise<JobResponse> {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation,
      fileKeys,
      options: options || {},
      idempotencyKey: idempotencyKey || crypto.randomUUID(),
    }),
  });
  if (!res.ok) throw new Error(`Job submission failed: ${res.statusText}`);
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`);
  if (!res.ok) throw new Error(`Job status failed: ${res.statusText}`);
  return res.json();
}

export function streamJob(jobId: string, onUpdate: (status: JobStatus) => void): () => void {
  const es = new EventSource(`${API_BASE}/jobs/${jobId}/stream`);
  es.onmessage = (e) => {
    try {
      const status: JobStatus = JSON.parse(e.data);
      onUpdate(status);
      if (status.status === 'done' || status.status === 'failed') {
        es.close();
      }
    } catch { /* ignore parse errors */ }
  };
  es.onerror = () => {
    es.close();
    const interval = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);
        onUpdate(status);
        if (status.status === 'done' || status.status === 'failed') {
          clearInterval(interval);
        }
      } catch { clearInterval(interval); }
    }, 1000);
  };
  return () => es.close();
}
