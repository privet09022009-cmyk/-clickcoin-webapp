import express from "express";
import cors from "cors";
import { Telegraf } from "telegraf";

const BOT_TOKEN = "ТВОЙ_ТОКЕН_БОТА";
const PAYMENT_PROVIDER_TOKEN = "ТВОЙ_PROVIDER_TOKEN"; // от BotFather
const ADMIN_ID = 7776133481;

const app = express();
app.use(cors());
app.use(express.json());

const bot = new Telegraf(BOT_TOKEN);

// Хранилище пользователей (вместо БД)
const users = {}; 
// users[userId] = { stars: 0 }

// =========================
// 1) Создание инвойса
// =========================

app.post("/api/create-stars-invoice", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.json({ ok: false, error: "No userId" });
  }

  // Пакеты звёзд
  const packs = [
    { label: "10 ⭐", amount: 199, stars: 10 },
    { label: "50 ⭐", amount: 799, stars: 50 },
    { label: "100 ⭐", amount: 1299, stars: 100 },
  ];

  // Создаём invoice ссылку
  try {
    const invoiceUrl = await bot.telegram.createInvoiceLink({
      title: "Покупка звёзд",
      description: "Пополнение баланса звёзд",
      payload: String(userId),
      provider_token: PAYMENT_PROVIDER_TOKEN,
      currency: "PLN",
      prices: packs.map((p) => ({
        label: p.label,
        amount: p.amount * 100, // копейки
      })),
    });

    return res.json({ ok: true, invoiceUrl });
  } catch (err) {
    console.log("Invoice error:", err);
    return res.json({ ok: false, error: "Invoice creation failed" });
  }
});

// =========================
// 2) Обработка успешной оплаты
// =========================

bot.on("successful_payment", async (ctx) => {
  const payment = ctx.message.successful_payment;
  const userId = ctx.from.id;

  const amount = payment.total_amount; // в копейках

  let stars = 0;
  if (amount === 19900) stars = 10;
  if (amount === 79900) stars = 50;
  if (amount === 129900) stars = 100;

  if (!users[userId]) users[userId] = { stars: 0 };
  users[userId].stars += stars;

  await ctx.reply(`🎉 Покупка успешна! Вам начислено ${stars} ⭐`);
});

// =========================
// 3) Получение баланса звёзд
// =========================

app.get("/api/get-stars/:id", (req, res) => {
  const id = req.params.id;
  const stars = users[id]?.stars || 0;
  res.json({ stars });
});

// =========================
// 4) Админ: выдать звёзды
// =========================

app.post("/api/admin/add-stars", (req, res) => {
  const { adminId, targetId, amount } = req.body;

  if (adminId !== ADMIN_ID) {
    return res.json({ ok: false, error: "Not admin" });
  }

  if (!users[targetId]) users[targetId] = { stars: 0 };
  users[targetId].stars += amount;

  return res.json({ ok: true });
});

// =========================
// 5) Запуск сервера
// =========================

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});

bot.launch();
