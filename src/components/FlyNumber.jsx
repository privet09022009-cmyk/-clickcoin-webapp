import { useEffect, useState } from "react";

export default function FlyNumber({ value, x, y, onEnd }) {
  const [style, setStyle] = useState({
    position: "fixed",
    left: x,
    top: y,
    fontSize: "26px",
    fontWeight: "700",
    color: "#facc15",
    textShadow: "0 0 10px rgba(250,204,21,0.8)",
    pointerEvents: "none",
    opacity: 1,
    transform: "translateY(0px)",
    transition: "all 0.8s ease-out",
    zIndex: 9999,
  });

  useEffect(() => {
    // Анимация запускается через 20ms
    const t = setTimeout(() => {
      setStyle((prev) => ({
        ...prev,
        opacity: 0,
        transform: "translateY(-60px)",
      }));
    }, 20);

    // Удаление через 900ms
    const end = setTimeout(() => {
      onEnd();
    }, 900);

    return () => {
      clearTimeout(t);
      clearTimeout(end);
    };
  }, []);

  return <div style={style}>+{value}</div>;
}
