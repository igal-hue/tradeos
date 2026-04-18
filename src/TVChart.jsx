import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function TVChart({ symbol }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current) return;
    const init = () => {
      const width = ref.current.offsetWidth || 600;
      const chart = createChart(ref.current, {
        width,
        height: 400,
        layout: { background: { color: '#0d0d18' }, textColor: '#d1d4dc' },
        grid: { vertLines: { color: '#1a1a2e' }, horzLines: { color: '#1a1a2e' } },
      });
      const series = chart.addCandlestickSeries({
        upColor: '#00ff87',
        downColor: '#ff6b6b',
        borderVisible: false,
        wickUpColor: '#00ff87',
        wickDownColor: '#ff6b6b',
      });
      series.setData([
        { time: '2025-01-01', open: 100, high: 110, low: 95, close: 105 },
        { time: '2025-01-02', open: 105, high: 115, low: 100, close: 112 },
        { time: '2025-01-03', open: 112, high: 118, low: 108, close: 108 },
        { time: '2025-01-06', open: 108, high: 122, low: 106, close: 120 },
        { time: '2025-01-07', open: 120, high: 125, low: 115, close: 118 },
      ]);
      chart.timeScale().fitContent();
      return chart;
    };
    const timer = setTimeout(() => {
      ref._chart = init();
    }, 100);
    return () => {
      clearTimeout(timer);
      if (ref._chart) { ref._chart.remove(); ref._chart = null; }
    };
  }, [symbol]);
  return <div ref={ref} style={{width:'100%',height:'400px',borderRadius:'8px'}} />;
}
