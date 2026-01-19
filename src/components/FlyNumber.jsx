import React, { useEffect, useState } from 'react';

export function FlyNumber({ value, x, y, onEnd }) {
  const [style, setStyle] = useState({
    left: x,
    top: y,
    opacity: 1,
    transform: 'translate(-50%, -50%) translateY(0px)',
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setStyle((s) => ({
        ...s,
        opacity: 0,
        transform: 'translate(-50%, -50%) translateY(-40px)',
      }));
    }, 10);

    const t2 = setTimeout(() => {
      onEnd();
    }, 450);

    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [onEnd]);

  return (
    <div className="fly-number" style={style}>
      +{value}
    </div>
  );
}