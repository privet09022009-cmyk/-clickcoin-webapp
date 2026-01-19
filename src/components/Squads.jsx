import React from 'react';

export function Squads({ friends = 0, income = 0 }) {
  const invite = () => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.openTelegramLink(`https://t.me/share/url?url=Присоединяйся%20к%20моему%20скваду%20в%20ClickCoin!`);
    }
  };

  return (
    <div className="squads-panel">
      <h2>Твой сквад</h2>

      <div className="squad-row">
        <span>Друзей:</span>
        <span>{friends}</span>
      </div>

      <div className="squad-row">
        <span>Доход от друзей:</span>
        <span>{income}</span>
      </div>

      <div className="squad-hint">
        Приглашай друзей и получай 5% от их кликов (демо).
      </div>

      <button className="invite-btn" onClick={invite}>
        Пригласить друзей
      </button>
    </div>
  );
}