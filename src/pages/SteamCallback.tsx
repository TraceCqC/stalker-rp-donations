import { useEffect, useState } from 'react';
import { setSessionId } from '@/hooks/use-auth';

const CALLBACK_URL = 'https://functions.poehali.dev/edbd3d47-b8f0-4f79-beaf-4ba48d8f3bf6';

export default function SteamCallback() {
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);

    // Если нет openid-параметров — что-то пошло не так
    if (!params.get('openid.mode')) {
      setStatus('error');
      setTimeout(() => window.location.replace('/'), 2000);
      return;
    }

    // Вызываем бэкенд через fetch — ждём JSON с session_id
    fetch(`${CALLBACK_URL}${search}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.session_id) {
          setSessionId(data.session_id);
          window.location.replace('/');
        } else {
          setStatus('error');
          setTimeout(() => window.location.replace('/'), 2000);
        }
      })
      .catch(() => {
        setStatus('error');
        setTimeout(() => window.location.replace('/'), 2000);
      });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground gap-4">
      {status === 'loading' ? (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="font-display text-sm uppercase tracking-widest text-muted-foreground">Входим в Зону...</p>
        </>
      ) : (
        <>
          <p className="font-display text-sm uppercase tracking-widest text-destructive">Ошибка входа. Возвращаемся...</p>
        </>
      )}
    </div>
  );
}
