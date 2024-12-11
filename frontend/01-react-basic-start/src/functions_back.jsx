import { useState, useEffect } from "react";

export function sendRequest(path) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:8000${path}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const {data_from_server, token} = await response.json();
                console.log(token);
                setData(token);
            } catch (error) {
                setError(error);
                console.error("Fetch error: ", error);
            }
        };
        
        fetchData();
    }, [path]); // Зависимость path для повторного вызова, если path изменится

    return {data}; // Возвращаем данные и ошибку
}