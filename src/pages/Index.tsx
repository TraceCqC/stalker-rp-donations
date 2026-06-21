import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const HERO = 'https://cdn.poehali.dev/projects/bb154877-b93f-4589-958f-2fb7ea6b58fe/files/8f9ca15d-a21a-4ffe-994d-3d6f8ad6d774.jpg';
const SIGN = 'https://cdn.poehali.dev/projects/bb154877-b93f-4589-958f-2fb7ea6b58fe/files/9d913198-f058-4331-9e65-3927b06a9375.jpg';
const NZ_BG = 'https://cdn.poehali.dev/projects/bb154877-b93f-4589-958f-2fb7ea6b58fe/bucket/e41f910e-cde4-42db-963e-13290bad8a3e.png';

const SERVER_IP = '185.220.101.42:2302';

const NAV = [
  { id: 'lore', label: 'Лор', icon: 'BookOpen' },
  { id: 'factions', label: 'Фракции', icon: 'Users' },
  { id: 'connect', label: 'Подключение', icon: 'Wifi' },
  { id: 'news', label: 'Новости', icon: 'Radio' },
  { id: 'shop', label: 'Магазин', icon: 'ShoppingCart' },
];

const FACTIONS = [
  {
    name: 'Долг',
    icon: 'Shield',
    color: 'text-red-400',
    alignment: 'Порядок',
    desc: 'Военизированная группировка, цель которой — уничтожение Зоны. Железная дисциплина, тяжёлое вооружение, нулевая терпимость к мародёрам.',
  },
  {
    name: 'Свобода',
    icon: 'Wind',
    color: 'text-green-400',
    alignment: 'Хаос',
    desc: 'Анархисты Зоны. Убеждены, что Зона — это дар человечеству. Открытый доступ к аномалиям для всех. Вечная война с Долгом.',
  },
  {
    name: 'ОКСОП',
    icon: 'Eye',
    color: 'text-blue-400',
    alignment: 'Закон',
    desc: 'Отряд контроля и соблюдения общественного порядка. Официальная силовая структура, охраняющая периметр и патрулирующая Зону.',
  },
  {
    name: 'Монолит',
    icon: 'Triangle',
    color: 'text-purple-400',
    alignment: 'Фанатизм',
    desc: 'Загадочная секта, поклоняющаяся Монолиту — источнику исполнения желаний. Безжалостны, безрассудны и смертоносны. Никто не знает, кем они были раньше.',
  },
  {
    name: 'Грех',
    icon: 'Skull',
    color: 'text-orange-400',
    alignment: 'Тьма',
    desc: 'Тайная организация с мистическими ритуалами. Торгуют запрещёнными артефактами и информацией. Встреча с ними — дурной знак.',
  },
  {
    name: 'Бандиты',
    icon: 'Flame',
    color: 'text-yellow-400',
    alignment: 'Мародёрство',
    desc: 'Отбросы Зоны. Грабят одиночек, торгуют краденым и устраивают засады. Ненавидимы всеми, но живут дольше, чем хотелось бы.',
  },
  {
    name: 'Чистое Небо',
    icon: 'CloudSun',
    color: 'text-cyan-400',
    alignment: 'Исследование',
    desc: 'Наёмная группировка, стремящаяся остановить расширение Зоны. Изучают аномалии, охотятся за артефактами и противостоят выбросам.',
  },
  {
    name: 'Учёные',
    icon: 'FlaskConical',
    color: 'text-lime-400',
    alignment: 'Наука',
    desc: 'Гражданские исследователи под эгидой института «Агропром». Не воюют, но знают о Зоне больше всех. Их данные стоят дороже любого артефакта.',
  },
];

const NEWS = [
  { ver: 'Патч 1.7.3', date: '18.06.2026', title: 'Новая аномальная зона «Янтарь»', tag: 'Контент', text: 'Добавлена локация с радиоактивными аномалиями, редкими артефактами и фракцией учёных. Повышен риск — выросла награда.' },
  { ver: 'Патч 1.7.2', date: '09.06.2026', title: 'Переработка системы выживания', tag: 'Баланс', text: 'Голод, жажда и радиация теперь влияют на стамину. Противогазы получили ресурс фильтров. Аптечки лечат медленнее.' },
  { ver: 'Хотфикс 1.7.1', date: '02.06.2026', title: 'Исправление дюпа транспорта', tag: 'Фикс', text: 'Закрыт эксплойт с дублированием машин. Откатаны нечестно полученные предметы. Стабилизирован спавн мутантов.' },
];

const SHOP: Record<string, { name: string; price: string; icon: string; desc: string }[]> = {
  ammo: [
    { name: 'Цинк 5.45×39 (1080)', price: '149 ₽', icon: 'Package', desc: 'Полный цинк патронов для АК-74' },
    { name: 'Дробь 12 калибр (50)', price: '79 ₽', icon: 'Package', desc: 'Картечь для дробовиков' },
    { name: 'Патроны 7.62×54 (200)', price: '189 ₽', icon: 'Package', desc: 'Для снайперских винтовок' },
    { name: 'Аптечка военная', price: '99 ₽', icon: 'Cross', desc: 'Полное восстановление HP' },
  ],
  weapon: [
    { name: 'АК-74М «Зона»', price: '349 ₽', icon: 'Crosshair', desc: 'Кастомная сборка с обвесом' },
    { name: 'СВД «Сталкер»', price: '499 ₽', icon: 'Crosshair', desc: 'Снайперская винтовка с прицелом' },
    { name: 'Сайга-12', price: '279 ₽', icon: 'Crosshair', desc: 'Помповый дробовик' },
    { name: 'Глок-17 + кобура', price: '149 ₽', icon: 'Crosshair', desc: 'Надёжный пистолет выживальщика' },
  ],
  transport: [
    { name: 'УАЗ «Буханка»', price: '599 ₽', icon: 'Truck', desc: 'Вместительный внедорожник' },
    { name: 'Нива 4×4', price: '449 ₽', icon: 'Car', desc: 'Проходимость по любой Зоне' },
    { name: 'Квадроцикл', price: '299 ₽', icon: 'Bike', desc: 'Быстрая разведка территории' },
    { name: 'Грузовик Урал', price: '899 ₽', icon: 'Truck', desc: 'Перевозка большого лута' },
  ],
  furniture: [
    { name: 'Верстак оружейника', price: '249 ₽', icon: 'Wrench', desc: 'Крафт и ремонт стволов' },
    { name: 'Сейф-шкаф', price: '199 ₽', icon: 'Lock', desc: 'Защищённое хранилище лута' },
    { name: 'Палаточный лагерь', price: '349 ₽', icon: 'Tent', desc: 'Мобильная база сталкера' },
    { name: 'Радиостанция', price: '159 ₽', icon: 'RadioTower', desc: 'Связь на дальние дистанции' },
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
  const { user, loading: authLoading, loginWithSteam } = useAuth();
  const [serverPlayers, setServerPlayers] = useState<number | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchStatus = () => {
      fetch('https://functions.poehali.dev/8866a1ce-5a85-4894-ba57-fd00e3cd2636')
        .then(r => r.json())
        .then(data => {
          setServerOnline(data.online);
          setServerPlayers(data.online ? data.players : 0);
        })
        .catch(() => setServerOnline(false));
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
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
              S.T.A.L.K.E.R. <span className="text-primary">RP</span>
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
            {!authLoading && (
              user ? (
                <a href="/cabinet" className="flex items-center gap-2 border border-border bg-card px-3 py-1.5 transition-colors hover:border-primary">
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt="" className="h-6 w-6 object-cover" />
                    : <Icon name="User" size={16} className="text-primary" />
                  }
                  <span className="font-display text-sm uppercase tracking-wider">{user.username}</span>
                </a>
              ) : (
                <Button variant="outline" size="sm" onClick={loginWithSteam} className="border-primary/40 font-display uppercase tracking-wider">
                  <Icon name="LogIn" size={16} className="mr-1" /> Steam
                </Button>
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
              <span className={`h-2 w-2 rounded-full ${serverOnline === false ? 'bg-red-500' : 'bg-primary animate-flicker'}`} />
              <span className={`font-display text-xs uppercase tracking-[0.3em] ${serverOnline === false ? 'text-red-400' : 'text-primary'}`}>
                {serverOnline === false ? 'Сервер офлайн · DayZ' : 'Сервер онлайн · DayZ'}
              </span>
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
              <Button size="lg" variant="outline" onClick={() => scrollTo('shop')} className="font-display uppercase tracking-widest border-primary/40">
                <Icon name="ShoppingCart" size={18} className="mr-2" /> В магазин
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap gap-8">
              <div>
                <div className="font-display text-4xl font-bold text-primary">
                  {serverPlayers === null ? '—' : serverPlayers}
                </div>
                <div className="font-body text-xs uppercase tracking-wider text-muted-foreground">Сталкеров онлайн</div>
              </div>
              {[['64', 'Слотов на сервере'], ['8', 'Фракций в Зоне']].map(([n, l]) => (
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
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              { icon: 'Atom', title: 'Второй взрыв', text: 'В 2006 году над ЧАЭС произошёл повторный выброс. Привычный мир рухнул — родилась Зона с её аномалиями и мутантами.' },
              { icon: 'Users', title: 'Фракции', text: 'Долг, Свобода, ОКСОП, Монолит, Грех и Бандиты. Каждая группировка борется за контроль над артефактами и территорией.', action: 'factions' },
              { icon: 'Sparkles', title: 'Артефакты', text: 'Порождения аномалий, дающие сверхспособности и смертельную радиацию. За них готовы убивать — и умирать.' },
            ].map((c, i) => (
              <div
                key={c.title}
                onClick={() => c.action && scrollTo(c.action)}
                className={`grain rust-border group bg-card p-8 transition-all hover:border-primary/50 animate-fade-in ${c.action ? 'cursor-pointer' : ''}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon name={c.icon} size={28} />
                </div>
                <h3 className="font-display text-2xl font-semibold uppercase tracking-wide">{c.title}</h3>
                <p className="mt-3 font-body text-muted-foreground">{c.text}</p>
                {c.action && (
                  <div className="mt-4 flex items-center gap-1 font-display text-xs uppercase tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Все фракции <Icon name="ArrowRight" size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACTIONS */}
      <section id="factions" className="relative border-t border-border py-24">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img src={NZ_BG} alt="" className="h-full w-full object-cover opacity-[0.06]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/60" />
        </div>
        <div className="container relative z-10 px-4">
          <SectionTitle icon="Users" sub="Группировки Зоны" title="Фракции" />
          <p className="mt-4 max-w-2xl font-body text-muted-foreground">
            Выбери фракцию — узнай её цели, базу и боевой стиль.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FACTIONS.map((f) => {
              const isOpen = selectedFaction === f.name;
              return (
                <div key={f.name} className="flex flex-col">
                  <button
                    onClick={() => setSelectedFaction(isOpen ? null : f.name)}
                    className={`grain rust-border group flex items-center gap-4 bg-card p-6 text-left transition-all ${isOpen ? 'border-primary/70 bg-card' : 'hover:border-primary/40'}`}
                  >
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center bg-card border border-border transition-colors ${isOpen ? 'bg-primary border-primary' : 'group-hover:bg-primary/10'}`}>
                      <Icon name={f.icon} size={28} className={isOpen ? 'text-primary-foreground' : f.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-2xl font-bold uppercase tracking-wide">{f.name}</div>
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
                      <p className="font-body text-muted-foreground">{f.desc}</p>
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
            {NEWS.map((n) => (
              <div key={n.ver} className="grain rust-border group flex flex-col gap-4 bg-card p-6 transition-all hover:border-primary/50 md:flex-row md:items-center">
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
            ))}
          </div>
        </div>
      </section>

      {/* SHOP */}
      <section id="shop" className="relative border-t border-border py-24">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img src={NZ_BG} alt="" className="h-full w-full object-cover opacity-[0.05]" style={{objectPosition: 'center 30%'}} />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-background/80" />
        </div>
        <div className="container relative z-10 px-4">
          <SectionTitle icon="ShoppingCart" sub="За пожертвования" title="Магазин Зоны" />
          <p className="mt-4 max-w-2xl font-body text-muted-foreground">
            Все покупки — добровольные пожертвования на развитие проекта. Поддержи сервер и получи снаряжение для выживания.
          </p>
          <Tabs defaultValue="ammo" className="mt-12">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 md:grid-cols-4">
              {SHOP_CATS.map((c) => (
                <TabsTrigger
                  key={c.id}
                  value={c.id}
                  className="grain rust-border flex items-center gap-2 bg-card py-4 font-display uppercase tracking-wider data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon name={c.icon} size={18} /> {c.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(SHOP).map(([cat, items]) => (
              <TabsContent key={cat} value={cat} className="mt-8">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((item) => (
                    <div key={item.name} className="grain rust-border group flex flex-col bg-card p-6 transition-all hover:border-primary/50 hover:-translate-y-1">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon name={item.icon} size={32} />
                      </div>
                      <h3 className="font-display text-lg font-semibold uppercase leading-tight tracking-wide">{item.name}</h3>
                      <p className="mt-2 flex-1 font-body text-sm text-muted-foreground">{item.desc}</p>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="font-display text-2xl font-bold text-primary">{item.price}</span>
                        <Button
                          size="sm"
                          onClick={() => toast({ title: 'Добавлено в корзину', description: item.name })}
                          className="font-display uppercase"
                        >
                          <Icon name="Plus" size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
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
              {['Send', 'MessageCircle', 'Youtube'].map((ic) => (
                <button key={ic} className="flex h-10 w-10 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  <Icon name={ic} size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
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