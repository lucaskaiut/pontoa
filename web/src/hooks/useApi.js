import axios from 'axios';
import { useEffect, useState } from "react";

const api = axios.create({
    baseURL: 'http://localhost:8080/api'
})

export function useApi(url) {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get(url).then(response => {
            setData(response.data);
        }) .finally(() => {
            setIsLoading(false);
        })
    }, []);

    return { data, isLoading };
}