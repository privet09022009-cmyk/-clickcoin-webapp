import { useEffect, useState } from "react";
import Admin from "./components/Admin";
import FlyNumber from "./components/FlyNumber";
import Squads from "./components/Squads";
import "./App.css";

const API_URL = "http://localhost:4000/api";
const ADMIN_ID = "7776133481";

// =============== API HELPERS ===============
async function apiAuth(userId, referrerId = null) {
  const res = await fetch(`${API_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, referrerId }),
  });
  return res.json();
}

async function apiClick(userId) {
  const res = await fetch(`${API_URL}/click`, {
    method: "POST",
    headers: { "x-user-id": userId },
  });
  return res.json();
}

async function apiEnergyTick(userId) {
  const res = await fetch(`${API_URL}/energy/tick`, {
    method: "POST",
    headers: { "x-user-id": userId },
  });
  return res.json();
}

async function apiGetTasks() {
  const res = await fetch(`${API_URL}/tasks`);
  return res.json();
}

async function apiCompleteTask(userId, taskId) {
  const res = await fetch(`${API_URL}/tasks/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({ taskId }),
  });
  return res.json();
}

async function apiGetFriends(userId) {
  const res = await fetch(`${API_URL}/friends`, {
    headers: { "x-user-id": userId },
  });
  return res.json();
}

async function apiAdminSetMaintenance(userId, value) {
  const res = await fetch(`${API_URL}/admin/maintenance`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify({ value }),
  });
  return res.json();
}

async function apiAdminAddTask(userId, task) {
  const res = await fetch(`${API_URL}/admin/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": userId },
    body: JSON.stringify(task),
  });
  return res.json();
}

// =============== APP ===============
export default function App() {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);

  const [coins, setCoins] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [maxEnergy, setMaxEnergy] = useState(500);

  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToNext, setXpToNext] = useState(1000);

  const [offlineIncome, setOfflineIncome] = useState(0);

  const [tasks, setTasks] = useState([]);
  const [friends, setFriends] = useState([]);
  const [totalFromRefs, setTotalFromRefs] = useState(0);

  const [maintenance, setMaintenance] = useState(false);
  const [tab, setTab] = useState("home");

  const [fly, setFly] = useState([]);

  // TON кошелёк
  const [tonAddress, setTonAddress] = useState("TON_WALLET_SOON");

  // Сундук раз в 24 часа
  const [chestAvailable, setChestAvailable] = useState(false);
  const [chestNextAt, setChestNextAt] = useState(null);

  const isAdmin = userId === ADMIN_ID;

  // =============== INIT ===============
  useEffect(() => {
    let tgUserId = null;
    let referrerId = null;

    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      tgUserId = window.Telegram.WebApp.initDataUnsafe.user.id.toString();
      const startParam = window.Telegram.WebApp.initDataUnsafe.start_param;
      if (startParam) referrerId = startParam;
    } else {
      tgUserId = "debug-user-1";
    }

    setUserId(tgUserId);

    const init = async () => {
      const auth = await apiAuth(tgUserId, referrerId);
      setUser(auth.user);
      setCoins(auth.user.coins);
      setEnergy(auth.user.energy);
      setMaxEnergy(auth.user.maxEnergy);
      setLevel(auth.user.level);
      setXp(auth.user.xp);
      setXpToNext(auth.user.xpToNext);
      setOfflineIncome(auth.offlineIncome);
      setMaintenance(auth.maintenance);

      if (auth.user.tonAddress) {
        setTonAddress(auth.user.tonAddress);
      }

      const t = await apiGetTasks();
      setTasks(t);

      const f = await apiGetFriends(tgUserId);
      setFriends(f.friends);
      setTotalFromRefs(f.totalFromRefs);

      // Сундук (24 часа)
      const lastChest = localStorage.getItem("cc_last_lucky_chest");
      if (!lastChest) {
        setChestAvailable(true);
      } else {
        const last = new Date(lastChest).getTime();
        const now = Date.now();
        const diff = now - last;
        if (diff >= 24 * 60 * 60 * 1000) {
          setChestAvailable(true);
        } else {
          setChestAvailable(false);
          setChestNextAt(last + 24 * 60 * 60 * 1000);
        }
      }
    };

    init();
  }, []);

  // =============== ENERGY TICK ===============
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(async () => {
      const res = await apiEnergyTick(userId);
      setEnergy(res.energy);
      setMaxEnergy(res.maxEnergy);
    }, 8000);
    return () => clearInterval(interval);
  }, [userId]);

  // =============== CLICK ===============
  const handleClick = async (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    setFly((prev) => [
      ...prev,
      { id: Date.now(), x, y, value: user?.clickPower || 1 },
    ]);

    const res = await apiClick(userId);
    if (res.error) return;

    setCoins(res.coins);
    setEnergy(res.energy);
    setLevel(res.level);
    setXp(res.xp);
    setXpToNext(res.xpToNext);
  };

  // =============== TASKS ===============
  const completeTask = async (id) => {
    const res = await apiCompleteTask(userId, id);
    if (res.error) return alert("Ошибка");
    setUser(res.user);
    setCoins(res.user.coins);
  };

  // =============== ADMIN ===============
  const createTask = async (task) => {
    const res = await apiAdminAddTask(userId, task);
    setTasks((prev) => [...prev, res]);
  };

  const toggleMaintenance = async (value) => {
    const res = await apiAdminSetMaintenance(userId, value);
    setMaintenance(res.maintenance);
  };

  // =============== TON CONNECT ===============
  const connectTon = () => {
    alert("TON Connect будет подключён позже");
  };

  // =============== REF LINK ===============
  const refLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/?start=${userId || ""}`
      : "";

  // =============== XP BAR ===============
  const xpPercent =
    xpToNext > 0 ? Math.min(100, Math.round((xp / xpToNext) * 100)) : 0;

  // =============== CHEST ===============
  const formatTimeLeft = (ts) => {
    if (!ts) return "";
    const diff = ts - Date.now();
    if (diff <= 0) return "00:00:00";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    const pad = (n) => (n < 10 ? `0${n}` : n);
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const openLuckyChest = () => {
    if (!chestAvailable) return;

    // Рандом от 1 до 2000 монет
    const reward = 1 + Math.floor(Math.random() * 2000);

    setCoins((c) => c + reward);
    setChestAvailable(false);

    const now = Date.now();
    localStorage.setItem("cc_last_lucky_chest", new Date(now).toISOString());
    setChestNextAt(now + 24 * 60 * 60 * 1000);

    alert(`Ты получил +${reward} 🪙 из сундука!`);

    setFly((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        value: `CHEST +${reward}`,
      },
    ]);
  };

  // =============== UI SCREENS ===============

  const renderHome = () => (
    <div className="screen">
      <h2>Холм</h2>

      {offlineIncome > 0 && (
        <div className="offline-banner">
          Пока тебя не было, автокликер заработал 🪙 {offlineIncome}
        </div>
      )}

      {/* XP LINE */}
      <div
        style={{
          marginBottom: 12,
          background: "#020617",
          borderRadius: 999,
          border: "1px solid #1e293b",
          padding: 4,
        }}
      >
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
            width: `${xpPercent}%`,
            transition: "width 0.2s ease",
          }}
        />
        <div
          style={{
            fontSize: 11,
            textAlign: "center",
            marginTop: 2,
            color: "#cbd5e1",
          }}
        >
          Уровень {level} • XP {xp}/{xpToNext}
        </div>
      </div>

      <button
        className="big-click-btn"
        onClick={handleClick}
        disabled={energy <= 0}
      >
        🟡 TAP
      </button>

      <p className="hint">
        Энергия: {energy}/{maxEnergy}
      </p>

      {/* Сундук */}
      <div className="profile-block" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>🎁 Сундук</h3>
        <p style={{ fontSize: 13, color: "#cbd5e1" }}>
          Открывай раз в 24 часа. Награда: 1–2000 🪙.
        </p>
        <button
          className="small-btn"
          disabled={!chestAvailable}
          onClick={openLuckyChest}
          style={{ opacity: chestAvailable ? 1 : 0.5 }}
        >
          {chestAvailable
            ? "Открыть сундук"
            : `Перезарядка: ${formatTimeLeft(chestNextAt)}`}
        </button>
      </div>

      {fly.map((f) => (
        <FlyNumber
          key={f.id}
          value={f.value}
          x={f.x}
          y={f.y}
          onEnd={() => setFly((prev) => prev.filter((i) => i.id !== f.id))}
        />
      ))}
    </div>
  );

  const renderTasks = () => (
    <div className="screen">
      <h2>Задания</h2>

      {tasks.map((t) => (
        <div key={t.id} className="task-card">
          <div className="task-title">{t.title}</div>
          {t.link && (
            <a href={t.link} target="_blank" className="task-link">
              Открыть
            </a>
          )}
          <div className="task-reward">🪙 {t.rewardCoins}</div>
          <button className="small-btn" onClick={() => completeTask(t.id)}>
            Выполнено
          </button>
        </div>
      ))}
    </div>
  );

  const renderFriends = () => (
    <div className="screen">
      <h2>Друзья</h2>
      <p>Всего заработано от друзей: 🪙 {totalFromRefs}</p>

      <div className="profile-block">
        <div style={{ fontSize: 13, marginBottom: 6 }}>
          Твоя реферальная ссылка:
        </div>
        <div
          style={{
            fontSize: 12,
            background: "#020617",
            borderRadius: 8,
            padding: 8,
            border: "1px solid #1e293b",
            wordBreak: "break-all",
          }}
        >
          {refLink}
        </div>
      </div>

      {friends.map((f) => (
        <div key={f.userId} className="friend-row">
          <div>ID: {f.userId}</div>
          <div>Он нафармил: 🪙 {f.totalEarned}</div>
        </div>
      ))}
    </div>
  );

  const renderProfile = () => (
    <div className="screen">
      <h2>Профиль</h2>

      <div className="profile-block">
        <p>ID: {userId}</p>
        <p>Коины: {coins}</p>
        <p>Уровень: {level}</p>
        <p>Доход от друзей: {totalFromRefs}</p>
      </div>

      <div className="profile-block">
        <h3 style={{ marginTop: 0 }}>💎 TON кошелёк</h3>
        <p>Адрес: {tonAddress}</p>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>
          В будущем здесь будет обмен коинов на TON / токен ClickCoin.
        </p>
        <button className="small-btn" onClick={connectTon}>
          Подключить TON
        </button>
      </div>
    </div>
  );

  const renderSquads = () => (
    <div className="screen">
      <Squads userId={userId} />
    </div>
  );

  const renderMarket = () => (
    <div className="screen">
      <h2>Торговля</h2>

      <div className="profile-block">
        <h3 style={{ marginTop: 0 }}>🪙 ClickCoin Token</h3>
        <p style={{ fontSize: 14, color: "#cbd5e1" }}>
          Токен ещё не вышел на биржу.
        </p>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>
          Мы готовим листинг на биржах. Следите за обновлениями.
        </p>
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 10,
            background: "rgba(148,163,184,0.1)",
            border: "1px dashed #64748b",
            fontSize: 13,
          }}
        >
          Статус: <b>Pre‑Market</b>
        </div>
      </div>
    </div>
  );

  if (maintenance && !isAdmin) {
    return (
      <div className="screen center">
        <h2>Приложение в разработке</h2>
      </div>
    );
  }

  return (
    <div className="app">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="top-item">🪙 {coins}</div>
        <div className="top-item">
          ⚡ {energy}/{maxEnergy}
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">
        {tab === "home" && renderHome()}
        {tab === "tasks" && renderTasks()}
        {tab === "friends" && renderFriends()}
        {tab === "market" && renderMarket()}
        {tab === "squads" && renderSquads()}
        {tab === "profile" && renderProfile()}
        {tab === "admin" && (
          <Admin
            userId={userId}
            maintenance={maintenance}
            setMaintenance={toggleMaintenance}
            onCreateTask={createTask}
            onConnectTon={connectTon}
          />
        )}
      </div>

      {/* NAV */}
      <div className="bottom-nav">
        <button
          className={`nav-btn ${tab === "home" ? "active" : ""}`}
          onClick={() => setTab("home")}
        >
          Холм
        </button>
        <button
          className={`nav-btn ${tab === "tasks" ? "active" : ""}`}
          onClick={() => setTab("tasks")}
        >
          Задания
        </button>
               <button
          className={`nav-btn ${tab === "friends" ? "active" : ""}`}
          onClick={() => setTab("friends")}
        >
          Друзья
        </button>
        <button
          className={`nav-btn ${tab === "market" ? "active" : ""}`}
          onClick={() => setTab("market")}
        >
          Торговля
        </button>
        <button
          className={`nav-btn ${tab === "squads" ? "active" : ""}`}
          onClick={() => setTab("squads")}
        >
          Сквады
        </button>
        <button
          className={`nav-btn ${tab === "profile" ? "active" : ""}`}
          onClick={() => setTab("profile")}
        >
          Профиль
        </button>
        {isAdmin && (
          <button
            className={`nav-btn ${tab === "admin" ? "active" : ""}`}
            onClick={() => setTab("admin")}
          >
            Админ
          </button>
        )}
      </div>
    </div>
  );
}
