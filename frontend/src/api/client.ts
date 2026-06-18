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

// --- Share API ---

export interface ShareResponse {
  share_id: string;
  share_url: string;
  expires_at: string;
}

export interface ShareStatus {
  id: string;
  file_keys: string[];
  message?: string;
  download_count: number;
  max_downloads: number;
  expires_at: string;
  expired: boolean;
  download_urls?: string[];
}

export async function createShare(
  fileKeys: string[],
  options?: { expiresIn?: number; maxDownloads?: number; message?: string }
): Promise<ShareResponse> {
  const res = await fetch(`${API_BASE}/shares`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_keys: fileKeys,
      expires_in: options?.expiresIn || 24,
      max_downloads: options?.maxDownloads || 0,
      message: options?.message || '',
    }),
  });
  if (!res.ok) throw new Error(`Share creation failed: ${res.statusText}`);
  return res.json();
}

export async function getShare(shareId: string): Promise<ShareStatus> {
  const res = await fetch(`${API_BASE}/shares/${shareId}`);
  if (!res.ok) {
    if (res.status === 410) throw new Error('This share link has expired or reached its download limit.');
    if (res.status === 404) throw new Error('Share link not found.');
    throw new Error(`Failed to get share: ${res.statusText}`);
  }
  return res.json();
}

// --- Transfer API ---

export interface TransferResponse {
  transfer_id: string;
  unlock_key: string;
  expires_at: string;
}

export interface TransferUnlockResponse {
  transfer_id: string;
  message?: string;
  download_urls: string[];
  expires_at: string;
}

export async function createTransfer(
  fileKeys: string[],
  message?: string
): Promise<TransferResponse> {
  const res = await fetch(`${API_BASE}/transfers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_keys: fileKeys, message: message || '' }),
  });
  if (!res.ok) throw new Error(`Transfer creation failed: ${res.statusText}`);
  return res.json();
}

export async function unlockTransfer(unlockKey: string): Promise<TransferUnlockResponse> {
  const res = await fetch(`${API_BASE}/transfers/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unlock_key: unlockKey }),
  });
  if (!res.ok) {
    if (res.status === 410) throw new Error('This transfer has expired or already been claimed.');
    if (res.status === 404) throw new Error('Invalid unlock key.');
    throw new Error(`Transfer unlock failed: ${res.statusText}`);
  }
  return res.json();
}
