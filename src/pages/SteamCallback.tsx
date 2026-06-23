import { useEffect, useState } from 'react';
import { setSessionId } from '@/hooks/use-auth';

const CALLBACK_URL = 'https://functions.poehali.dev/edbd3d47-b8f0-4f79-beaf-4ba48d8f3bf6';
const MAX_RETRIES = 8;
const RETRY_DELAY_MS = 4000;

export default function SteamCallback() {
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);

    if (!params.get('openid.mode')) {
      setStatus('error');
      setTimeout(() => window.location.replace('/'), 2000);
      return;
    }

    async function tryAuth() {
      for (let i = 1; i <= MAX_RETRIES; i++) {
        setAttempt(i);
        try {
          const res = await fetch(`${CALLBACK_URL}${search}`);
          if (res.ok) {
            const data = await res.json();
            if (data.session_id) {
              setSessionId(data.session_id);
              window.location.replace('/');
              return;
            }
          }
          if (res.status === 503 && i < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
            continue;
          }
          break;
        } catch {
          if (i < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          }
        }
      }
      setStatus('error');
      setTimeout(() => window.location.replace('/'), 3000);
    }

    tryAuth();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground gap-6">
      {status === 'loading' ? (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div className="text-center">
            <p className="font-display text-sm uppercase tracking-widest text-muted-foreground">Входим в Зону...</p>
            {attempt > 1 && (
              <p className="mt-2 font-body text-xs text-muted-foreground/60">Подключаемся... попытка {attempt}</p>
            )}
          </div>
        </>
      ) : (
        <p className="font-display text-sm uppercase tracking-widest text-destructive">Ошибка входа. Возвращаемся...</p>
      )}
    </div>
  );
}
