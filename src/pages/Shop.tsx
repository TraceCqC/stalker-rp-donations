import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { getSessionId } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const SHOP_ITEMS_URL = 'https://functions.poehali.dev/b01b5e13-7c62-4290-b55e-6ebec5ad9fd4';
const CREATE_ORDER_URL = 'https://functions.poehali.dev/5fedc143-b342-4e15-9b52-04185e36c447';

interface ShopItem {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  badge: string | null;
  is_popular: boolean;
  sort_order: number;
  image_url: string | null;
}

const CATEGORIES = [
  { key: 'all', label: 'Все товары', icon: 'LayoutGrid' },
  { key: 'privilege', label: 'Привилегии', icon: 'Shield' },
  { key: 'items', label: 'Снаряжение', icon: 'Package' },
  { key: 'currency', label: 'Валюта Зоны', icon: 'Coins' },
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

const BADGE_COLOR: Record<string, string> = {
  'Популярно': 'bg-primary text-primary-foreground',
  'Топ': 'bg-red-600 text-white',
  'Выгодно': 'bg-green-700 text-white',
  'Максимум': 'bg-purple-700 text-white',
  'Редкий': 'bg-blue-700 text-white',
};

export default function Shop() {
  const { user, loading: authLoading, loginWithSteam } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [buyingId, setBuyingId] = useState<number | null>(null);

  useEffect(() => {
    fetch(SHOP_ITEMS_URL)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'all'
    ? items
    : items.filter((i) => i.category === activeCategory);

  const handleBuy = async (item: ShopItem) => {
    if (!user) {
      loginWithSteam();
      return;
    }
    setBuyingId(item.id);
    try {
      const res = await fetch(CREATE_ORDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': getSessionId() || '',
        },
        body: JSON.stringify({ item_id: item.id }),
      });
      const data = await res.json();
      if (data.pay_url) {
        window.location.href = data.pay_url;
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось создать заказ', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Проблема с соединением', variant: 'destructive' });
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-30">
        <div className="container flex items-center justify-between px-4 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground">
              <Icon name="Radiation" size={18} />
            </div>
            <span className="font-display text-lg font-bold uppercase tracking-widest">
              Night <span className="text-primary">Zone</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            {!authLoading && (
              user ? (
                <Button variant="outline" size="sm" className="font-display uppercase tracking-widest border-border" onClick={() => navigate('/cabinet')}>
                  <Icon name="User" size={15} className="mr-2" />
                  {user.username}
                </Button>
              ) : (
                <Button size="sm" className="font-display uppercase tracking-widest" onClick={loginWithSteam}>
                  <Icon name="LogIn" size={15} className="mr-2" />
                  Войти
                </Button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative border-b border-border bg-card/30 py-16">
        <div className="hazard-stripe absolute top-0 left-0 right-0 h-1 opacity-60" />
        <div className="container px-4 text-center">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-primary mb-3">Донат-магазин</p>
          <h1 className="font-display text-5xl font-bold uppercase tracking-tight md:text-6xl">
            Снаряжение <span className="text-primary">Зоны</span>
          </h1>
          <p className="mt-4 font-body text-muted-foreground max-w-xl mx-auto">
            Поддержи сервер и получи привилегии, снаряжение или внутриигровую валюту. Все покупки мгновенно активируются на аккаунте.
          </p>
          {!user && !authLoading && (
            <Button onClick={loginWithSteam} className="mt-8 font-display uppercase tracking-widest animate-radiate" size="lg">
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти через Steam для покупки
            </Button>
          )}
        </div>
        <div className="hazard-stripe absolute bottom-0 left-0 right-0 h-1 opacity-60" />
      </div>

      <div className="container px-4 py-12">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`grain flex items-center gap-2 px-5 py-2.5 font-display text-sm uppercase tracking-widest transition-all border ${
                activeCategory === cat.key
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <Icon name={cat.icon} size={16} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Icon name="Radiation" size={48} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`grain rust-border relative flex flex-col bg-card transition-all hover:border-primary/50 ${item.is_popular ? 'ring-1 ring-primary/40' : ''}`}
              >
                {/* Badge */}
                {item.badge && (
                  <div className={`absolute top-4 right-4 px-2.5 py-1 font-display text-xs uppercase tracking-widest ${BADGE_COLOR[item.badge] ?? 'bg-muted text-foreground'}`}>
                    {item.badge}
                  </div>
                )}

                {/* Image */}
                {item.image_url && (
                  <div className="w-full h-48 overflow-hidden border-b border-border">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-6 flex-1">
                  {/* Icon (only if no image) */}
                  {!item.image_url && (
                    <div className="mb-5 flex h-14 w-14 items-center justify-center bg-primary/10 text-primary">
                      <Icon name={CAT_ICON[item.category] ?? 'Package'} size={30} />
                    </div>
                  )}

                  {/* Category label */}
                  <p className="font-display text-xs uppercase tracking-[0.3em] text-primary mb-1">
                    {CATEGORIES.find((c) => c.key === item.category)?.label}
                  </p>

                  {/* Name */}
                  <h3 className="font-display text-2xl font-bold uppercase tracking-tight leading-tight">
                    {item.name}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 font-body text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="border-t border-border p-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-display text-3xl font-bold text-primary">
                      {item.price.toFixed(0)} <span className="text-lg">₽</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleBuy(item)}
                    disabled={buyingId === item.id}
                    className="font-display uppercase tracking-widest shrink-0"
                  >
                    {buyingId === item.id ? (
                      <Icon name="Loader" size={16} className="animate-spin mr-2" />
                    ) : (
                      <Icon name="ShoppingCart" size={16} className="mr-2" />
                    )}
                    {user ? 'Купить' : 'Войти'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info block */}
        <div className="mt-16 grain rust-border bg-card p-8 grid gap-6 sm:grid-cols-3">
          {[
            { icon: 'Zap', title: 'Мгновенно', desc: 'Привилегии активируются автоматически после оплаты' },
            { icon: 'ShieldCheck', title: 'Безопасно', desc: 'Оплата через Robokassa — карты РФ, СБП, ЮMoney' },
            { icon: 'HeartHandshake', title: 'Поддержка', desc: 'Все средства идут на развитие и аренду сервера' },
          ].map((b) => (
            <div key={b.title} className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
                <Icon name={b.icon} size={20} />
              </div>
              <div>
                <div className="font-display text-sm uppercase tracking-widest">{b.title}</div>
                <div className="mt-1 font-body text-sm text-muted-foreground">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}