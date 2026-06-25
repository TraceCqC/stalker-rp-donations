import { useState, useEffect } from 'react';

const AUTH_ME_URL = import.meta.env.VITE_FN_AUTH_ME;
const LOGOUT_URL = import.meta.env.VITE_FN_AUTH_LOGOUT;

const SITE_URL = import.meta.env.VITE_SITE_URL;
const STEAM_CALLBACK_URL = `${SITE_URL}/steam-auth`;

const SESSION_KEY = 'nz_session_id';

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
  is_admin: boolean;
  balance: number;
}

export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionId(id: string) {
  localStorage.setItem(SESSION_KEY, id);
}

export function clearSessionId() {
  localStorage.removeItem(SESSION_KEY);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sid = getSessionId();
    if (!sid) {
      setLoading(false);
      return;
    }
    fetch(AUTH_ME_URL, {
      headers: { 'X-Session-Id': sid },
    })
      .then((r) => {
        if (r.status === 401) { clearSessionId(); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.user) {
          setUser(data.user);
          setPurchases(data.purchases || []);
        } else {
          clearSessionId();
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loginWithSteam = () => {
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': STEAM_CALLBACK_URL,
      'openid.realm': SITE_URL,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    });
    window.location.href = `https://steamcommunity.com/openid/login?${params.toString()}`;
  };

  const logout = async () => {
    const sid = getSessionId();
    if (sid) {
      await fetch(LOGOUT_URL, {
        method: 'POST',
        headers: { 'X-Session-Id': sid },
      });
    }
    clearSessionId();
    setUser(null);
    setPurchases([]);
  };

  return { user, purchases, loading, loginWithSteam, logout };
}