import { useAuth } from '@/hooks/use-auth';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ожидает', color: 'text-yellow-400' },
  paid: { label: 'Оплачено', color: 'text-green-400' },
  delivered: { label: 'Выдано', color: 'text-primary' },
  cancelled: { label: 'Отменено', color: 'text-red-400' },
};

const CAT_ICON: Record<string, string> = {
  ammo: 'Package',
  weapon: 'Crosshair',
  transport: 'Truck',
  furniture: 'Wrench',
};

export default function Cabinet() {
  const { user, purchases, loading, loginWithSteam, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Icon name="Radiation" size={48} className="animate-spin text-primary" />
          <p className="font-display uppercase tracking-widest text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="grain rust-border w-full max-w-md bg-card p-10 text-center">
          <div className="hazard-stripe mb-8 h-2 w-full" />
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-primary/10 text-primary">
            <Icon name="Steam" size={44} fallback="LogIn" />
          </div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Вход в кабинет</h1>
          <p className="mt-3 font-body text-muted-foreground">
            Войди через Steam, чтобы видеть историю покупок и управлять аккаунтом.
          </p>
          <Button onClick={loginWithSteam} size="lg" className="mt-8 w-full font-display uppercase tracking-widest animate-radiate">
            <Icon name="LogIn" size={20} className="mr-2" />
            Войти через Steam
          </Button>
          <div className="hazard-stripe mt-8 h-2 w-full" />
        </div>
      </div>
    );
  }

  const totalSpent = purchases
    .filter((p) => p.status === 'paid' || p.status === 'delivered')
    .reduce((sum, p) => sum + p.price, 0);

  const memberDate = new Date(user.member_since).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 px-4 py-4">
        <div className="container flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-primary text-primary-foreground">
              <Icon name="Radiation" size={18} />
            </div>
            <span className="font-display text-lg font-bold uppercase tracking-widest">
              Night <span className="text-primary">Zone</span>
            </span>
          </a>
          <Button variant="outline" size="sm" onClick={logout} className="border-border font-display uppercase">
            <Icon name="LogOut" size={16} className="mr-2" /> Выйти
          </Button>
        </div>
      </header>

      <div className="container px-4 py-12">
        {/* Profile */}
        <div className="grain rust-border flex flex-col gap-6 bg-card p-8 sm:flex-row sm:items-center">
          <div className="relative h-20 w-20 shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                <Icon name="User" size={36} />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center bg-primary">
              <Icon name="Radiation" size={12} className="text-primary-foreground" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-display text-xs uppercase tracking-[0.3em] text-primary">Сталкер Зоны</p>
            <h1 className="font-display text-3xl font-bold uppercase">{user.username}</h1>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              Steam ID: {user.steam_id} · Участник с {memberDate}
            </p>
          </div>
          <div className="flex gap-6 sm:flex-col sm:items-end sm:gap-3">
            <div className="text-right">
              <div className="font-display text-3xl font-bold text-primary">{purchases.length}</div>
              <div className="font-body text-xs uppercase tracking-wider text-muted-foreground">покупок</div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-bold text-primary">{totalSpent.toFixed(0)} ₽</div>
              <div className="font-body text-xs uppercase tracking-wider text-muted-foreground">пожертвовано</div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-bold text-green-400">{(user.balance ?? 0).toFixed(0)} ₽</div>
              <div className="font-body text-xs uppercase tracking-wider text-muted-foreground">баланс</div>
            </div>
          </div>
        </div>

        {/* Balance block */}
        {(user.balance ?? 0) > 0 && (
          <div className="mt-6 grain border border-green-700/40 bg-green-900/10 p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-green-900/30 text-green-400">
              <Icon name="Wallet" size={22} />
            </div>
            <div className="flex-1">
              <p className="font-display text-xs uppercase tracking-widest text-green-400">Бонусный баланс</p>
              <p className="font-body text-sm text-muted-foreground mt-0.5">
                Начислен через промокод. Будет использован при следующей покупке в магазине.
              </p>
            </div>
            <div className="font-display text-2xl font-bold text-green-400 shrink-0">
              +{(user.balance ?? 0).toFixed(0)} ₽
            </div>
          </div>
        )}

        {/* Purchases */}
        <div className="mt-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-primary/10 text-primary">
              <Icon name="ShoppingCart" size={22} />
            </div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight">История покупок</h2>
          </div>

          {purchases.length === 0 ? (
            <div className="grain rust-border mt-6 bg-card p-12 text-center">
              <Icon name="Package" size={48} className="mx-auto text-muted-foreground/40" />
              <p className="mt-4 font-display text-lg uppercase tracking-wide text-muted-foreground">
                Покупок пока нет
              </p>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                Загляни в магазин и поддержи сервер
              </p>
              <a href="/#shop">
                <Button className="mt-6 font-display uppercase tracking-widest">
                  <Icon name="ShoppingCart" size={16} className="mr-2" /> В магазин
                </Button>
              </a>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {purchases.map((p) => {
                const st = STATUS_LABEL[p.status] ?? { label: p.status, color: 'text-muted-foreground' };
                const date = new Date(p.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric', month: 'short', year: 'numeric',
                });
                return (
                  <div key={p.id} className="grain rust-border flex flex-col gap-3 bg-card p-5 sm:flex-row sm:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary/10 text-primary">
                      <Icon name={CAT_ICON[p.category] ?? 'Package'} size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="font-display text-lg font-semibold uppercase tracking-wide">{p.item_name}</div>
                      <div className="mt-0.5 flex items-center gap-2 font-body text-sm text-muted-foreground">
                        <Icon name="Calendar" size={13} /> {date}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`font-display text-sm uppercase tracking-wider ${st.color}`}>{st.label}</span>
                      <span className="font-display text-xl font-bold text-primary">{p.price.toFixed(0)} ₽</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}