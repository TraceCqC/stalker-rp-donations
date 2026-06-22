import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getSessionId } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const ADMIN_URL = 'https://functions.poehali.dev/b71dc419-3bb9-4658-8144-bbc49fb591dd';

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
};

const CATEGORIES = [
  { key: 'privilege', label: 'Привилегии', icon: 'Shield' },
  { key: 'items', label: 'Снаряжение', icon: 'Package' },
  { key: 'currency', label: 'Валюта', icon: 'Coins' },
  { key: 'transport', label: 'Транспорт', icon: 'Car' },
  { key: 'furniture', label: 'Фурнитура', icon: 'Armchair' },
];

const CAT_ICON: Record<string, string> = {
  privilege: 'Shield',
  items: 'Package',
  currency: 'Coins',
  transport: 'Car',
  furniture: 'Armchair',
};

function authHeaders() {
  return { 'Content-Type': 'application/json', 'X-Session-Id': getSessionId() || '' };
}

export default function Admin() {
  const { user, loading: authLoading, loginWithSteam } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [editItem, setEditItem] = useState<ShopItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  useEffect(() => {
    if (!authLoading && user) fetchItems();
    else if (!authLoading && !user) setLoading(false);
  }, [authLoading, user]);

  const openNew = () => {
    setIsNew(true);
    setEditItem({ id: 0, ...EMPTY_ITEM });
  };

  const openEdit = (item: ShopItem) => {
    setIsNew(false);
    setEditItem({ ...item });
  };

  const closeEdit = () => setEditItem(null);

  const handleSave = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const url = isNew ? ADMIN_URL : `${ADMIN_URL}?id=${editItem.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(editItem),
      });
      const data = await res.json();
      if (data.item) {
        toast({ title: isNew ? 'Товар создан' : 'Сохранено' });
        closeEdit();
        fetchItems();
      } else {
        toast({ title: 'Ошибка', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить товар?')) return;
    setDeletingId(id);
    try {
      await fetch(`${ADMIN_URL}?id=${id}`, { method: 'DELETE', headers: authHeaders() });
      toast({ title: 'Удалено' });
      fetchItems();
    } catch {
      toast({ title: 'Ошибка', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (item: ShopItem) => {
    await fetch(`${ADMIN_URL}?id=${item.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ ...item, is_active: !item.is_active }),
    });
    fetchItems();
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

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category === cat.key),
  }));

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
        {/* Title */}
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
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary/10 text-primary">
                          <Icon name={CAT_ICON[item.category] ?? 'Package'} size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display text-lg font-bold uppercase tracking-wide">{item.name}</span>
                            {item.badge && (
                              <span className="font-display text-xs bg-primary/20 text-primary px-2 py-0.5 uppercase tracking-wider">{item.badge}</span>
                            )}
                            {item.is_popular && (
                              <span className="font-display text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 uppercase tracking-wider">Популярно</span>
                            )}
                            {!item.is_active && (
                              <span className="font-display text-xs bg-muted text-muted-foreground px-2 py-0.5 uppercase tracking-wider">Скрыт</span>
                            )}
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
                          <button
                            onClick={() => openEdit(item)}
                            className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                            title="Редактировать"
                          >
                            <Icon name="Pencil" size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                            title="Удалить"
                          >
                            {deletingId === item.id
                              ? <Icon name="Loader" size={15} className="animate-spin" />
                              : <Icon name="Trash2" size={15} />}
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
      </div>

      {/* Edit / Create Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closeEdit}>
          <div className="grain rust-border w-full max-w-lg bg-card" onClick={(e) => e.stopPropagation()}>
            <div className="hazard-stripe h-1 w-full" />
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                  {isNew ? 'Новый товар' : 'Редактировать'}
                </h2>
                <button onClick={closeEdit} className="text-muted-foreground hover:text-foreground">
                  <Icon name="X" size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Категория</label>
                  <div className="flex gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.key}
                        onClick={() => setEditItem({ ...editItem, category: c.key })}
                        className={`flex-1 py-2 font-display text-xs uppercase tracking-widest border transition-colors ${editItem.category === c.key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Название</label>
                  <input
                    className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                    value={editItem.name}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    placeholder="Название товара"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Описание</label>
                  <textarea
                    className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary resize-none"
                    rows={3}
                    value={editItem.description || ''}
                    onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                    placeholder="Что входит в товар..."
                  />
                </div>

                {/* Price + Badge + Sort */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Цена ₽</label>
                    <input
                      type="number"
                      className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                      value={editItem.price}
                      onChange={(e) => setEditItem({ ...editItem, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Бейдж</label>
                    <input
                      className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                      value={editItem.badge || ''}
                      onChange={(e) => setEditItem({ ...editItem, badge: e.target.value || null })}
                      placeholder="Популярно"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-xs uppercase tracking-widest text-muted-foreground">Порядок</label>
                    <input
                      type="number"
                      className="w-full border border-border bg-background px-3 py-2 font-body text-sm text-foreground outline-none focus:border-primary"
                      value={editItem.sort_order}
                      onChange={(e) => setEditItem({ ...editItem, sort_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={editItem.is_popular}
                      onChange={(e) => setEditItem({ ...editItem, is_popular: e.target.checked })}
                    />
                    <span className="font-display text-xs uppercase tracking-widest">Популярно</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={editItem.is_active}
                      onChange={(e) => setEditItem({ ...editItem, is_active: e.target.checked })}
                    />
                    <span className="font-display text-xs uppercase tracking-widest">Активен</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button onClick={handleSave} disabled={saving} className="flex-1 font-display uppercase tracking-widest">
                  {saving ? <Icon name="Loader" size={16} className="mr-2 animate-spin" /> : <Icon name="Save" size={16} className="mr-2" />}
                  {isNew ? 'Создать' : 'Сохранить'}
                </Button>
                <Button variant="outline" onClick={closeEdit} className="font-display uppercase tracking-widest border-border">
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}