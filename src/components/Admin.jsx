import { useState } from "react";

const ADMIN_ID = "7776133481";

export default function Admin({
  userId,
  maintenance,
  setMaintenance,
  onCreateTask,
  onBuyStars,
  onConnectTon,
}) {
  const [title, setTitle] = useState("");
  const [rewardCoins, setRewardCoins] = useState(0);
  const [rewardStars, setRewardStars] = useState(0);
  const [link, setLink] = useState("");
  const [type, setType] = useState("generic");

  if (userId !== ADMIN_ID) {
    return (
      <div style={styles.notAdmin}>
        <h2>⛔ Доступ запрещён</h2>
        <p>Ты не админ.</p>
      </div>
    );
  }

  const createTask = () => {
    if (!title.trim()) return alert("Введите название задания");

    onCreateTask({
      id: Date.now(),
      title,
      rewardCoins: Number(rewardCoins),
      rewardStars: Number(rewardStars),
      link,
      type,
    });

    setTitle("");
    setRewardCoins(0);
    setRewardStars(0);
    setLink("");
  };

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.header}>⚙️ Админ‑панель ClickCoin</h1>

      {/* РЕЖИМ РАЗРАБОТКИ */}
      <div style={styles.block}>
        <h2 style={styles.blockTitle}>🛠️ Режим разработки</h2>
        <p style={styles.text}>
          Сейчас:{" "}
          <b style={{ color: maintenance ? "#f87171" : "#4ade80" }}>
            {maintenance ? "В разработке" : "Открыто"}
          </b>
        </p>
        <button
          style={styles.button}
          onClick={() => setMaintenance(!maintenance)}
        >
          {maintenance ? "Открыть игру" : "Включить разработку"}
        </button>
      </div>

      {/* ПОКУПКА ЗВЁЗД */}
      <div style={styles.block}>
        <h2 style={styles.blockTitle}>⭐ Покупка звёзд</h2>
        <p style={styles.text}>Игроки могут покупать звёзды через Telegram Stars</p>

        <button
          style={{ ...styles.button, background: "#fde047", color: "#000" }}
          onClick={onBuyStars}
        >
          Купить звёзды через Telegram ⭐
        </button>
      </div>

      {/* TON CONNECT */}
      <div style={styles.block}>
        <h2 style={styles.blockTitle}>💎 TON Connect</h2>
        <p style={styles.text}>Подключение TON‑кошелька (пока заглушка)</p>

        <button
          style={{ ...styles.button, background: "#3b82f6" }}
          onClick={onConnectTon}
        >
          Подключить TON‑кошелёк
        </button>
      </div>

      {/* СОЗДАНИЕ ЗАДАНИЯ */}
      <div style={styles.block}>
        <h2 style={styles.blockTitle}>📝 Создать задание</h2>

        <label style={styles.label}>Название задания</label>
        <input
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Подпишись на канал"
        />

        <label style={styles.label}>Тип задания</label>
        <select
          style={styles.input}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="generic">Обычное</option>
          <option value="daily">Ежедневное</option>
          <option value="clicks">Клики</option>
          <option value="farm">Фарм</option>
        </select>

        <label style={styles.label}>Ссылка (опционально)</label>
        <input
          style={styles.input}
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://t.me/..."
        />

        <label style={styles.label}>Награда (коины)</label>
        <input
          style={styles.input}
          type="number"
          value={rewardCoins}
          onChange={(e) => setRewardCoins(e.target.value)}
        />

        <label style={styles.label}>Награда (звёзды)</label>
        <input
          style={styles.input}
          type="number"
          value={rewardStars}
          onChange={(e) => setRewardStars(e.target.value)}
        />

        <button style={styles.button} onClick={createTask}>
          Создать задание
        </button>
      </div>
    </div>
  );
}

// ===================== СТИЛИ =====================

const styles = {
  wrapper: {
    padding: "20px",
    color: "#fff",
    fontFamily: "system-ui",
  },
  header: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "20px",
    textAlign: "center",
    background: "linear-gradient(90deg, #facc15, #f97316)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
  block: {
    background: "#0f172a",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "20px",
    border: "1px solid #1e293b",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
  },
  blockTitle: {
    fontSize: "20px",
    marginBottom: "10px",
  },
  text: {
    fontSize: "14px",
    marginBottom: "10px",
    color: "#cbd5e1",
  },
  label: {
    fontSize: "14px",
    marginTop: "10px",
    marginBottom: "4px",
    display: "block",
    color: "#cbd5e1",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#fff",
    marginBottom: "10px",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  notAdmin: {
    padding: "40px",
    textAlign: "center",
    color: "#fff",
  },
};
