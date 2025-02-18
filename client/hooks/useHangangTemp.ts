import { useState, useEffect } from 'react';

interface HangangResponse {
  STATUS: string;
  MSG: string;
  DATAs: {
    DATA: {
      HANGANG: {
        선유: {
          TEMP: number;
          LAST_UPDATE: string;
          PH: number;
        };
      };
    };
  };
}

export function useHangangTemp() {
  const [temp, setTemp] = useState<number | null>(null);

  useEffect(() => {
    const fetchTemp = async () => {
      try {
        const response = await fetch('https://api.hangang.life/');
        const data: HangangResponse = await response.json();
        setTemp(data.DATAs.DATA.HANGANG.선유.TEMP);
      } catch (error) {
        console.error('Failed to fetch Hangang temperature:', error);
      }
    };

    fetchTemp();
    const interval = setInterval(fetchTemp, 60000); // 1분마다 갱신

    return () => clearInterval(interval);
  }, []);

  return temp;
} 