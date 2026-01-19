const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000;

// ТВОЙ Telegram ID (админ)
const ADMIN_ID = "7776133481";

app.use(cors());
app.use(express.json());

// Память вместо базы
let users = {}; // userId -> {...}
let maintenance = false;

// Бусты за звёзды (премиум)
let starBoosts = [
  { id: 1, type: "click_power", label: "+2 к силе клика", starsCost: 10, power: 2 },
  { id: 2, type: "click_power", label: "+5 к силе клика", starsCost: 20, power: 5 },
  { id: 3, type: "click_power", label: "+10 к силе клика", starsCost: 40, power: 10 },
  { id: 4, type: "energy_max", label: "+200 к макс. энергии", starsCost: 25, amount: 200 },
  { id: 5, type: "auto_click", label: "+1 уровень автокликера", starsCost: 30, amount: 1 },
  { id: 6, type: "multiplier", label: "+10% к общему фарму", starsCost: 50, percent: 10 },
];

// Бусты за коины (обычные)
let coinBoosts = [
  { id: 101, type: "click_power", label: "+1 к силе клика", coinsCost: 500, power: 1 },
  { id: 102, type: "click_power", label: "+3 к силе клика", coinsCost: 2000, power: 3 },
  { id: 103, type: "energy_max", label: "+100 к макс. энергии", coinsCost: 1500, amount: 100 },
  { id: 104, type: "auto_click", label: "+1 уровень автокликера", coinsCost: 5000, amount: 1 },
];

let tasks = [
  {
    id: 1,
    type: "daily",
    title: "Ежедневный бонус",
    rewardCoins: 500,
    rewardStars: 0,
  },
  {
    id: 2,
    type: "clicks",
    title: "Сделай 100 кликов",
    rewardCoins: 1000,
    rewardStars: 0,
  },
  {
    id: 3,
    type: "farm",
    title: "Заработай 5000 коинов",
    rewardCoins: 2000,
    rewardStars: 1,
  },
];

function getOrCreateUser(userId, referrerId = null) {
  if (!users[userId]) {
    users[userId] = {
      userId,
      coins: 0,
      stars: 0,
      clickPower: 1,
      energy: 500,
      maxEnergy: 500,
      level: 1,
      xp: 0,
      xpToNext: 1000,
      autoClickLevel: 0,
      multiplierPercent: 0,
      lastActiveAt: Date.now(),
      lastEnergyTick: Date.now(),
      referrerId: referrerId || null,
      totalFromRefs: 0,
      totalClicks: 0,
      totalEarned: 0,
      completedTasks: {},
      walletTon: null,
    };
  }
  return users[userId];
}

function addXp(user, amount) {
  user.xp += amount;
  while (user.xp >= user.xpToNext) {
    user.xp -= user.xpToNext;
    user.level += 1;
    user.xpToNext = Math.floor(user.xpToNext * 1.5);
    user.maxEnergy += 50;
    user.energy = user.maxEnergy;
  }
}

function applyOfflineIncome(user) {
  const now = Date.now();
  const diffMs = now - (user.lastActiveAt || now);
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes <= 0) {
    user.lastActiveAt = now;
    return 0;
  }

  const maxMinutes = 8 * 60;
  const effectiveMinutes = Math.min(diffMinutes, maxMinutes);
  const baseIncomePerMinute = user.autoClickLevel * 5;
  const multiplier = 1 + (user.multiplierPercent || 0) / 100;
  const income = Math.floor(baseIncomePerMinute * effectiveMinutes * multiplier);

  if (income <= 0) {
    user.lastActiveAt = now;
    return 0;
  }

  user.coins += income;
  user.totalEarned += income;
  addXp(user, Math.floor(income / 10));
  user.lastActiveAt = now;

  if (user.referrerId && users[user.referrerId]) {
    const refIncome = Math.floor(income * 0.05);
    users[user.referrerId].coins += refIncome;
    users[user.referrerId].totalFromRefs += refIncome;
  }

  return income;
}

function restoreEnergy(user) {
  const now = Date.now();
  const diffMs = now - (user.lastEnergyTick || now);
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds <= 0) return;

  const restore = Math.floor(diffSeconds / 5);
  if (restore > 0) {
    user.energy = Math.min(user.maxEnergy, user.energy + restore);
    user.lastEnergyTick = now;
  }
}

function isAdmin(req) {
  const userId = req.header("x-user-id");
  return userId && userId === ADMIN_ID;
}

// Авторизация/инициализация
app.post("/api/auth", (req, res) => {
  const { userId, referrerId } = req.body;
  if (!userId) return res.status(400).json({ error: "no_user_id" });

  const user = getOrCreateUser(userId, referrerId);
  const offlineIncome = applyOfflineIncome(user);
  restoreEnergy(user);

  res.json({
    user,
    offlineIncome,
    maintenance,
  });
});

// Профиль
app.get("/api/profile", (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId || !users[userId]) return res.status(404).json({ error: "not_found" });
  const user = users[userId];
  res.json({ user });
});

// Клик
app.post("/api/click", (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) return res.status(400).json({ error: "no_user_id" });
  const user = getOrCreateUser(userId);

  restoreEnergy(user);

  if (user.energy <= 0) {
    return res.status(400).json({ error: "no_energy" });
  }

  const multiplier = 1 + (user.multiplierPercent || 0) / 100;
  const gain = Math.floor(user.clickPower * multiplier);

  user.coins += gain;
  user.totalEarned += gain;
  user.totalClicks += 1;
  user.energy -= 1;
  user.lastActiveAt = Date.now();

  addXp(user, gain);

  if (user.referrerId && users[user.referrerId]) {
    const refIncome = Math.floor(gain * 0.05);
    users[user.referrerId].coins += refIncome;
    users[user.referrerId].totalFromRefs += refIncome;
  }

  res.json({
    coins: user.coins,
    energy: user.energy,
    level: user.level,
    xp: user.xp,
    xpToNext: user.xpToNext,
  });
});

// Тик энергии
app.post("/api/energy/tick", (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) return res.status(400).json({ error: "no_user_id" });
  const user = getOrCreateUser(userId);

  restoreEnergy(user);

  res.json({ energy: user.energy, maxEnergy: user.maxEnergy });
});

// Бусты
app.get("/api/boosts", (req, res) => {
  res.json({ starBoosts, coinBoosts });
});

// Купить буст за звёзды
app.post("/api/boosts/buy-stars", (req, res) => {
  const userId = req.header("x-user-id");
  const { boostId } = req.body;
  if (!userId) return res.status(400).json({ error: "no_user_id" });

  const user = getOrCreateUser(userId);
  const boost = starBoosts.find((b) => b.id === boostId);
  if (!boost) return res.status(404).json({ error: "no_boost" });

  if (user.stars < boost.starsCost) {
    return res.status(400).json({ error: "no_stars" });
  }

  user.stars -= boost.starsCost;

  if (boost.type === "click_power") {
    user.clickPower += boost.power;
  } else if (boost.type === "energy_max") {
    user.maxEnergy += boost.amount;
    user.energy = user.maxEnergy;
  } else if (boost.type === "auto_click") {
    user.autoClickLevel += boost.amount;
  } else if (boost.type === "multiplier") {
    user.multiplierPercent += boost.percent;
  }

  res.json({ user });
});

// Купить буст за коины
app.post("/api/boosts/buy-coins", (req, res) => {
  const userId = req.header("x-user-id");
  const { boostId } = req.body;
  if (!userId) return res.status(400).json({ error: "no_user_id" });

  const user = getOrCreateUser(userId);
  const boost = coinBoosts.find((b) => b.id === boostId);
  if (!boost) return res.status(404).json({ error: "no_boost" });

  if (user.coins < boost.coinsCost) {
    return res.status(400).json({ error: "no_coins" });
  }

  user.coins -= boost.coinsCost;

  if (boost.type === "click_power") {
    user.clickPower += boost.power;
  } else if (boost.type === "energy_max") {
    user.maxEnergy += boost.amount;
    user.energy = user.maxEnergy;
  } else if (boost.type === "auto_click") {
    user.autoClickLevel += boost.amount;
  }

  res.json({ user });
});

// Задания
app.get("/api/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/api/tasks/complete", (req, res) => {
  const userId = req.header("x-user-id");
  const { taskId } = req.body;
  if (!userId) return res.status(400).json({ error: "no_user_id" });

  const user = getOrCreateUser(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return res.status(404).json({ error: "no_task" });

  if (user.completedTasks[taskId]) {
    return res.status(400).json({ error: "already_completed" });
  }

  user.completedTasks[taskId] = true;
  user.coins += task.rewardCoins || 0;
  user.stars += task.rewardStars || 0;
  user.totalEarned += task.rewardCoins || 0;
  addXp(user, (task.rewardCoins || 0) / 5);

  res.json({ user });
});

// Друзья/рефералы
app.get("/api/friends", (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) return res.status(400).json({ error: "no_user_id" });

  const refs = Object.values(users).filter((u) => u.referrerId === userId);
  res.json({
    friends: refs.map((u) => ({
      userId: u.userId,
      totalEarned: u.totalEarned,
    })),
    totalFromRefs: users[userId]?.totalFromRefs || 0,
  });
});

// Админ: режим разработки
app.post("/api/admin/maintenance", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "not_admin" });
  const { value } = req.body;
  maintenance = Boolean(value);
  res.json({ maintenance });
});

// Админ: добавить задание
app.post("/api/admin/tasks", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "not_admin" });

  const { type, title, channelUrl, rewardCoins, rewardStars } = req.body;
  if (!type || !title) return res.status(400).json({ error: "missing_fields" });

  const newTask = {
    id: Date.now(),
    type,
    title,
    channelUrl: channelUrl || null,
    rewardCoins: rewardCoins || 0,
    rewardStars: rewardStars || 0,
  };

  tasks.push(newTask);
  res.json(newTask);
});

// Админ: удалить задание
app.delete("/api/admin/tasks/:id", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "not_admin" });
  const id = Number(req.params.id);
  tasks = tasks.filter((t) => t.id !== id);
  res.json({ ok: true });
});

// Админ: начислить звёзды (после покупки через Telegram Stars)
app.post("/api/admin/grant-stars", (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: "not_admin" });
  const { userId, stars } = req.body;
  if (!userId || !stars) return res.status(400).json({ error: "missing_fields" });

  const user = getOrCreateUser(userId);
  user.stars += Number(stars);
  res.json({ user });
});

app.listen(PORT, () => {
  console.log(`✅ ClickCoin backend запущен на http://localhost:${PORT}`);
});
