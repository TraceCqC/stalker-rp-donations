import { useEffect } from 'react';

const CALLBACK_URL = 'https://functions.poehali.dev/edbd3d47-b8f0-4f79-beaf-4ba48d8f3bf6';

export default function SteamCallback() {
  useEffect(() => {
    const params = window.location.search;
    window.location.replace(`${CALLBACK_URL}${params}`);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="font-display text-sm uppercase tracking-widest text-muted-foreground">Входим в Зону...</p>
    </div>
  );
}
