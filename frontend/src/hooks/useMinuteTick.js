import { useEffect, useState } from 'react';

const ONE_MINUTE_MS = 60 * 1000;

/**
 * Membuat komponen dirender ulang setiap menit,
 * agar teks seperti "Last seen 5m ago" tetap akurat.
 */
export default function useMinuteTick() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTick((previousTick) => previousTick + 1);
    }, ONE_MINUTE_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return tick;
}
