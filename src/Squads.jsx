import React from 'react';

export function Squads({ friends = 0, income = 0 }) {
  return (
    <div className="squads-panel">
      <h2>Сквад</h2>

      <div className="squad-row">
        <span>Приглашено друзей:</span>
        <span>{friends}</span>
      </div>

      <div className="squad-row">
        <span>Доход от друзей:</span>
        <span>{income} 💰</span>
      </div>

      <div className="squad-hint">
        Приглашай друзей по реферальной ссылке и получай бонусы!
      </div>

      <button
        className="invite-btn"
        onClick={() => {
          const link = 'https://t.me/your_bot?start=ref123';
          navigator.clipboard.writeText(link);
          alert('Реферальная ссылка скопирована!');
        }}
      >
        Скопировать реферальную ссылку
      </button>
    </div>
  );
}
