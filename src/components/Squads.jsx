import { useState } from "react";

export default function Squads({ userId }) {
  const [squad, setSquad] = useState(null);
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // Локальная база (пока без сервера)
  const [allSquads, setAllSquads] = useState([]);

  const createSquad = () => {
    if (!createName.trim()) return alert("Введите название отряда");

    const newSquad = {
      id: Date.now(),
      name: createName,
      leader: userId,
      members: [
        {
          id: userId,
          coins: 0,
          stars: 0,
          power: 1,
        },
      ],
      totalCoins: 0,
      totalPower: 1,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    };

    setAllSquads((prev) => [...prev, newSquad]);
    setSquad(newSquad);
    setCreateName("");
  };

  const joinSquad = () => {
    const found = allSquads.find((s) => s.code === joinCode.trim());
    if (!found) return alert("Отряд не найден");

    if (found.members.find((m) => m.id === userId))
      return alert("Ты уже в этом отряде");

    const updated = {
      ...found,
      members: [
        ...found.members,
        { id: userId, coins: 0, stars: 0, power: 1 },
      ],
      totalPower: found.totalPower + 1,
    };

    setAllSquads((prev) =>
      prev.map((s) => (s.id === found.id ? updated : s))
    );
    setSquad(updated);
    setJoinCode("");
  };

  const leaveSquad = () => {
    if (!squad) return;

    const updatedMembers = squad.members.filter((m) => m.id !== userId);

    if (updatedMembers.length === 0) {
      // удаляем отряд
      setAllSquads((prev) => prev.filter((s) => s.id !== squad.id));
      setSquad(null);
      return;
    }

    const updated = {
      ...squad,
      members: updatedMembers,
      totalPower: updatedMembers.reduce((a, b) => a + b.power, 0),
    };

    setAllSquads((prev) =>
      prev.map((s) => (s.id === squad.id ? updated : s))
    );
    setSquad(null);
  };

  // UI
  if (!squad) {
    return (
      <div style={styles.wrapper}>
        <h2 style={styles.header}>👥 Отряды</h2>

        <div style={styles.block}>
          <h3 style={styles.title}>Создать отряд</h3>
          <input
            style={styles.input}
            placeholder="Название отряда"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
          <button style={styles.button} onClick={createSquad}>
            Создать
          </button>
        </div>

        <div style={styles.block}>
          <h3 style={styles.title}>Вступить в отряд</h3>
          <input
            style={styles.input}
            placeholder="Код отряда"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button style={styles.button} onClick={joinSquad}>
            Вступить
          </button>
        </div>

        {allSquads.length > 0 && (
          <div style={styles.block}>
            <h3 style={styles.title}>Популярные отряды</h3>
            {allSquads.map((s) => (
              <div key={s.id} style={styles.squadCard}>
                <div style={styles.squadName}>{s.name}</div>
                <div style={styles.squadInfo}>
                  👑 Лидер: {s.leader}
                  <br />
                  👥 Участники: {s.members.length}
                  <br />
                  💪 Сила: {s.totalPower}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Если игрок в отряде
  return (
    <div style={styles.wrapper}>
      <h2 style={styles.header}>🔥 {squad.name}</h2>

      <div style={styles.block}>
        <h3 style={styles.title}>Информация</h3>
        <p style={styles.text}>Код отряда: <b>{squad.code}</b></p>
        <p style={styles.text}>Лидер: {squad.leader}</p>
        <p style={styles.text}>Участников: {squad.members.length}</p>
        <p style={styles.text}>Общая сила: {squad.totalPower}</p>
      </div>

      <div style={styles.block}>
        <h3 style={styles.title}>Участники</h3>
        {squad.members.map((m) => (
          <div key={m.id} style={styles.memberCard}>
            <div style={styles.memberName}>ID: {m.id}</div>
            <div style={styles.memberStats}>
              🪙 {m.coins} | ⭐ {m.stars} | 💪 {m.power}
            </div>
          </div>
        ))}
      </div>

      <button style={styles.leaveBtn} onClick={leaveSquad}>
        Покинуть отряд
      </button>
    </div>
  );
}

// ====================== СТИЛИ ======================

const styles = {
  wrapper: {
    padding: "16px",
    color: "#fff",
    fontFamily: "system-ui",
  },
  header: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "16px",
    textAlign: "center",
    background: "linear-gradient(90deg, #facc15, #f97316)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
  block: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "14px",
    marginBottom: "16px",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
  },
  title: {
    fontSize: "18px",
    marginBottom: "10px",
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
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  squadCard: {
    padding: "10px",
    background: "#020617",
    borderRadius: "10px",
    border: "1px solid #1e293b",
    marginBottom: "10px",
  },
  squadName: {
    fontSize: "16px",
    fontWeight: "700",
  },
  squadInfo: {
    fontSize: "13px",
    color: "#cbd5e1",
    marginTop: "4px",
  },
  memberCard: {
    padding: "10px",
    background: "#020617",
    borderRadius: "10px",
    border: "1px solid #1e293b",
    marginBottom: "10px",
  },
  memberName: {
    fontSize: "14px",
    fontWeight: "600",
  },
  memberStats: {
    fontSize: "13px",
    color: "#cbd5e1",
  },
  text: {
    fontSize: "14px",
    marginBottom: "6px",
  },
  leaveBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #dc2626, #b91c1c)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "10px",
  },
};
