import React, { useEffect, useState } from 'react';

export function FlyNumber({ x, y, value, onEnd }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onEnd && onEnd();
    }, 500);
    return () => clearTimeout(t);
  }, [onEnd]);

  if (!visible) return null;

  return (
    <div
      className="fly-number"
      style={{
        left: x,
        top: y - 20
      }}
    >
      +{value}
    </div>
  );
}
