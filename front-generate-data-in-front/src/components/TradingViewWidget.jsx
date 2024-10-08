import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

function TradingViewWidget({ data }) {
    const chartContainerRef = useRef();
    const candlestickSeriesRef = useRef(null); // Ref para la serie de velas

    useEffect(() => {
        // Opciones de estilo del gráfico para que coincida con la estética oscura
        const chartOptions = {
            width: 927,
            height: 319,
            layout: {
                background: {
                    type: 'solid',
                    color: '#131722',
                },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: {
                    color: '#2B2B43',
                },
                horzLines: {
                    color: '#2B2B43',
                },
            },
            crosshair: {
                mode: 0,
            },
            priceScale: {
                borderColor: '#485c7b',
            },
            timeScale: {
                borderColor: '#485c7b',
            },
        };

        // Crear el gráfico con las opciones anteriores
        const chart = createChart(chartContainerRef.current, chartOptions);

        // Agregar la serie de velas japonesas con los colores personalizados
        candlestickSeriesRef.current = chart.addCandlestickSeries({
            upColor: '#4CAF50',
            downColor: '#FF5252',
            borderVisible: false,
            wickUpColor: '#4CAF50',
            wickDownColor: '#FF5252',
        });

        chart.timeScale().fitContent();

        return () => chart.remove(); // Limpiar el gráfico cuando se desmonte el componente
    }, []);

    useEffect(() => {
        if (candlestickSeriesRef.current && data) {
            candlestickSeriesRef.current.setData(data);
        }
    }, [data]);

    return <div ref={chartContainerRef} style={{ position: 'relative', width: '100%', height: '100%' }} />;
}

export default TradingViewWidget;
