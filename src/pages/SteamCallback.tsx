import { useEffect } from 'react';
import { setSessionId } from '@/hooks/use-auth';

const CALLBACK_URL = 'https://functions.poehali.dev/edbd3d47-b8f0-4f79-beaf-4ba48d8f3bf6';

export default function SteamCallback() {
  useEffect(() => {
    // После редиректа с облачной функции приходим сюда с хэшом #cabinet?sid=...
    const hash = window.location.hash;
    if (hash.startsWith('#cabinet')) {
      const query = hash.replace('#cabinet?', '').replace('#cabinet', '');
      const params = new URLSearchParams(query);
      const sid = params.get('sid');
      if (sid) {
        setSessionId(sid);
      }
      window.location.replace('/');
      return;
    }
    // Первый проход — проксируем Steam-параметры на облачную функцию
    const params = window.location.search;
    window.location.replace(`${CALLBACK_URL}${params}`);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="font-display text-sm uppercase tracking-widest text-muted-foreground">Входим в Зону...</p>
    </div>
  );
}
