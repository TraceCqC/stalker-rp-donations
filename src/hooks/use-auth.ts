import { useState, useEffect } from 'react';

const AUTH_ME_URL = 'https://functions.poehali.dev/085b5268-60a1-42ec-92f7-19cb411dcd7d';
const LOGOUT_URL = 'https://functions.poehali.dev/3f106363-957e-4cd7-9dee-5468f71d6997';
const STEAM_LOGIN_URL = 'https://functions.poehali.dev/c009e5f0-9192-4bd4-b1f1-079159a97c98';

export interface Purchase {
  id: number;
  category: string;
  item_name: string;
  price: number;
  status: string;
  created_at: string;
}

export interface User {
  id: number;
  steam_id: string;
  username: string;
  avatar_url: string;
  member_since: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(AUTH_ME_URL, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setPurchases(data.purchases || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loginWithSteam = () => {
    window.location.href = STEAM_LOGIN_URL;
  };

  const logout = async () => {
    await fetch(LOGOUT_URL, { method: 'POST', credentials: 'include' });
    setUser(null);
    setPurchases([]);
  };

  return { user, purchases, loading, loginWithSteam, logout };
}
