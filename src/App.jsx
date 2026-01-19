import React, { useState, useEffect, useCallback } from 'react';
import { FlyNumber } from './components/FlyNumber.jsx';
import { Squads } from './components/Squads.jsx';

const BASE_MAX_ENERGY = 500;
const ENERGY_REGEN_INTERVAL = 3000;
const STORAGE_KEY = 'clickcoin_state_v2';
const LANG_KEY = 'clickcoin_lang_v1';
const ADMIN_ID = 7776133481;

const LANGS = ['ru', 'en', 'pl', 'ua'];

const DICT = {
  ru: {
    app_title: 'ClickCoin',
    home: 'Главная',
    boosters: 'Бустеры',
    squads: 'Сквад',
    profile: 'Профиль',
    exchange: 'Обмен',
    tasks: 'Задания',
    tap_to_earn: 'Тапай по монете, чтобы фармить',
    boosters_title: 'Бустеры',
    booster_click: 'Буст клика',
    booster_click_desc: 'Увеличивает монеты за клик.',
    booster_autoclick: 'Автокликер',
    booster_autoclick_desc: 'Кликает сам каждый секунду.',
    booster_energy_regen: 'Реген энергии',
    booster_energy_regen_desc: 'Быстрее восстанавливает энергию.',
    booster_energy_max: 'Макс энергия',
    booster_energy_max_desc: 'Увеличивает лимит энергии.',
    booster_xp: 'Буст опыта',
    booster_xp_desc: 'Ускоряет получение уровня.',
    buy_for_coins: '1000 💰',
    buy_for_stars: '1 ⭐',
    profile_title: 'Профиль',
    lang: 'Язык',
    ton_connect: 'Подключить TON кошелёк',
    game_status_active: 'Игра активна',
    game_status_paused: 'Игра на паузе (в разработке)',
    admin_panel: 'Админ‑панель',
    admin_toggle_game: 'Переключить статус игры',
    admin_add_stars: 'Выдать звёзды',
    admin_add_coins: 'Выдать монеты',
    admin_add_task: 'Добавить задание',
    admin_logout: 'Выйти из админ‑режима',
    tasks_title: 'Задания',
    tasks_empty: 'Пока нет заданий',
    exchange_title: 'Обмен',
    exchange_soon: 'Монета ещё не вышла на блокчейн. Обмен будет доступен позже.',
  }
};

function useLang() {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (!saved) return 'ru';
      if (!LANGS.includes(saved)) return 'ru';
      return saved;
    } catch {
      return 'ru';
    }
  });

  const t = useCallback(
    (key) => {
      const dict = DICT[lang];
      if (!dict) return key;
      return dict[key] || key;
    },
    [lang]
  );

  const changeLang = (next) => {
    if (!LANGS.includes(next)) return;
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {}
  };

  return { lang, t, changeLang };
}

export default function App() {
  const { lang, t, changeLang } = useLang();

  const [balance, setBalance] = useState(0);
  const [stars, setStars] = useState(0);
  const [energy, setEnergy] = useState(BASE_MAX_ENERGY);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [screen, setScreen] = useState('home');

  const [clickPower, setClickPower] = useState(1);
  const [autoClickLevel, setAutoClickLevel] = useState(0);
  const [energyRegenBonus, setEnergyRegenBonus] = useState(0);
  const [maxEnergyBonus, setMaxEnergyBonus] = useState(0);
  const [xpMultiplier, setXpMultiplier] = useState(1);

  const [flyNumbers, setFlyNumbers] = useState([]);
  const [levelUpText, setLevelUpText] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskTokens, setTaskTokens] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [userId, setUserId] = useState(null);

  const getLevelRequirement = (lvl) => lvl * 500;

  const showLevelUp = () => {
    setLevelUpText(`LEVEL UP! LVL ${level + 1}`);
    setTimeout(() => setLevelUpText(null), 1500);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const s = JSON.parse(saved);

      setBalance(s.balance ?? 0);
      setStars(s.stars ?? 0);
      setEnergy(s.energy ?? BASE_MAX_ENERGY);
      setLevel(s.level ?? 1);
      setXp(s.xp ?? 0);
      setClickPower(s.clickPower ?? 1);
      setAutoClickLevel(s.autoClickLevel ?? 0);
      setEnergyRegenBonus(s.energyRegenBonus ?? 0);
      setMaxEnergyBonus(s.maxEnergyBonus ?? 0);
      setXpMultiplier(s.xpMultiplier ?? 1);
      setGamePaused(s.gamePaused ?? false);
      setTasks(s.tasks ?? []);
      setTaskTokens(s.taskTokens ?? 0);
      setWalletConnected(s.walletConnected ?? false);
    } catch (e) {
      console.error('Load error', e);
    }
  }, []);

  useEffect(() => {
    try {
      const tg = window.Telegram?.WebApp;
      const uid = tg?.initDataUnsafe?.user?.id;
      if (uid) setUserId(uid);
      if (uid === ADMIN_ID) {
        setIsAdmin(true);
      }
    } catch (e) {
      console.log('Telegram WebApp not available yet', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          balance,
          stars,
          energy,
          level,
          xp,
          clickPower,
          autoClickLevel,
          energyRegenBonus,
          maxEnergyBonus,
          xpMultiplier,
          gamePaused,
          tasks,
          taskTokens,
          walletConnected
        })
      );
    } catch (e) {
      console.error('Save error', e);
    }
  }, [
    balance,
    stars,
    energy,
    level,
    xp,
    clickPower,
    autoClickLevel,
    energyRegenBonus,
    maxEnergyBonus,
    xpMultiplier,
    gamePaused,
    tasks,
    taskTokens,
    walletConnected
  ]);

  useEffect(() => {
    if (gamePaused) return;
    const interval = setInterval(() => {
      setEnergy((e) =>
        Math.min(BASE_MAX_ENERGY + maxEnergyBonus, e + 1 + energyRegenBonus)
      );
    }, ENERGY_REGEN_INTERVAL);

    return () => clearInterval(interval);
  }, [energyRegenBonus, maxEnergyBonus, gamePaused]);

  const addXp = (amount) => {
    const gain = amount * xpMultiplier;
    const need = getLevelRequirement(level);
    const next = xp + gain;

    if (next >= need) {
      setLevel((l) => l + 1);
      setClickPower((p) => p + 1);
      showLevelUp();
      setXp(next - need);
    } else {
      setXp(next);
    }
  };

  const handleClick = (e) => {
    if (gamePaused) return;
    if (energy <= 0) return;

    const value = clickPower;
    const x = e.clientX;
    const y = e.clientY;

    setFlyNumbers((arr) => [
      ...arr,
      { x, y, value, id: Date.now() + Math.random() }
    ]);

    setBalance((b) => b + value);
    setEnergy((en) => Math.max(0, en - 1));
    addXp(value);
  };

  useEffect(() => {
    if (autoClickLevel <= 0) return;
    if (gamePaused) return;

    const interval = setInterval(() => {
      if (energy <= 0) return;

      const value = clickPower * autoClickLevel;
      setBalance((b) => b + value);
      setEnergy((en) => Math.max(0, en - autoClickLevel));
      addXp(value);
    }, 1000);

    return () => clearInterval(interval);
  }, [autoClickLevel, energy, clickPower, xpMultiplier, gamePaused]);

  const buyBooster = (type, mode) => {
    if (mode === 'coins' && balance < 1000) return;
    if (mode === 'stars' && stars < 1) return;

    if (mode === 'coins') setBalance((b) => b - 1000);
    if (mode === 'stars') setStars((s) => s - 1);

    if (type === 'click') setClickPower((p) => p + 1);
    if (type === 'autoclick') setAutoClickLevel((l) => l + 1);
    if (type === 'regen') setEnergyRegenBonus((v) => v + 1);
    if (type === 'maxenergy') setMaxEnergyBonus((v) => v + 50);
    if (type === 'xp') setXpMultiplier((v) => v + 0.5);
  };

  const toggleGameStatus = () => {
    setGamePaused((p) => !p);
  };

  const adminAddStars = (amount = 10) => {
    setStars((s) => s + amount);
  };

  const adminAddCoins = (amount = 1000) => {
    setBalance((b) => b + amount);
  };

  const adminAddTask = () => {
    const title = prompt('Название задания (например: Подписаться на канал)');
    if (!title) return;
    const reward = Number(prompt('Награда в токенах за выполнение (число)')) || 0;

    setTasks((arr) => [
      ...arr,
      {
        id: Date.now(),
        title,
        reward,
        done: false
      }
    ]);
  };

  const completeTask = (id) => {
    setTasks((arr) =>
      arr.map((t) =>
        t.id === id && !t.done ? { ...t, done: true } : t
      )
    );
    const task = tasks.find((t) => t.id === id);
    if (task && !task.done) {
      setTaskTokens((v) => v + task.reward);
    }
  };

  const gameStatusText = gamePaused
    ? t('game_status_paused')
    : t('game_status_active');

  const handleBuyStars = () => {
    try {
      const tg = window.Telegram?.WebApp;
      const uid = tg?.initDataUnsafe?.user?.id || userId;
      if (!uid) {
        alert('Открой игру через Telegram, чтобы покупать звёзды');
        return;
      }

      fetch('https://your-backend.com/api/create-stars-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid })
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok && d.invoiceUrl) {
            if (tg && tg.openInvoice) {
              tg.openInvoice(d.invoiceUrl);
            } else {
              window.location.href = d.invoiceUrl;
            }
          } else {
            alert('Ошибка при создании инвойса');
          }
        })
        .catch(() => {
          alert('Сервер оплаты недоступен');
        });
    } catch {
      alert('Ошибка при попытке покупки');
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div className="logo">
          <span className="logo-icon">◎</span>
          <span>{t('app_title')}</span>
        </div>

        <div className="stats">
          <div className="stat-pill">💰 {balance}</div>
          <div className="stat-pill">⭐ {stars}</div>
          <div className="stat-pill">
            ⚡ {energy}/{BASE_MAX_ENERGY + maxEnergyBonus}
          </div>
          <div className="stat-pill">LVL {level}</div>
        </div>
      </div>

      <div className="main">
        {screen === 'home' && (
          <>
            <div className="game-status">{gameStatusText}</div>

            <div
              className={`coin ${gamePaused ? 'disabled' : ''}`}
              onClick={handleClick}
            >
              <div className="coin-glow" />
              <svg viewBox="0 0 100 100">
                <defs>
                  <radialGradient id="goldGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff7ff" />
                    <stop offset="50%" stopColor="#ffb3ff" />
                    <stop offset="100%" stopColor="#ff4ddb" />
                  </radialGradient>
                </defs>

                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="url(#goldGradient)"
                  stroke="#ff9cf5"
                  strokeWidth="4"
                />

                <circle
                  cx="50"
                  cy="50"
                  r="25"
                  fill="rgba(0,0,0,0.25)"
                />

                <text
                  x="50"
                  y="57"
                  textAnchor="middle"
                  fontSize="26"
                  fill="#fff7ff"
                  fontWeight="700"
                >
                  C
                </text>
              </svg>
            </div>

            {!gamePaused && (
              <div className="tap-hint">{t('tap_to_earn')}</div>
            )}
            {gamePaused && (
              <div className="tap-hint paused">
                Игра временно на паузе
              </div>
            )}

            <div className="xp-bar">
              <div
                className="xp-fill"
                style={{
                  width: `${(xp / getLevelRequirement(level)) * 100}%`
                }}
              ></div>
            </div>

            <div className="xp-text">
              {xp} / {getLevelRequirement(level)} XP
            </div>
          </>
        )}

        {screen === 'boosters' && (
          <div className="boosters-screen">
            <h2>{t('boosters_title')}</h2>

            <div className="booster-item neon-card">
              <div className="booster-main">
                <div className="booster-title">⚡ {t('booster_click')}</div>
                <div className="booster-desc">
                  {t('booster_click_desc')} (сила клика: {clickPower})
                </div>
              </div>
              <div className="booster-actions">
                <button onClick={() => buyBooster('click', 'coins')}>
                  {t('buy_for_coins')}
                </button>
                <button onClick={() => buyBooster('click', 'stars')}>
                  {t('buy_for_stars')}
                </button>
              </div>
            </div>

            <div className="booster-item neon-card">
              <div className="booster-main">
                <div className="booster-title">🤖 {t('booster_autoclick')}</div>
                <div className="booster-desc">
                  {t('booster_autoclick_desc')} (уровень: {autoClickLevel})
                </div>
              </div>
              <div className="booster-actions">
                <button onClick={() => buyBooster('autoclick', 'coins')}>
                  {t('buy_for_coins')}
                </button>
                <button onClick={() => buyBooster('autoclick', 'stars')}>
                  {t('buy_for_stars')}
                </button>
              </div>
            </div>

            <div className="booster-item neon-card">
              <div className="booster-main">
                <div className="booster-title">🔋 {t('booster_energy_regen')}</div>
                <div className="booster-desc">
                  {t('booster_energy_regen_desc')} (+{energyRegenBonus})
                </div>
              </div>
              <div className="booster-actions">
                <button onClick={() => buyBooster('regen', 'coins')}>
                  {t('buy_for_coins')}
                </button>
                <button onClick={() => buyBooster('regen', 'stars')}>
                  {t('buy_for_stars')}
                </button>
              </div>
            </div>

            <div className="booster-item neon-card">
              <div className="booster-main">
                <div className="booster-title">💥 {t('booster_energy_max')}</div>
                <div className="booster-desc">
                  {t('booster_energy_max_desc')} (+{maxEnergyBonus})
                </div>
              </div>
              <div className="booster-actions">
                <button onClick={() => buyBooster('maxenergy', 'coins')}>
                  {t('buy_for_coins')}
                </button>
                <button onClick={() => buyBooster('maxenergy', 'stars')}>
                  {t('buy_for_stars')}
                </button>
              </div>
            </div>

            <div className="booster-item neon-card">
              <div className="booster-main">
                <div className="booster-title">🧬 {t('booster_xp')}</div>
                <div className="booster-desc">
                  {t('booster_xp_desc')} (x{xpMultiplier.toFixed(1)})
                </div>
              </div>
              <div className="booster-actions">
                <button onClick={() => buyBooster('xp', 'coins')}>
                  {t('buy_for_coins')}
                </button>
                <button onClick={() => buyBooster('xp', 'stars')}>
                  {t('buy_for_stars')}
                </button>
              </div>
            </div>
          </div>
        )}

        {screen === 'squads' && <Squads friends={0} income={0} />}

        {screen === 'tasks' && (
          <div className="tasks-screen">
            <h2>{t('tasks_title')}</h2>
            <div className="tasks-balance">
              Токены за задания: {taskTokens}
            </div>

            {tasks.length === 0 && (
              <div className="tasks-empty">{t('tasks_empty')}</div>
            )}

            {tasks.map((task) => (
              <div key={task.id} className="task-item neon-card">
                <div className="task-main">
                  <div className="task-title">{task.title}</div>
                  <div className="task-reward">+{task.reward} токенов</div>
                </div>
                <button
                  className="task-btn"
                  disabled={task.done}
                  onClick={() => completeTask(task.id)}
                >
                  {task.done ? 'Выполнено' : 'Выполнить'}
                </button>
              </div>
            ))}
          </div>
        )}

        {screen === 'exchange' && (
          <div className="exchange-screen neon-card">
            <h2>{t('exchange_title')}</h2>
            <div className="exchange-text">
              {t('exchange_soon')}
            </div>
            <div className="exchange-sub">
              Следи за обновлениями — скоро можно будет выводить монеты на блокчейн.
            </div>
          </div>
        )}

        {screen === 'profile' && (
          <div className="profile-screen">
            <h2>{t('profile_title')}</h2>

            <div className="profile-card neon-card">
              <div className="profile-avatar-circle">
                <span>U</span>
              </div>
              <div className="profile-info">
                <div className="profile-name">User</div>
                <div className="profile-id">
                  ID: {userId || '—'}
                </div>
              </div>
            </div>

            <div className="profile-stats neon-card">
              <div className="stat-row"><span>Уровень:</span><span>{level}</span></div>
              <div className="stat-row"><span>Сила клика:</span><span>{clickPower}</span></div>
              <div className="stat-row"><span>Автокликер:</span><span>{autoClickLevel}</span></div>
              <div className="stat-row"><span>Макс энергия:</span><span>{BASE_MAX_ENERGY + maxEnergyBonus}</span></div>
              <div className="stat-row"><span>⭐ Звёзды:</span><span>{stars}</span></div>
              <div className="stat-row"><span>🎯 Токены за задания:</span><span>{taskTokens}</span></div>
            </div>

            <button
              className="ton-btn"
              onClick={() => {
                setWalletConnected(true);
                alert('Подключение TON кошелька будет добавлено позже');
              }}
            >
              {walletConnected ? 'Кошелёк подключен' : t('ton_connect')}
            </button>

            <button
              className="invite-btn neon-btn"
              style={{ marginTop: '12px' }}
              onClick={handleBuyStars}
            >
              Купить ⭐ через Telegram
            </button>

            <div className="lang-block neon-card">
              <h3>{t('lang')}</h3>
              <div className="lang-list">
                {LANGS.map((code) => (
                  <button
                    key={code}
                    className={code === lang ? 'active-lang' : ''}
                    onClick={() => changeLang(code)}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {isAdmin && (
              <div className="admin-block neon-card">
                <h3>{t('admin_panel')}</h3>
                <div className="admin-status">
                  Статус игры: {gamePaused ? 'Пауза' : 'Активна'}
                </div>
                <button onClick={toggleGameStatus}>
                  {t('admin_toggle_game')}
                </button>
                <button onClick={() => adminAddStars(10)}>
                  {t('admin_add_stars')} (+10)
                </button>
                <button onClick={() => adminAddCoins(1000)}>
                  {t('admin_add_coins')} (+1000)
                </button>
                <button onClick={adminAddTask}>
                  {t('admin_add_task')}
                </button>
                <button onClick={() => setIsAdmin(false)}>
                  {t('admin_logout')}
                </button>
              </div>
            )}

            <button className="reset-btn" onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              window.location.reload();
            }}>
              Сбросить прогресс
            </button>
          </div>
        )}
      </div>

      <div className="bottom-menu">
        <div
          className={`menu-item ${screen === 'home' ? 'active' : ''}`}
          onClick={() => setScreen('home')}
        >
          🏠
          <span>{t('home')}</span>
        </div>

        <div
          className={`menu-item ${screen === 'boosters' ? 'active' : ''}`}
          onClick={() => setScreen('boosters')}
        >
          ⚡
          <span>{t('boosters')}</span>
        </div>

        <div
          className={`menu-item ${screen === 'squads' ? 'active' : ''}`}
          onClick={() => setScreen('squads')}
        >
          👥
          <span>{t('squads')}</span>
        </div>

        <div
          className={`menu-item ${screen === 'tasks' ? 'active' : ''}`}
          onClick={() => setScreen('tasks')}
        >
          🎯
          <span>{t('tasks')}</span>
        </div>

        <div
          className={`menu-item ${screen === 'exchange' ? 'active' : ''}`}
          onClick={() => setScreen('exchange')}
        >
          🏦
          <span>{t('exchange')}</span>
        </div>

        <div
          className={`menu-item ${screen === 'profile' ? 'active' : ''}`}
          onClick={() => setScreen('profile')}
        >
          ⚙️
          <span>{t('profile')}</span>
        </div>
      </div>

      {levelUpText && (
        <div className="level-up-popup">
          {levelUpText}
        </div>
      )}

      {flyNumbers.map((f) => (
        <FlyNumber
          key={f.id}
          x={f.x}
          y={f.y}
          value={f.value}
          onEnd={() =>
            setFlyNumbers((arr) => arr.filter((item) => item.id !== f.id))
          }
        />
      ))}
    </div>
  );
}
