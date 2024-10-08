import { useEffect, useState } from 'react';
import TradingViewWidget from './TradingViewWidget';
import styles from './DashBoard.module.css'
import axios from 'axios';
import { changeNameKeys, changeNamesKeys } from '../../tools/changeNamesKeys';
import SelectCandle from './Dropdown';

function DashBoard() {
    const [data, setData] = useState([]);
    const [mint, setMint] = useState('ATerk5yWcsr4w3m4UvBms4bfw2M11NGZZDRSYjUWDRR4');
    const [range, setRange] = useState('1m');

    useEffect(() => {
        // Cargar los puntos iniciales de datos
        getCandlesData()

        const ws = new WebSocket('ws://localhost:8000/ws');
        ws.onopen = () => {
            ws.send(JSON.stringify({
                token: mint,
                timeframe: range
            }));
        };
        ws.onmessage = (event) => {
            const newCandle = changeNameKeys(JSON.parse(event.data));
            setData(prevData => {
                const index = prevData.findIndex(candle => candle.time === newCandle.time);
                if (index !== -1) {
                    const updatedData = [...prevData];
                    updatedData[index] = newCandle;
                    return updatedData;
                } else {
                    return [...prevData, newCandle];
                }
            });
        };
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        return () => {
            ws.close();
        };

    }, [range]);

    const getCandlesData = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/${range}/${mint}`);
            console.log(response.data);

            setData(changeNamesKeys(response.data))
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div className={styles.containerDashBoard}>
            <SelectCandle
                range={range}
                setRange={setRange}
            />
            <TradingViewWidget
                data={data}
            />
        </div>
    );
}

export default DashBoard;
