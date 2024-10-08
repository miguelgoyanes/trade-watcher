

function generateNextDataPoint(timeInterval, existingDataPoints) {
    const existingPoint = existingDataPoints[existingDataPoints.length - 1]
    
    const trend = existingPoint.close - existingPoint.open;
    
    const variation = (Math.random() - 0.5) * 0.1;
    const newPrice = existingPoint.close + (trend * 0.1) + variation;
    
    const time = existingPoint.time + timeInterval;

    const minute = Math.floor(time / 60);

    const lastCandleMinute = Math.floor(existingPoint.time / 60)
    
    if (minute === lastCandleMinute) {
        // Update the existing point;
        existingPoint.close = newPrice;
        existingPoint.high = Math.max(existingPoint.high, newPrice);
        existingPoint.low = Math.min(existingPoint.low, newPrice);
        existingPoint.time = time
    } else {
        // Create a new data point and add it to the array
        const newPoint = { 
            open: existingPoint.close, 
            high: Math.max(existingPoint.close, newPrice), 
            low: Math.min(existingPoint.close, newPrice), 
            close: newPrice,
            time };
        existingDataPoints.push(newPoint);
    }

    return existingDataPoints;
}

function initialLoad(startTime, totalTime, timeInterval) {
    let dataPoints = [{open: 10.95, close: 11, high: 11.1, low: 10.9, time: startTime}];
    let currentTimestamp = startTime;

    while (currentTimestamp < startTime + totalTime - 60) {
        dataPoints = generateNextDataPoint(timeInterval, dataPoints);
        currentTimestamp = dataPoints[dataPoints.length - 1].time;
    }

    return dataPoints;
}

export { initialLoad, generateNextDataPoint };