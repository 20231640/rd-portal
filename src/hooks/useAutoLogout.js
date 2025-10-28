import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useAutoLogout(timeout = 15 * 60 * 1000) { // 15 minutos para teste
  const navigate = useNavigate();
  const logoutTimer = useRef(null);
  const warningTimer = useRef(null);
  const countdownInterval = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const logout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const startCountdown = () => {
    setCountdown(60);
    clearInterval(countdownInterval.current);
    countdownInterval.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    clearTimeout(logoutTimer.current);
    clearTimeout(warningTimer.current);
    clearInterval(countdownInterval.current);
    setShowWarning(false);
    setCountdown(60);

    // Logout após timeout
    logoutTimer.current = setTimeout(logout, timeout);

    // Mostrar aviso 1 minuto antes
    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, timeout - 60 * 1000);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer(); // iniciar timer

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(logoutTimer.current);
      clearTimeout(warningTimer.current);
      clearInterval(countdownInterval.current);
    };
  }, []);

  return { showWarning, countdown, resetTimer };
}

