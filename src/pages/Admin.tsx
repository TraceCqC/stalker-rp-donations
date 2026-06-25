import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getSessionId } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const ADMIN_URL = 'https://functions.poehali.dev/b71dc419-3bb9-4658-8144-bbc49fb591dd';
const NEWS_URL = 'https://functions.poehali.dev/b6a922f6-e4a1-4920-afa6-ff75d1e0783e';
const UPLOAD_URL = 'https://functions.poehali.dev/085b509e-630e-4156-9891-b5c5fbf3b537';
const FACTIONS_URL = 'https://functions.poehali.dev/96537813-a83b-4c40-8239-6bea84d441f5';
const PROMOS_URL = 'https://functions.poehali.dev/b16d53a7-7451-4a6c-b183-58b124ae7353';
const CATEGORIES_URL = 'https://functions.poehali.dev/4be20cea-595d-46cf-89b0-19bcba5d0e91';

interface ShopItem {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  badge: string | null;
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
  image_url: string | null;
}

interface NewsItem {
  id: number;
  ver: string;
  date: string;
  title: string;
  tag: string;
  text: string;
  sort_order: number;
  image_url: string | null;
}

const EMPTY_ITEM: Omit<ShopItem, 'id'> = {
  category: 'privilege',
  name: '',
  description: '',
  price: 0,
  badge: null,
  is_popular: false,
  sort_order: 0,
  is_active: true,
  image_url: null,
};

const EMPTY_NEWS: Omit<NewsItem, 'id'> = {
  ver: '',
  date: '',
  title: '',
  tag: 'Контент',
  text: '',
  sort_order: 0,
  image_url: null,
};

const TAGS = ['Контент', 'Баланс', 'Фикс', 'Ивент', 'Обновление'];

interface FactionItem {
  id: number;
  name: string;
  icon: string;
  color: string;
  alignment: string;
  description: string;
  is_paid: boolean;
  sort_order: number;
  is_active: boolean;
  icon_url: string | null;
}

const EMPTY_FACTION: Omit<FactionItem, 'id'> = {
  name: '',
  icon: 'Shield',
  color: 'text-gray-400',
  alignment: '',
  description: '',
  is_paid: false,
  sort_order: 0,
  is_active: true,
  icon_url: null,
};

const FACTION_COLORS = [
  'text-red-400', 'text-green-400', 'text-blue-400', 'text-purple-400',
  'text-orange-400', 'text-yellow-400', 'text-cyan-400', 'text-lime-400',
  'text-pink-400', 'text-gray-400', 'text-white',
];

interface Promocode {
  id: number;
  code: string;
  type: 'balance' | 'discount';
  value: number;
  category: string | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const EMPTY_PROMO: Omit<Promocode, 'id' | 'used_count' | 'created_at'> = {
  code: '',
  type: 'discount',
  value: 10,
  category: null,
  max_uses: null,
  is_active: true,
  expires_at: null,
};

const PROMO_CATEGORIES = [
  { key: null, label: 'Все товары' },
  { key: 'privilege', label: 'Привилегии' },
  { key: 'items', label: 'Снаряжение' },
  { key: 'currency', label: 'Валюта' },
  { key: 'transport', label: 'Транспорт' },
  { key: 'furniture', label: 'Фурнитура' },
];


const CAT_ICON: Record<string, string> = {
  privilege: 'Shield',
  items: 'Package',
  currency: 'Coins',
  transport: 'Car',
  furniture: 'Armchair',
};

interface Category {
  id: number;
  key: string;
  label: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_CATEGORY: Omit<Category, 'id'> = {
  key: '',
  label: '',
  icon: 'Package',
  sort_order: 0,
  is_active: true,
};

const LUCIDE_ICONS = [
  'Package', 'Shield', 'Coins', 'Car', 'Armchair', 'Sword', 'Zap',
  'Star', 'Heart', 'Flame', 'Truck', 'Wrench', 'Box', 'Gift',
  'Crosshair', 'Skull', 'Gem', 'Crown', 'Anchor', 'Rocket',
];

function authHeaders() {
  return { 'Content-Type': 'application/json', 'X-Session-Id': getSessionId() || '' };
}

export default function Admin() {
  const { user, loading: authLoading, loginWithSteam } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<'shop' | 'news' | 'factions' | 'promos' | 'categories'>('shop');

  // Shop state
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [editItem, setEditItem] = useState<ShopItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // News state
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [editNews, setEditNews] = useState<NewsItem | null>(null);
  const [isNewNews, setIsNewNews] = useState(false);
  const [savingNews, setSavingNews] = useState(false);
  const [deletingNewsId, setDeletingNewsId] = useState<number | null>(null);
  const [uploadingNewsImage, setUploadingNewsImage] = useState(false);

  // Factions state
  const [factions, setFactions] = useState<FactionItem[]>([]);
  const [factionsLoading, setFactionsLoading] = useState(false);
  const [editFaction, setEditFaction] = useState<FactionItem | null>(null);
  const [isNewFaction, setIsNewFaction] = useState(false);
  const [savingFaction, setSavingFaction] = useState(false);
  const [deletingFactionId, setDeletingFactionId] = useState<number | null>(null);
  const [uploadingFactionIcon, setUploadingFactionIcon] = useState(false);

  // Promos state
  const [promos, setPromos] = useState<Promocode[]>([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [editPromo, setEditPromo] = useState<Partial<Promocode> | null>(null);
  const [isNewPromo, setIsNewPromo] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [isNewCat, setIsNewCat] = useState(false);
  const [savingCat, setSavingCat] = useState(false);

  const fetchItems = () => {
    setLoading(true);
    fetch(ADMIN_URL, { headers: authHeaders() })
      .then(async (r) => {
        if (r.status === 403) { setForbidden(true); return; }
        const d = await r.json();
        setItems(d.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchNews = () => {
    setNewsLoading(true);
    fetch(NEWS_URL, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setNews(d.news || []))
      .catch(() => {})
      .finally(() => setNewsLoading(false));
  };

  const fetchFactions = () => {
    setFactionsLoading(true);
    fetch(`${FACTIONS_URL}?all=1`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setFactions(d.factions || []))
      .catch(() => {})
      .finally(() => setFactionsLoading(false));
  };

  const fetchPromos = () => {
    setPromosLoading(true);
    fetch(PROMOS_URL, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setPromos(d.promocodes || []))
      .catch(() => {})
      .finally(() => setPromosLoading(false));
  };

  const fetchCategories = () => {
    setCategoriesLoading(true);
    fetch(CATEGORIES_URL, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setCategoriesLoading(false));
  };

  useEffect(() => {
    if (!authLoading && user) { fetchItems(); fetchNews(); fetchFactions(); fetchPromos(); fetchCategories(); }
    else if (!authLoading && !user) setLoading(false);
  }, [authLoading, user]);

  // Category handlers
  const openNewCat = () => { setIsNewCat(true); setEditCat({ id: 0, ...EMPTY_CATEGORY }); };
  const closeCat = () => setEditCat(null);

  const handleSaveCat = async () => {
    if (!editCat) return;
    setSavingCat(true);
    try {
      const res = await fetch(CATEGORIES_URL, {
        method: isNewCat ? 'POST' : 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(editCat),
      });
      const data = await res.json();
      if (data.error) { toast({ title: 'Ошибка: ' + data.error, variant: 'destructive' }); }
      else { toast({ title: isNewCat ? 'Категория создана' : 'Сохранено' }); closeCat(); fetchCategories(); }
    } catch { toast({ title: 'Ошибка соединения', variant: 'destructive' }); }
    finally { setSavingCat(false); }
  };

  const handleDeleteCat = async (id: number) => {
    if (!confirm('Удалить категорию? Товары в ней останутся.')) return;
    try {
      await fetch(CATEGORIES_URL, { method: 'DELETE', headers: authHeaders(), body: JSON.stringify({ id }) });
      toast({ title: 'Категория удалена' }); fetchCategories();
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
  };

  // Promo handlers
  const openNewPromo = () => { setIsNewPromo(true); setEditPromo({ ...EMPTY_PROMO }); };
  const closePromo = () => setEditPromo(null);

  const handleSavePromo = async () => {
    if (!editPromo) return;
    setSavingPromo(true);
    try {
      const url = isNewPromo ? PROMOS_URL : `${PROMOS_URL}?id=${editPromo.id}`;
      const res = await fetch(url, {
        method: isNewPromo ? 'POST' : 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(editPromo),
      });
      const data = await res.json();
      if (data.error) { toast({ title: 'Ошибка: ' + data.error, variant: 'destructive' }); }
      else { toast({ title: isNewPromo ? 'Промокод создан' : 'Сохранено' }); closePromo(); fetchPromos(); }
    } catch { toast({ title: 'Ошибка соединения', variant: 'destructive' }); }
    finally { setSavingPromo(false); }
  };

  const handleTogglePromo = async (promo: Promocode) => {
    await fetch(`${PROMOS_URL}?id=${promo.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ is_active: !promo.is_active }),
    });
    fetchPromos();
  };

  // Shop handlers
  const openNew = () => { setIsNew(true); setEditItem({ id: 0, ...EMPTY_ITEM }); };
  const openEdit = (item: ShopItem) => { setIsNew(false); setEditItem({ ...item }); };
  const closeEdit = () => setEditItem(null);

  const handleImageUpload = async (file: File) => {
    if (!editItem) return;
    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ data: base64, content_type: file.type }),
        });
        const data = await res.json();
        if (data.url) setEditItem((prev) => prev ? { ...prev, image_url: data.url } : prev);
        else toast({ title: 'Ошибка загрузки', variant: 'destructive' });
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: 'Ошибка загрузки', variant: 'destructive' });
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const url = isNew ? ADMIN_URL : `${ADMIN_URL}?id=${editItem.id}`;
      const res = await fetch(url, { method: isNew ? 'POST' : 'PUT', headers: authHeaders(), body: JSON.stringify(editItem) });
      const data = await res.json();
      if (data.item) { toast({ title: isNew ? 'Товар создан' : 'Сохранено' }); closeEdit(); fetchItems(); }
      else toast({ title: 'Ошибка', variant: 'destructive' });
    } catch { toast({ title: 'Ошибка соединения', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить товар?')) return;
    setDeletingId(id);
    try {
      await fetch(`${ADMIN_URL}?id=${id}`, { method: 'DELETE', headers: authHeaders() });
      toast({ title: 'Удалено' }); fetchItems();
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setDeletingId(null); }
  };

  const toggleActive = async (item: ShopItem) => {
    await fetch(`${ADMIN_URL}?id=${item.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ ...item, is_active: !item.is_active }) });
    fetchItems();
  };

  // News handlers
  const openNewNews = () => { setIsNewNews(true); setEditNews({ id: 0, ...EMPTY_NEWS }); };
  const openEditNews = (n: NewsItem) => { setIsNewNews(false); setEditNews({ ...n }); };
  const closeEditNews = () => setEditNews(null);

  const handleNewsImageUpload = async (file: File) => {
    if (!editNews) return;
    setUploadingNewsImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ data: base64, content_type: file.type }),
        });
        const data = await res.json();
        if (data.url) setEditNews((prev) => prev ? { ...prev, image_url: data.url } : prev);
        else toast({ title: 'Ошибка загрузки', variant: 'destructive' });
        setUploadingNewsImage(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: 'Ошибка загрузки', variant: 'destructive' });
      setUploadingNewsImage(false);
    }
  };

  const handleSaveNews = async () => {
    if (!editNews) return;
    setSavingNews(true);
    try {
      const url = isNewNews ? NEWS_URL : `${NEWS_URL}?id=${editNews.id}`;
      const res = await fetch(url, { method: isNewNews ? 'POST' : 'PUT', headers: authHeaders(), body: JSON.stringify(editNews) });
      const data = await res.json();
      if (data.item) { toast({ title: isNewNews ? 'Новость создана' : 'Сохранено' }); closeEditNews(); fetchNews(); }
      else toast({ title: 'Ошибка', variant: 'destructive' });
    } catch { toast({ title: 'Ошибка соединения', variant: 'destructive' }); }
    finally { setSavingNews(false); }
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm('Удалить новость?')) return;
    setDeletingNewsId(id);
    try {
      await fetch(`${NEWS_URL}?id=${id}`, { method: 'DELETE', headers: authHeaders() });
      toast({ title: 'Удалено' }); fetchNews();
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setDeletingNewsId(null); }
  };

  // Factions handlers
  const openNewFaction = () => { setIsNewFaction(true); setEditFaction({ id: 0, ...EMPTY_FACTION }); };
  const openEditFaction = (f: FactionItem) => { setIsNewFaction(false); setEditFaction({ ...f }); };
  const closeEditFaction = () => setEditFaction(null);

  const handleFactionIconUpload = async (file: File) => {
    if (!editFaction) return;
    setUploadingFactionIcon(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ data: base64, content_type: file.type }),
        });
        const data = await res.json();
        if (data.url) setEditFaction((prev) => prev ? { ...prev, icon_url: data.url } : prev);
        else toast({ title: 'Ошибка загрузки', variant: 'destructive' });
        setUploadingFactionIcon(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: 'Ошибка загрузки', variant: 'destructive' });
      setUploadingFactionIcon(false);
    }
  };

  const handleSaveFaction = async () => {
    if (!editFaction) return;
    setSavingFaction(true);
    try {
      const url = isNewFaction ? FACTIONS_URL : `${FACTIONS_URL}?id=${editFaction.id}`;
      const res = await fetch(url, { method: isNewFaction ? 'POST' : 'PUT', headers: authHeaders(), body: JSON.stringify(editFaction) });
      const data = await res.json();
      if (data.item) { toast({ title: isNewFaction ? 'Фракция создана' : 'Сохранено' }); closeEditFaction(); fetchFactions(); }
      else toast({ title: 'Ошибка', variant: 'destructive' });
    } catch { toast({ title: 'Ошибка соединения', variant: 'destructive' }); }
    finally { setSavingFaction(false); }
  };

  const handleDeleteFaction = async (id: number) => {
    if (!confirm('Удалить фракцию?')) return;
    setDeletingFactionId(id);
    try {
      await fetch(`${FACTIONS_URL}?id=${id}`, { method: 'DELETE', headers: authHeaders() });
      toast({ title: 'Удалено' }); fetchFactions();
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setDeletingFactionId(null); }
  };

  const toggleFactionActive = async (f: FactionItem) => {
    await fetch(`${FACTIONS_URL}?id=${f.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ ...f, is_active: !f.is_active }) });
    fetchFactions();
  };

  if (!authLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="grain rust-border w-full max-w-md bg-card p-10 text-center">
          <div className="hazard-stripe mb-8 h-1 w-full" />
          <Icon name="ShieldAlert" size={48} className="mx-auto mb-4 text-primary" />
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Только для своих</h1>
          <p className="mt-3 font-body text-muted-foreground">Войди через Steam — проверим, есть ли у тебя доступ.</p>
          <Button onClick={loginWithSteam} size="lg" className="mt-8 w-full font-display uppercase tracking-widest animate-radiate">
            <Icon name="LogIn" size={18} className="mr-2" /> Войти через Steam
          </Button>
          <div className="hazard-stripe mt-8 h-1 w-full" />
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="grain rust-border w-full max-w-md bg-card p-10 text-center">
          <div className="hazard-stripe mb-8 h-1 w-full" />
          <Icon name="Ban" size={48} className="mx-auto mb-4 text-destructive" />
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Доступ закрыт</h1>
          <p className="mt-3 font-body text-muted-foreground">У твоего аккаунта нет прав администратора.</p>
          <a href="/"><Button variant="outline" className="mt-8 font-display uppercase tracking-widest">На главную</Button></a>
          <div className="hazard-stripe mt-8 h-1 w-full" />
        </div>
      </div>
    );
  }

  const grouped = categories.map((cat) => ({ ...cat, items: items.filter((i) => i.category === cat.key) }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/60 sticky top-0 z-30">
        <div className="container flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground">
              <Icon name="Radiation" size={18} />
            </div>
            <div>
              <span className="font-display text-lg font-bold uppercase tracking-widest">
                Night <span className="text-primary">Zone</span>
              </span>
              <span className="ml-3 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">/ Панель управления</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                {user.avatar_url && <img src={user.avatar_url} className="h-7 w-7 object-cover" alt="" />}
                <span className="font-display text-sm uppercase tracking-wider text-muted-foreground hidden sm:block">{user.username}</span>
              </div>
            )}
            <a href="/shop"><Button variant="outline" size="sm" className="font-display uppercase tracking-widest border-border">
              <Icon name="ShoppingCart" size={14} className="mr-2" /> Магазин
            </Button></a>
          </div>
        </div>
      </header>

      <div className="container px-4 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-10">
          <button
            onClick={() => setTab('shop')}
            className={`flex items-center gap-2 px-6 py-2.5 font-display text-sm uppercase tracking-widest border transition-all ${tab === 'shop' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
          >
            <Icon name="ShoppingCart" size={15} /> Товары
          </button>
          <button
            onClick={() => setTab('news')}
            className={`flex items-center gap-2 px-6 py-2.5 font-display text-sm uppercase tracking-widest border transition-all ${tab === 'news' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
          >
            <Icon name="Radio" size={15} /> Новости
          </button>
          <button
            onClick={() => setTab('factions')}
            className={`flex items-center gap-2 px-6 py-2.5 font-display text-sm uppercase tracking-widest border transition-all ${tab === 'factions' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
          >
            <Icon name="Users" size={15} /> Фракции
          </button>
          <button
            onClick={() => setTab('promos')}
            className={`flex items-center gap-2 px-6 py-2.5 font-display text-sm uppercase tracking-widest border transition-all ${tab === 'promos' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
          >
            <Icon name="Tag" size={15} /> Промокоды
          </button>
          <button
            onClick={() => setTab('categories')}
            className={`flex items-center gap-2 px-6 py-2.5 font-display text-sm uppercase tracking-widest border transition-all ${tab === 'categories' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
          >
            <Icon name="LayoutGrid" size={15} /> Категории
          </button>
        </div>

        {/* ── SHOP TAB ── */}
        {tab === 'shop' && (
          <>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                  <Icon name="Settings" size={26} />
                </div>
                <div>
                  <p className="font-display text-xs uppercase tracking-[0.3em] text-primary">Администрирование</p>
                  <h1 className="font-display text-4xl font-bold uppercase tracking-tight">Товары магазина</h1>
                </div>
              </div>
              <Button onClick={openNew} className="font-display uppercase tracking-widest">
                <Icon name="Plus" size={16} className="mr-2" /> Новый товар
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Icon name="Radiation" size={48} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-10">
                {grouped.map((cat) => (
                  <div key={cat.key}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-9 w-9 items-center justify-center bg-primary/10 text-primary">
                        <Icon name={cat.icon} size={18} />
                      </div>
                      <h2 className="font-display text-xl font-bold uppercase tracking-widest">{cat.label}</h2>
                      <span className="font-display text-xs text-muted-foreground">({cat.items.length})</span>
                    </div>

                    {cat.items.length === 0 ? (
                      <div className="grain rust-border bg-card p-6 text-center text-muted-foreground font-body text-sm">
                        Товаров в этой категории нет
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cat.items.map((item) => (
                          <div key={item.id} className={`grain rust-border flex flex-col sm:flex-row sm:items-center gap-4 bg-card p-5 transition-all ${!item.is_active ? 'opacity-50' : ''}`}>
                            <div className="h-11 w-11 shrink-0 overflow-hidden">
                              {item.image_url
                                ? <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                                : <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary"><Icon name={CAT_ICON[item.category] ?? 'Package'} size={22} /></div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-display text-lg font-bold uppercase tracking-wide">{item.name}</span>
                                {item.badge && <span className="font-display text-xs bg-primary/20 text-primary px-2 py-0.5 uppercase tracking-wider">{item.badge}</span>}
                                {item.is_popular && <span className="font-display text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 uppercase tracking-wider">Популярно</span>}
                                {!item.is_active && <span className="font-display text-xs bg-muted text-muted-foreground px-2 py-0.5 uppercase tracking-wider">Скрыт</span>}
                              </div>
                              <div className="mt-1 font-body text-sm text-muted-foreground line-clamp-1">{item.description}</div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <span className="font-display text-xl font-bold text-primary">{item.price.toFixed(0)} ₽</span>
                              <button
                                onClick={() => toggleActive(item)}
                                className={`flex h-8 w-8 items-center justify-center border transition-colors ${item.is_active ? 'border-green-700 text-green-500 hover:bg-green-900/20' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                                title={item.is_active ? 'Скрыть' : 'Показать'}
                              >
                                <Icon name={item.is_active ? 'Eye' : 'EyeOff'} size={15} />
                              </button>
                              <button onClick={() => openEdit(item)} className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                                <Icon name="Pencil" size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={deletingId === item.id}
                                className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                              >
                                {deletingId === item.id ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name="Trash2" size={15} />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── NEWS TAB ── */}
        {tab === 'news' && (
          <>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                  <Icon name="Radio" size={26} />
                </div>
                <div>
                  <p className="font-display text-xs uppercase tracking-[0.3em] text-primary">Администрирование</p>
                  <h1 className="font-display text-4xl font-bold uppercase tracking-tight">Новости и патчи</h1>
                </div>
              </div>
              <Button onClick={openNewNews} className="font-display uppercase tracking-widest">
                <Icon name="Plus" size={16} className="mr-2" /> Новая запись
              </Button>
            </div>

            {newsLoading ? (
              <div className="flex items-center justify-center py-24">
                <Icon name="Radiation" size={48} className="animate-spin text-primary" />
              </div>
            ) : news.length === 0 ? (
              <div className="grain rust-border bg-card p-12 text-center text-muted-foreground font-body">
                Новостей пока нет
              </div>
            ) : (
              <div className="space-y-3">
                {news.map((n) => (
                  <div key={n.id} className="grain rust-border flex flex-col sm:flex-row sm:items-center gap-4 bg-card p-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <span className="font-display text-lg font-bold uppercase tracking-wide text-primary">{n.ver}</span>
                        <span className="font-display text-xs border border-accent/50 bg-accent/10 px-2 py-0.5 uppercase tracking-wider text-accent-foreground">{n.tag}</span>
                        <span className="font-body text-xs text-muted-foreground">{n.date}</span>
                      </div>
                      <div className="font-display text-sm uppercase tracking-wide">{n.title}</div>
                      <div className="mt-1 font-body text-sm text-muted-foreground line-clamp-1">{n.text}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEditNews(n)} className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                        <Icon name="Pencil" size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteNews(n.id)}
                        disabled={deletingNewsId === n.id}
                        className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                      >
                        {deletingNewsId === n.id ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name="Trash2" size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── FACTIONS TAB ── */}
        {tab === 'factions' && (
          <>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                  <Icon name="Users" size={26} />
                </div>
                <div>
                  <p className="font-display text-xs uppercase tracking-[0.3em] text-primary">Администрирование</p>
                  <h1 className="font-display text-4xl font-bold uppercase tracking-tight">Фракции</h1>
                </div>
              </div>
              <Button onClick={openNewFaction} className="font-display uppercase tracking-widest">
                <Icon name="Plus" size={16} className="mr-2" /> Новая фракция
              </Button>
            </div>

            {factionsLoading ? (
              <div className="flex items-center justify-center py-24">
                <Icon name="Radiation" size={48} className="animate-spin text-primary" />
              </div>
            ) : factions.length === 0 ? (
              <div className="grain rust-border bg-card p-12 text-center text-muted-foreground font-body">
                Фракций пока нет
              </div>
            ) : (
              <div className="space-y-3">
                {factions.map((f) => (
                  <div key={f.id} className={`grain rust-border flex flex-col sm:flex-row sm:items-center gap-4 bg-card p-5 transition-all ${!f.is_active ? 'opacity-50' : ''}`}>
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center bg-primary/10`}>
                      <Icon name={f.icon} size={22} className={f.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-lg font-bold uppercase tracking-wide">{f.name}</span>
                        {f.is_paid
                          ? <span className="font-display text-xs bg-primary/20 text-primary px-2 py-0.5 uppercase tracking-wider border border-primary/30">Платная</span>
                          : <span className="font-display text-xs bg-green-900/30 text-green-400 px-2 py-0.5 uppercase tracking-wider border border-green-700/40">Бесплатная</span>
                        }
                        {!f.is_active && <span className="font-display text-xs bg-muted text-muted-foreground px-2 py-0.5 uppercase tracking-wider">Скрыта</span>}
                      </div>
                      <div className={`font-display text-xs uppercase tracking-widest mt-0.5 ${f.color}`}>{f.alignment}</div>
                      <div className="mt-1 font-body text-sm text-muted-foreground line-clamp-1">{f.description}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleFactionActive(f)}
                        className={`flex h-8 w-8 items-center justify-center border transition-colors ${f.is_active ? 'border-green-700 text-green-500 hover:bg-green-900/20' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                        title={f.is_active ? 'Скрыть' : 'Показать'}
                      >
                        <Icon name={f.is_active ? 'Eye' : 'EyeOff'} size={15} />
                      </button>
                      <button onClick={() => openEditFaction(f)} className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                        <Icon name="Pencil" size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteFaction(f.id)}
                        disabled={deletingFactionId === f.id}
                        className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                      >
                        {deletingFactionId === f.id ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name="Trash2" size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PROMOS TAB ── */}
        {tab === 'promos' && (
          <>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                  <Icon name="Tag" size={26} />
                </div>
                <div>
                  <p className="font-display text-xs uppercase tracking-[0.3em] text-primary">Администрирование</p>
                  <h1 className="font-display text-4xl font-bold uppercase tracking-tight">Промокоды</h1>
                </div>
              </div>
              <Button onClick={openNewPromo} className="font-display uppercase tracking-widest">
                <Icon name="Plus" size={16} className="mr-2" /> Новый промокод
              </Button>
            </div>

            {promosLoading ? (
              <div className="flex items-center justify-center py-24">
                <Icon name="Radiation" size={48} className="animate-spin text-primary" />
              </div>
            ) : promos.length === 0 ? (
              <div className="grain rust-border bg-card p-12 text-center text-muted-foreground font-body">
                Промокодов пока нет
              </div>
            ) : (
              <div className="space-y-3">
                {promos.map((p) => (
                  <div key={p.id} className={`grain rust-border flex flex-col sm:flex-row sm:items-center gap-4 bg-card p-5 transition-all ${!p.is_active ? 'opacity-50' : ''}`}>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary/10">
                      <Icon name={p.type === 'balance' ? 'Wallet' : 'Percent'} size={22} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <code className="font-display text-lg font-bold tracking-widest text-primary">{p.code}</code>
                        <span className={`font-display text-xs px-2 py-0.5 uppercase tracking-wider border ${p.type === 'balance' ? 'bg-green-900/30 text-green-400 border-green-700/40' : 'bg-primary/20 text-primary border-primary/30'}`}>
                          {p.type === 'balance' ? `+${p.value} ₽` : `${p.value}% скидка`}
                        </span>
                        {p.category && (
                          <span className="font-display text-xs px-2 py-0.5 uppercase tracking-wider border border-border text-muted-foreground">
                            {PROMO_CATEGORIES.find(c => c.key === p.category)?.label ?? p.category}
                          </span>
                        )}
                        {!p.is_active && (
                          <span className="font-display text-xs px-2 py-0.5 uppercase tracking-wider border border-border bg-muted text-muted-foreground">Неактивен</span>
                        )}
                      </div>
                      <div className="mt-1 flex gap-4 text-xs font-body text-muted-foreground">
                        <span>Использований: {p.used_count}{p.max_uses ? ` / ${p.max_uses}` : ''}</span>
                        {p.expires_at && <span>До: {new Date(p.expires_at).toLocaleDateString('ru-RU')}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTogglePromo(p)}
                        className={`flex h-8 w-8 items-center justify-center border transition-colors ${p.is_active ? 'border-green-700 text-green-500 hover:bg-green-900/20' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                        title={p.is_active ? 'Деактивировать' : 'Активировать'}
                      >
                        <Icon name={p.is_active ? 'Eye' : 'EyeOff'} size={15} />
                      </button>
                      <button
                        onClick={() => { setIsNewPromo(false); setEditPromo({ ...p }); }}
                        className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Icon name="Pencil" size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Shop Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closeEdit}>
          <div className="grain rust-border w-full max-w-lg bg-card" onClick={(e) => e.stopPropagation()}>
            <div className="hazard-stripe h-1 w-full" />
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight">{isNew ? 'Новый товар' : 'Редактировать'}</h2>
                <button onClick={closeEdit} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Категория</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button key={c.key} onClick={() => setEditItem({ ...editItem, category: c.key })}
                        className={`px-3 py-1.5 font-display text-xs uppercase tracking-widest border transition-colors ${editItem.category === c.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Название</label>
                  <input className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                    value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} placeholder="Название товара" />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Описание</label>
                  <textarea className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary resize-none"
                    rows={3} value={editItem.description || ''} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} placeholder="Что входит в товар..." />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Цена ₽</label>
                    <input type="number" className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                      value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Бейдж</label>
                    <input className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                      value={editItem.badge || ''} onChange={(e) => setEditItem({ ...editItem, badge: e.target.value || null })} placeholder="Популярно" />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Порядок</label>
                    <input type="number" className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                      value={editItem.sort_order} onChange={(e) => setEditItem({ ...editItem, sort_order: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-primary" checked={editItem.is_popular} onChange={(e) => setEditItem({ ...editItem, is_popular: e.target.checked })} />
                    <span className="font-display text-xs uppercase tracking-widest">Популярно</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-primary" checked={editItem.is_active} onChange={(e) => setEditItem({ ...editItem, is_active: e.target.checked })} />
                    <span className="font-display text-xs uppercase tracking-widest">Активен</span>
                  </label>
                </div>

                {/* Image upload */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Картинка товара</label>
                  {editItem.image_url ? (
                    <div className="relative">
                      <img src={editItem.image_url} alt="" className="w-full h-40 object-cover border border-border" />
                      <button
                        onClick={() => setEditItem({ ...editItem, image_url: null })}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center bg-black/60 text-white hover:bg-destructive transition-colors"
                        title="Удалить картинку"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-background h-28 cursor-pointer hover:border-primary/60 transition-colors ${uploadingImage ? 'opacity-60 pointer-events-none' : ''}`}>
                      {uploadingImage
                        ? <Icon name="Loader" size={24} className="animate-spin text-primary" />
                        : <Icon name="ImagePlus" size={24} className="text-muted-foreground" />}
                      <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                        {uploadingImage ? 'Загружаю...' : 'Выбрать файл'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={handleSave} disabled={saving} className="flex-1 font-display uppercase tracking-widest">
                  {saving ? <Icon name="Loader" size={16} className="mr-2 animate-spin" /> : <Icon name="Save" size={16} className="mr-2" />}
                  {isNew ? 'Создать' : 'Сохранить'}
                </Button>
                <Button variant="outline" onClick={closeEdit} className="font-display uppercase tracking-widest border-border">Отмена</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Edit Modal */}
      {editNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closeEditNews}>
          <div className="grain rust-border w-full max-w-lg bg-card" onClick={(e) => e.stopPropagation()}>
            <div className="hazard-stripe h-1 w-full" />
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight">{isNewNews ? 'Новая запись' : 'Редактировать новость'}</h2>
                <button onClick={closeEditNews} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={20} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Версия / Патч</label>
                    <input className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                      value={editNews.ver} onChange={(e) => setEditNews({ ...editNews, ver: e.target.value })} placeholder="Патч 1.8.0" />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Дата</label>
                    <input className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                      value={editNews.date} onChange={(e) => setEditNews({ ...editNews, date: e.target.value })} placeholder="22.06.2026" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Тег</label>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((t) => (
                      <button key={t} onClick={() => setEditNews({ ...editNews, tag: t })}
                        className={`px-3 py-1.5 font-display text-xs uppercase tracking-widest border transition-colors ${editNews.tag === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Заголовок</label>
                  <input className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                    value={editNews.title} onChange={(e) => setEditNews({ ...editNews, title: e.target.value })} placeholder="Что нового в этом патче?" />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Текст</label>
                  <textarea className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary resize-none"
                    rows={4} value={editNews.text} onChange={(e) => setEditNews({ ...editNews, text: e.target.value })} placeholder="Описание изменений..." />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Порядок</label>
                  <input type="number" className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                    value={editNews.sort_order} onChange={(e) => setEditNews({ ...editNews, sort_order: parseInt(e.target.value) || 0 })} />
                </div>

                {/* Image upload */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Картинка новости</label>
                  {editNews.image_url ? (
                    <div className="relative">
                      <img src={editNews.image_url} alt="" className="w-full h-40 object-cover border border-border" />
                      <button
                        onClick={() => setEditNews({ ...editNews, image_url: null })}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center bg-black/60 text-white hover:bg-destructive transition-colors"
                        title="Удалить картинку"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-background h-28 cursor-pointer hover:border-primary/60 transition-colors ${uploadingNewsImage ? 'opacity-60 pointer-events-none' : ''}`}>
                      {uploadingNewsImage
                        ? <Icon name="Loader" size={24} className="animate-spin text-primary" />
                        : <Icon name="ImagePlus" size={24} className="text-muted-foreground" />}
                      <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                        {uploadingNewsImage ? 'Загружаю...' : 'Выбрать файл'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleNewsImageUpload(f); }}
                      />
                    </label>
                  )}
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={handleSaveNews} disabled={savingNews} className="flex-1 font-display uppercase tracking-widest">
                  {savingNews ? <Icon name="Loader" size={16} className="mr-2 animate-spin" /> : <Icon name="Save" size={16} className="mr-2" />}
                  {isNewNews ? 'Создать' : 'Сохранить'}
                </Button>
                <Button variant="outline" onClick={closeEditNews} className="font-display uppercase tracking-widest border-border">Отмена</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Faction Edit Modal */}
      {editFaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closeEditFaction}>
          <div className="grain rust-border w-full max-w-lg bg-card max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="hazard-stripe h-1 w-full" />
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight">{isNewFaction ? 'Новая фракция' : 'Редактировать фракцию'}</h2>
                <button onClick={closeEditFaction} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={20} /></button>
              </div>
              <div className="space-y-4">

                {/* Name */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Название</label>
                  <input className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                    value={editFaction.name} onChange={(e) => setEditFaction({ ...editFaction, name: e.target.value })} placeholder="Название фракции" />
                </div>

                {/* Alignment */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Идеология</label>
                  <input className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                    value={editFaction.alignment} onChange={(e) => setEditFaction({ ...editFaction, alignment: e.target.value })} placeholder="Порядок, Хаос, Закон..." />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Описание</label>
                  <textarea className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary resize-none"
                    rows={4} value={editFaction.description} onChange={(e) => setEditFaction({ ...editFaction, description: e.target.value })} placeholder="Описание фракции..." />
                </div>

                {/* Icon */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Иконка (lucide)</label>
                  <input className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                    value={editFaction.icon} onChange={(e) => setEditFaction({ ...editFaction, icon: e.target.value })} placeholder="Shield, Skull, Flame..." />
                </div>

                {/* Color */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Цвет</label>
                  <div className="flex flex-wrap gap-2">
                    {FACTION_COLORS.map((c) => (
                      <button key={c} onClick={() => setEditFaction({ ...editFaction, color: c })}
                        className={`px-3 py-1.5 font-display text-xs border transition-colors ${editFaction.color === c ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}>
                        <span className={c}>■</span> {c.replace('text-', '').replace('-400', '').replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort + toggles */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Порядок</label>
                    <input type="number" className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                      value={editFaction.sort_order} onChange={(e) => setEditFaction({ ...editFaction, sort_order: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="flex flex-col justify-end gap-2 pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-primary" checked={editFaction.is_paid} onChange={(e) => setEditFaction({ ...editFaction, is_paid: e.target.checked })} />
                      <span className="font-display text-xs uppercase tracking-widest">Платная</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="accent-primary" checked={editFaction.is_active} onChange={(e) => setEditFaction({ ...editFaction, is_active: e.target.checked })} />
                      <span className="font-display text-xs uppercase tracking-widest">Активна</span>
                    </label>
                  </div>
                </div>

                {/* Icon upload */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Своя иконка (картинка)</label>
                  {editFaction.icon_url ? (
                    <div className="relative flex items-center gap-3">
                      <img src={editFaction.icon_url} alt="" className="h-14 w-14 object-contain border border-border bg-background p-1" />
                      <span className="font-body text-xs text-muted-foreground">Загружена своя иконка</span>
                      <button
                        onClick={() => setEditFaction({ ...editFaction, icon_url: null })}
                        className="ml-auto flex h-7 w-7 items-center justify-center border border-border text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                        title="Удалить иконку"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex items-center gap-3 border border-dashed border-border bg-background px-4 py-3 cursor-pointer hover:border-primary/60 transition-colors ${uploadingFactionIcon ? 'opacity-60 pointer-events-none' : ''}`}>
                      {uploadingFactionIcon
                        ? <Icon name="Loader" size={20} className="animate-spin text-primary shrink-0" />
                        : <Icon name="ImagePlus" size={20} className="text-muted-foreground shrink-0" />}
                      <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                        {uploadingFactionIcon ? 'Загружаю...' : 'Загрузить своё изображение'}
                      </span>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFactionIconUpload(f); }} />
                    </label>
                  )}
                  {!editFaction.icon_url && (
                    <p className="mt-1 font-body text-xs text-muted-foreground">Если не загружена — используется lucide-иконка выше</p>
                  )}
                </div>

                {/* Preview */}
                <div className="grain rust-border bg-background p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-card border border-border overflow-hidden">
                    {editFaction.icon_url
                      ? <img src={editFaction.icon_url} alt="" className="h-full w-full object-contain p-1" />
                      : <Icon name={editFaction.icon} size={24} className={editFaction.color} fallback="Shield" />
                    }
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold uppercase tracking-wide">{editFaction.name || 'Название'}</div>
                    <div className={`font-display text-xs uppercase tracking-widest ${editFaction.color}`}>{editFaction.alignment || 'Идеология'}</div>
                  </div>
                  {editFaction.is_paid
                    ? <span className="ml-auto font-display text-xs px-2 py-0.5 bg-primary/20 text-primary border border-primary/30 uppercase tracking-wider">Платная</span>
                    : <span className="ml-auto font-display text-xs px-2 py-0.5 bg-green-900/30 text-green-400 border border-green-700/40 uppercase tracking-wider">Бесплатная</span>
                  }
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={handleSaveFaction} disabled={savingFaction} className="flex-1 font-display uppercase tracking-widest">
                  {savingFaction ? <Icon name="Loader" size={16} className="mr-2 animate-spin" /> : <Icon name="Save" size={16} className="mr-2" />}
                  {isNewFaction ? 'Создать' : 'Сохранить'}
                </Button>
                <Button variant="outline" onClick={closeEditFaction} className="font-display uppercase tracking-widest border-border">Отмена</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promo Edit Modal */}
      {editPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closePromo}>
          <div className="grain rust-border w-full max-w-lg bg-card" onClick={(e) => e.stopPropagation()}>
            <div className="hazard-stripe h-1 w-full" />
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight">{isNewPromo ? 'Новый промокод' : 'Редактировать'}</h2>
                <button onClick={closePromo} className="text-muted-foreground hover:text-foreground"><Icon name="X" size={20} /></button>
              </div>
              <div className="space-y-4">
                {/* Code */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Код промокода</label>
                  <input
                    className="w-full border border-border bg-background px-3 py-2 font-display text-sm uppercase tracking-widest text-foreground outline-none focus:border-primary"
                    value={editPromo.code || ''}
                    onChange={(e) => setEditPromo({ ...editPromo, code: e.target.value.toUpperCase() })}
                    placeholder="STALKER2025"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Тип</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditPromo({ ...editPromo, type: 'discount' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-display text-sm uppercase tracking-widest border transition-colors ${editPromo.type === 'discount' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                    >
                      <Icon name="Percent" size={15} /> Скидка %
                    </button>
                    <button
                      onClick={() => setEditPromo({ ...editPromo, type: 'balance' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-display text-sm uppercase tracking-widest border transition-colors ${editPromo.type === 'balance' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                    >
                      <Icon name="Wallet" size={15} /> Баланс ₽
                    </button>
                  </div>
                </div>

                {/* Value */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">
                    {editPromo.type === 'discount' ? 'Скидка (%)' : 'Сумма (₽)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={editPromo.type === 'discount' ? 100 : undefined}
                    className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                    value={editPromo.value ?? ''}
                    onChange={(e) => setEditPromo({ ...editPromo, value: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                {/* Category — только для скидок */}
                {editPromo.type === 'discount' && (
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Категория товаров</label>
                    <div className="flex flex-wrap gap-2">
                      {PROMO_CATEGORIES.map((c) => (
                        <button
                          key={String(c.key)}
                          onClick={() => setEditPromo({ ...editPromo, category: c.key })}
                          className={`px-3 py-1.5 font-display text-xs uppercase tracking-widest border transition-colors ${editPromo.category === c.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Max uses + expires */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Макс. использований</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                      value={editPromo.max_uses ?? ''}
                      onChange={(e) => setEditPromo({ ...editPromo, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Без лимита"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Дата окончания</label>
                    <input
                      type="date"
                      className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                      value={editPromo.expires_at ? editPromo.expires_at.slice(0, 10) : ''}
                      onChange={(e) => setEditPromo({ ...editPromo, expires_at: e.target.value || null })}
                    />
                  </div>
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-primary h-4 w-4"
                    checked={editPromo.is_active ?? true}
                    onChange={(e) => setEditPromo({ ...editPromo, is_active: e.target.checked })}
                  />
                  <span className="font-display text-xs uppercase tracking-widest">Активен</span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={handleSavePromo} disabled={savingPromo} className="flex-1 font-display uppercase tracking-widest">
                  {savingPromo ? <Icon name="Loader" size={16} className="mr-2 animate-spin" /> : <Icon name="Save" size={16} className="mr-2" />}
                  {isNewPromo ? 'Создать' : 'Сохранить'}
                </Button>
                <Button variant="outline" onClick={closePromo} className="font-display uppercase tracking-widest border-border">Отмена</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORIES TAB ── */}
      {tab === 'categories' && (
        <div className="flex gap-8">
          {/* List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                  <Icon name="LayoutGrid" size={26} />
                </div>
                <div>
                  <p className="font-display text-xs uppercase tracking-[0.3em] text-primary">Администрирование</p>
                  <h1 className="font-display text-3xl font-bold uppercase tracking-tight">Категории магазина</h1>
                </div>
              </div>
              <Button onClick={openNewCat} className="font-display uppercase tracking-widest">
                <Icon name="Plus" size={16} className="mr-2" /> Добавить
              </Button>
            </div>

            {categoriesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Icon name="Loader" size={32} className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="grain rust-border flex items-center gap-4 bg-card p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
                      <Icon name={cat.icon} size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-base font-semibold uppercase tracking-wide">{cat.label}</div>
                      <div className="font-body text-xs text-muted-foreground">ключ: {cat.key} · порядок: {cat.sort_order}</div>
                    </div>
                    <span className={`font-display text-xs uppercase tracking-widest ${cat.is_active ? 'text-green-400' : 'text-muted-foreground'}`}>
                      {cat.is_active ? 'Активна' : 'Скрыта'}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-border font-display uppercase" onClick={() => { setIsNewCat(false); setEditCat({ ...cat }); }}>
                        <Icon name="Pencil" size={14} />
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-800 text-red-400 hover:bg-red-900/20 font-display uppercase" onClick={() => handleDeleteCat(cat.id)}>
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="grain rust-border bg-card p-10 text-center text-muted-foreground font-display uppercase tracking-widest">
                    Категорий пока нет
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit panel */}
          {editCat && (
            <div className="w-96 shrink-0">
              <div className="grain rust-border bg-card p-6 space-y-5 sticky top-24">
                <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                  {isNewCat ? 'Новая категория' : 'Редактировать'}
                </h2>

                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Название</label>
                  <input
                    className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                    value={editCat.label}
                    onChange={(e) => setEditCat({ ...editCat, label: e.target.value })}
                    placeholder="Привилегии"
                  />
                </div>

                {isNewCat && (
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Ключ (латиница)</label>
                    <input
                      className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                      value={editCat.key}
                      onChange={(e) => setEditCat({ ...editCat, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      placeholder="privilege"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Иконка</label>
                  <div className="flex flex-wrap gap-2">
                    {LUCIDE_ICONS.map((ico) => (
                      <button
                        key={ico}
                        title={ico}
                        onClick={() => setEditCat({ ...editCat, icon: ico })}
                        className={`flex h-9 w-9 items-center justify-center border transition-colors ${editCat.icon === ico ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                      >
                        <Icon name={ico} size={16} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Порядок сортировки</label>
                  <input
                    type="number"
                    className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                    value={editCat.sort_order}
                    onChange={(e) => setEditCat({ ...editCat, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-primary h-4 w-4"
                    checked={editCat.is_active}
                    onChange={(e) => setEditCat({ ...editCat, is_active: e.target.checked })}
                  />
                  <span className="font-display text-xs uppercase tracking-widest">Активна (видна в магазине)</span>
                </label>

                <div className="flex gap-3">
                  <Button onClick={handleSaveCat} disabled={savingCat} className="flex-1 font-display uppercase tracking-widest">
                    {savingCat ? <Icon name="Loader" size={16} className="mr-2 animate-spin" /> : <Icon name="Save" size={16} className="mr-2" />}
                    {isNewCat ? 'Создать' : 'Сохранить'}
                  </Button>
                  <Button variant="outline" onClick={closeCat} className="font-display uppercase tracking-widest border-border">Отмена</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}