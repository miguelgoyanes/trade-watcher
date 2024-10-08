import { useEffect, useState } from 'react';
import { initialLoad, generateNextDataPoint } from '../../tools/tools';
import TradingViewWidget from './TradingViewWidget'; 
import styles from './DashBoard.module.css'

function DashBoard() {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Cargar los puntos iniciales de datos
        const newPoints = initialLoad(1642427876, 3600, 10);
        setData(newPoints);

        // Establecer un intervalo para actualizar los datos
        const interval = setInterval(() => {
            setData(prevData => {
                if (prevData.length > 0) {
                    const newData = generateNextDataPoint(10, prevData);
                    return [...newData]; 
                }
                return prevData;
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []); 
    

    return (
        <div className={styles.containerDashBoard}>
            <TradingViewWidget
                data={data} 
            />
        </div>
    );
}

export default DashBoard;
