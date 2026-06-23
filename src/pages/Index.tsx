import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const HERO = 'https://cdn.poehali.dev/projects/bb154877-b93f-4589-958f-2fb7ea6b58fe/files/8f9ca15d-a21a-4ffe-994d-3d6f8ad6d774.jpg';
const SIGN = 'https://cdn.poehali.dev/projects/bb154877-b93f-4589-958f-2fb7ea6b58fe/files/9d913198-f058-4331-9e65-3927b06a9375.jpg';


const SERVER_IP = '94.127.218.85:2302';

const NAV = [
  { id: 'lore', label: 'Лор', icon: 'BookOpen' },
  { id: 'factions', label: 'Фракции', icon: 'Users' },
  { id: 'connect', label: 'Подключение', icon: 'Wifi' },
  { id: 'news', label: 'Новости', icon: 'Radio' },

];

const LORE_CHAPTERS = [
  {
    title: 'СЕРДЦЕ ЗОНЫ',
    content: `В центре Зоны находится нестабильная аномальная структура — Ядро.

Это не объект.
Это сознание.

Предположительно оно способно:
• создавать выбросы
• менять реальность
• подчинять волю

С ним связана каждая аномалия.
Каждый мутант.
Каждый шепот в ночи.`,
  },
  {
    title: 'VI. 2019 ГОД — ВНЕОЧЕРЕДНОЙ ВЫБРОС',
    content: `К этому времени Зона расширилась на 37%.

Происходят:
• неконтролируемые выбросы
• новые типы мутантов
• исчезновения целых отрядов
• радиационные дожди

Связь с внешним миром нестабильна.
Военные блокпосты деградировали. Коррупция процветает.

Теперь Зона проникает в людей так же, как люди в Зону.`,
  },
  {
    title: 'VII. МРАЧНАЯ ПРАВДА',
    content: `Многие начинают понимать: авария — не случайность.
Это эксперимент, который продолжается.

Существуют данные, что проект никогда не закрывался.
Кто-то управляет процессами из глубины.

А сталкеры — лишь подопытные.`,
  },
  {
    title: 'VIII. КОДЕКС СТАЛКЕРА',
    content: `Негласные правила:
• Не стреляй без причины
• Делись водой
• Не трогай метку мёртвых
• Уважай Периметр
• Не верь голосам`,
  },
  {
    title: 'IX. ФИНАЛ ЛОРА',
    content: `К 2019 году Зона перестаёт быть местом.
Она становится состоянием.
Ты больше не помнишь, кем был.
Ты знаешь только одно — идти дальше.

Зона скрипит под ногами.
Небо мертво.
Ветер шепчет имена потерянных.
И где-то в самой глубине
бьётся Сердце,
ждущее новых жертв.
Зона не убивает быстро.
Она стирает.`,
  },
];

const FACTIONS_URL = 'https://functions.poehali.dev/96537813-a83b-4c40-8239-6bea84d441f5';

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
}

const NEWS_URL = 'https://functions.poehali.dev/b6a922f6-e4a1-4920-afa6-ff75d1e0783e';

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

const SHOP: Record<string, { name: string; price: number; icon: string; desc: string }[]> = {
  ammo: [
    { name: 'Цинк 5.45×39 (1080)', price: 149, icon: 'Package', desc: 'Полный цинк патронов для АК-74' },
    { name: 'Дробь 12 калибр (50)', price: 79, icon: 'Package', desc: 'Картечь для дробовиков' },
    { name: 'Патроны 7.62×54 (200)', price: 189, icon: 'Package', desc: 'Для снайперских винтовок' },
    { name: 'Аптечка военная', price: 99, icon: 'Cross', desc: 'Полное восстановление HP' },
  ],
  weapon: [
    { name: 'АК-74М «Зона»', price: 349, icon: 'Crosshair', desc: 'Кастомная сборка с обвесом' },
    { name: 'СВД «Сталкер»', price: 499, icon: 'Crosshair', desc: 'Снайперская винтовка с прицелом' },
    { name: 'Сайга-12', price: 279, icon: 'Crosshair', desc: 'Помповый дробовик' },
    { name: 'Глок-17 + кобура', price: 149, icon: 'Crosshair', desc: 'Надёжный пистолет выживальщика' },
  ],
  transport: [
    { name: 'УАЗ «Буханка»', price: 599, icon: 'Truck', desc: 'Вместительный внедорожник' },
    { name: 'Нива 4×4', price: 449, icon: 'Car', desc: 'Проходимость по любой Зоне' },
    { name: 'Квадроцикл', price: 299, icon: 'Bike', desc: 'Быстрая разведка территории' },
    { name: 'Грузовик Урал', price: 899, icon: 'Truck', desc: 'Перевозка большого лута' },
  ],
  furniture: [
    { name: 'Верстак оружейника', price: 249, icon: 'Wrench', desc: 'Крафт и ремонт стволов' },
    { name: 'Сейф-шкаф', price: 199, icon: 'Lock', desc: 'Защищённое хранилище лута' },
    { name: 'Палаточный лагерь', price: 349, icon: 'Tent', desc: 'Мобильная база сталкера' },
    { name: 'Радиостанция', price: 159, icon: 'RadioTower', desc: 'Связь на дальние дистанции' },
  ],
};

const SHOP_CATS = [
  { id: 'ammo', label: 'Аммуниция', icon: 'Package' },
  { id: 'weapon', label: 'Игровое оружие', icon: 'Crosshair' },
  { id: 'transport', label: 'Транспорт', icon: 'Truck' },
  { id: 'furniture', label: 'Фурнитура', icon: 'Wrench' },
];

export default function Index() {
  const { toast } = useToast();
  const [active, setActive] = useState('lore');
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const [openLore, setOpenLore] = useState<string | null>(null);
  const { user, purchases, loading: authLoading, loginWithSteam, logout } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [factions, setFactions] = useState<FactionItem[]>([]);

  useEffect(() => {
    fetch(NEWS_URL)
      .then(r => r.json())
      .then(d => setNews(d.news || []))
      .catch(() => {});
    fetch(FACTIONS_URL)
      .then(r => r.json())
      .then(d => setFactions(d.factions || []))
      .catch(() => {});
  }, []);

  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [cart, setCart] = useState<{ name: string; price: number; icon: string; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (item: { name: string; price: number; icon: string }) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.name === item.name);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const changeQty = (name: string, delta: number) => {
    setCart(prev =>
      prev.map(i => i.name === name ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    );
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#cabinet')) {
      const query = hash.replace('#cabinet?', '').replace('#cabinet', '');
      const sid = new URLSearchParams(query).get('sid');
      if (sid) {
        import('@/hooks/use-auth').then(({ setSessionId }) => {
          setSessionId(sid);
          window.location.reload();
        });
        return;
      }
      setCabinetOpen(true);
      window.history.replaceState({}, '', '/');
    } else if (window.location.search.includes('cabinet=1')) {
      setCabinetOpen(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);



  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const copyIp = () => {
    navigator.clipboard.writeText(SERVER_IP);
    toast({ title: 'IP скопирован', description: 'Вставь адрес в DayZ Launcher и заходи в Зону.' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground animate-radiate">
              <Icon name="Radiation" size={22} />
            </div>
            <span className="font-display text-xl font-bold tracking-widest uppercase">
              Night <span className="text-primary">Zone</span>
            </span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className={`flex items-center gap-2 px-4 py-2 font-display text-sm uppercase tracking-wider transition-colors ${
                  active === n.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={n.icon} size={16} />
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {cartCount > 0 && (
              <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 border border-primary/60 bg-card px-3 py-1.5 transition-colors hover:border-primary">
                <Icon name="ShoppingCart" size={16} className="text-primary" />
                <span className="font-display text-sm font-bold text-primary">{cartTotal} ₽</span>
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground">{cartCount}</span>
              </button>
            )}
            {!authLoading && (
              user ? (
                <button onClick={() => setCabinetOpen(true)} className="flex items-center gap-2 border border-border bg-card px-3 py-1.5 transition-colors hover:border-primary">
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt="" className="h-6 w-6 object-cover" />
                    : <Icon name="User" size={16} className="text-primary" />
                  }
                  <span className="font-display text-sm uppercase tracking-wider">{user.username}</span>
                </button>
              ) : (
                <>
                  <a href="/shop" className="hidden md:flex items-center gap-2 border border-primary/40 bg-card px-3 py-1.5 font-display text-sm uppercase tracking-wider text-primary transition-colors hover:border-primary hover:bg-primary/10">
                    <Icon name="ShoppingCart" size={15} />
                    Магазин
                  </a>
                  <Button variant="outline" size="sm" onClick={loginWithSteam} className="border-primary/40 font-display uppercase tracking-wider">
                    <Icon name="LogIn" size={16} className="mr-1" /> Steam
                  </Button>
                </>
              )
            )}
            <Button onClick={() => scrollTo('connect')} className="font-display uppercase tracking-wider">
              <Icon name="Zap" size={16} className="mr-1" /> Играть
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative grain flex min-h-screen items-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-0">
          <img src={HERO} alt="Зона" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
        </div>
        <div className="container relative z-10 px-4 py-20">
          <div className="max-w-3xl animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 border border-primary/40 bg-background/60 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-flicker" />
              <span className="font-display text-xs uppercase tracking-[0.3em] text-primary">Сервер онлайн · DayZ</span>
            </div>
            <h1 className="font-display text-6xl font-bold uppercase leading-[0.9] tracking-tight md:text-8xl">
              Добро пожаловать <br />
              <span className="text-primary animate-flicker">на Night Zone</span>
            </h1>
            <p className="mt-6 max-w-xl font-body text-lg text-muted-foreground">
              Хардкорный Stalker RP проект на DayZ. Аномалии, артефакты, фракции и борьба за выживание.
              Развивайся за счёт добровольных пожертвований.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg" onClick={() => scrollTo('connect')} className="font-display uppercase tracking-widest animate-radiate">
                <Icon name="Wifi" size={18} className="mr-2" /> Подключиться
              </Button>
              <a href="/shop">
                <Button size="lg" variant="outline" className="font-display uppercase tracking-widest border-primary/40">
                  <Icon name="ShoppingCart" size={18} className="mr-2" /> В магазин
                </Button>
              </a>
            </div>
            <div className="mt-12 flex flex-wrap gap-8">
              {[['100', 'Слотов на сервере'], ['8', 'Фракций в Зоне']].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-4xl font-bold text-primary">{n}</div>
                  <div className="font-body text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LORE */}
      <section id="lore" className="relative border-t border-border py-24">
        <div className="container px-4">
          <SectionTitle icon="BookOpen" sub="Хроники зоны" title="Лор" />
          <div className="mt-12 max-w-2xl">
            <div className="paper p-10 rotate-[-0.5deg]">
              <p className="text-xs uppercase tracking-[0.25em] opacity-50 mb-5" style={{fontFamily:'Caveat,cursive'}}>— Фрагмент из лора сервера —</p>
              <p className="whitespace-pre-line leading-loose text-xl" style={{fontFamily:'Caveat,cursive'}}>
                {LORE_CHAPTERS.find(ch => ch.title === 'IX. ФИНАЛ ЛОРА')?.content}
              </p>
            </div>
            <p className="mt-6 font-body text-sm text-muted-foreground">
              С полным лором вы можете ознакомиться{' '}
              <a
                href="https://docs.google.com/document/d/1o3YvJt79dlX568GZv4aCi1p0nlbO8tBRgy3G1And5zk/edit?tab=t.0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                тут
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* FACTIONS */}
      <section id="factions" className="relative border-t border-border py-24">
        <div className="container px-4">
          <SectionTitle icon="Users" sub="Группировки Зоны" title="Фракции" />
          <p className="mt-4 max-w-2xl font-body text-muted-foreground">
            Выбери фракцию — узнай её цели, базу и боевой стиль.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {factions.map((f) => {
              const isOpen = selectedFaction === String(f.id);
              return (
                <div key={f.id} className="flex flex-col">
                  <button
                    onClick={() => setSelectedFaction(isOpen ? null : String(f.id))}
                    className={`grain rust-border group flex items-center gap-4 bg-card p-6 text-left transition-all ${isOpen ? 'border-primary/70 bg-card' : 'hover:border-primary/40'}`}
                  >
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center bg-card border border-border transition-colors ${isOpen ? 'bg-primary border-primary' : 'group-hover:bg-primary/10'}`}>
                      <Icon name={f.icon} size={28} className={isOpen ? 'text-primary-foreground' : f.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-2xl font-bold uppercase tracking-wide">{f.name}</span>
                        {f.is_paid
                          ? <span className="font-display text-xs uppercase tracking-wider px-2 py-0.5 bg-primary/20 text-primary border border-primary/30">Платная</span>
                          : <span className="font-display text-xs uppercase tracking-wider px-2 py-0.5 bg-green-900/30 text-green-400 border border-green-700/40">Бесплатная</span>
                        }
                      </div>
                      <div className={`mt-1 font-display text-xs uppercase tracking-widest ${f.color}`}>{f.alignment}</div>
                    </div>
                    <Icon
                      name="ChevronDown"
                      size={20}
                      className={`shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="grain border border-t-0 border-primary/40 bg-card/80 p-6 animate-fade-in">
                      <p className="font-body text-muted-foreground">{f.description}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONNECT */}
      <section id="connect" className="relative border-t border-border py-24">
        <div className="absolute inset-0 opacity-10">
          <img src={SIGN} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="container relative px-4">
          <SectionTitle icon="Wifi" sub="Точка входа" title="IP для подключения" />
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="hazard-stripe h-3 w-full" />
            <div className="grain rust-border bg-card p-8 md:p-12 text-center">
              <Icon name="ServerCog" size={48} className="mx-auto text-primary" />
              <p className="mt-4 font-body text-sm uppercase tracking-widest text-muted-foreground">Адрес сервера DayZ</p>
              <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <code className="font-display text-2xl font-semibold tracking-widest text-primary md:text-3xl">{SERVER_IP}</code>
                <Button onClick={copyIp} variant="outline" className="border-primary/40 font-display uppercase">
                  <Icon name="Copy" size={16} className="mr-2" /> Копировать
                </Button>
              </div>
              <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
                {[
                  ['1', 'Установи DayZ', 'Купи игру в Steam'],
                  ['2', 'Добавь моды', 'Через DayZ Launcher'],
                  ['3', 'Вставь IP', 'И заходи в Зону'],
                ].map(([n, t, d]) => (
                  <div key={n} className="border border-border bg-background/50 p-4">
                    <div className="font-display text-3xl font-bold text-primary/40">{n}</div>
                    <div className="mt-1 font-display uppercase tracking-wide">{t}</div>
                    <div className="font-body text-sm text-muted-foreground">{d}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hazard-stripe h-3 w-full" />
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section id="news" className="relative border-t border-border py-24">
        <div className="container px-4">
          <SectionTitle icon="Radio" sub="Сводки с Зоны" title="Новости и патчи" />
          <div className="mt-12 space-y-5">
            {news.map((n) => (
              <div key={n.id} className="grain rust-border group flex flex-col gap-4 bg-card transition-all hover:border-primary/50 md:flex-row md:items-stretch overflow-hidden">
                {n.image_url && (
                  <div className="md:w-48 shrink-0 overflow-hidden">
                    <img src={n.image_url} alt={n.title} className="w-full h-40 md:h-full object-cover" />
                  </div>
                )}
                <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center flex-1">
                  <div className="flex shrink-0 flex-col gap-2 md:w-48">
                    <span className="font-display text-xl font-bold uppercase tracking-wide text-primary">{n.ver}</span>
                    <span className="flex items-center gap-2 font-body text-sm text-muted-foreground">
                      <Icon name="Calendar" size={14} /> {n.date}
                    </span>
                    <span className="w-fit border border-accent/50 bg-accent/10 px-2 py-0.5 font-display text-xs uppercase tracking-wider text-accent-foreground">
                      {n.tag}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold uppercase tracking-wide">{n.title}</h3>
                    <p className="mt-2 font-body text-muted-foreground">{n.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground">
                <Icon name="Radiation" size={22} />
              </div>
              <span className="font-display text-lg font-bold uppercase tracking-widest">S.T.A.L.K.E.R. RP</span>
            </div>
            <p className="font-body text-sm text-muted-foreground">© 2026 Зона. Все пожертвования добровольны.</p>
            <div className="flex gap-3">
              <a href="https://discord.gg/Szbrkk8nX6" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                <Icon name="MessageCircle" size={18} />
              </a>
              {['Youtube'].map((ic) => (
                <button key={ic} className="flex h-10 w-10 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  <Icon name={ic} size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* CART MODAL */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-end bg-background/60 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
          <div className="grain rust-border h-full w-full max-w-sm bg-card animate-fade-in flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-lg font-bold uppercase tracking-widest flex items-center gap-2">
                <Icon name="ShoppingCart" size={18} className="text-primary" /> Корзина
              </h2>
              <button onClick={() => setCartOpen(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Icon name="ShoppingCart" size={48} className="text-muted-foreground/20" />
                  <p className="mt-4 font-display text-sm uppercase tracking-wide text-muted-foreground">Корзина пуста</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.name} className="flex items-center gap-3 border border-border bg-background/50 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
                        <Icon name={item.icon} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm uppercase leading-tight truncate">{item.name}</p>
                        <p className="font-display text-xs text-primary">{item.price} ₽ × {item.qty} = {item.price * item.qty} ₽</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => changeQty(item.name, -1)} className="flex h-7 w-7 items-center justify-center border border-border text-muted-foreground hover:border-primary hover:text-foreground">
                          <Icon name="Minus" size={12} />
                        </button>
                        <span className="font-display w-5 text-center text-sm">{item.qty}</span>
                        <button onClick={() => changeQty(item.name, 1)} className="flex h-7 w-7 items-center justify-center border border-border text-muted-foreground hover:border-primary hover:text-foreground">
                          <Icon name="Plus" size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm uppercase tracking-wider text-muted-foreground">Итого</span>
                  <span className="font-display text-2xl font-bold text-primary">{cartTotal} ₽</span>
                </div>
                <Button className="w-full font-display uppercase tracking-widest" onClick={() => {
                  if (!user) { setCabinetOpen(true); setCartOpen(false); }
                  else toast({ title: 'Оформление заказа', description: 'Функция оплаты скоро появится' });
                }}>
                  <Icon name="Zap" size={16} className="mr-2" />
                  {user ? 'Оформить заказ' : 'Войти и оформить'}
                </Button>
                <button onClick={() => setCart([])} className="w-full font-display text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                  Очистить корзину
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CABINET MODAL */}
      {cabinetOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-background/90 backdrop-blur-sm p-4 pt-20">
          <div className="grain rust-border w-full max-w-2xl bg-card animate-fade-in">
            <div className="flex items-center justify-between border-b border-border p-6">
              <h2 className="font-display text-xl font-bold uppercase tracking-widest">Личный кабинет</h2>
              <button onClick={() => setCabinetOpen(false)} className="text-muted-foreground transition-colors hover:text-foreground">
                <Icon name="X" size={22} />
              </button>
            </div>
            {user ? (
              <div className="p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative h-16 w-16 shrink-0">
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
                      : <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary"><Icon name="User" size={30} /></div>
                    }
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center bg-primary">
                      <Icon name="Radiation" size={11} className="text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-xs uppercase tracking-[0.3em] text-primary">Сталкер Зоны</p>
                    <h3 className="font-display text-2xl font-bold uppercase">{user.username}</h3>
                    <p className="mt-1 font-body text-xs text-muted-foreground">Steam ID: {user.steam_id}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout} className="border-border font-display uppercase shrink-0">
                    <Icon name="LogOut" size={15} className="mr-1" /> Выйти
                  </Button>
                </div>

                <div className="mt-6">
                  <h4 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">История покупок</h4>
                  {purchases.length === 0 ? (
                    <div className="py-10 text-center">
                      <Icon name="Package" size={40} className="mx-auto text-muted-foreground/30" />
                      <p className="mt-3 font-display text-sm uppercase tracking-wide text-muted-foreground">Покупок пока нет</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {purchases.map((p) => {
                        const STATUS: Record<string, { label: string; color: string }> = {
                          pending: { label: 'Ожидает', color: 'text-yellow-400' },
                          paid: { label: 'Оплачено', color: 'text-green-400' },
                          delivered: { label: 'Выдано', color: 'text-primary' },
                          cancelled: { label: 'Отменено', color: 'text-red-400' },
                        };
                        const st = STATUS[p.status] ?? { label: p.status, color: 'text-muted-foreground' };
                        return (
                          <div key={p.id} className="flex items-center justify-between border border-border bg-background/50 px-4 py-3">
                            <span className="font-display text-sm uppercase">{p.item_name}</span>
                            <div className="flex items-center gap-4">
                              <span className={`font-display text-xs uppercase ${st.color}`}>{st.label}</span>
                              <span className="font-display font-bold text-primary">{p.price.toFixed(0)} ₽</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-10 text-center">
                <Button onClick={loginWithSteam} size="lg" className="font-display uppercase tracking-widest animate-radiate">
                  <Icon name="LogIn" size={18} className="mr-2" /> Войти через Steam
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon, sub, title }: { icon: string; sub: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary/10 text-primary">
        <Icon name={icon} size={26} />
      </div>
      <div>
        <p className="font-display text-xs uppercase tracking-[0.3em] text-primary">{sub}</p>
        <h2 className="font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">{title}</h2>
      </div>
    </div>
  );
}