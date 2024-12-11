import { useState,  useEffect} from "react"
export default function GetJWT() {
    const [jwt, setJwt] = useState("");
    useEffect(() => {
        const fetchData = async() => {
            const result = await fetch("http://localhost:8000/create_token?id=1").then((response) => response.json())
            // const token = result.json()
            // console.log(token)
            // setJwt(token.result)
            console.log(result)
            setJwt(result.token)
        }
        fetchData()
    }, [])
    //   let res = await axios.get("http://127.0.0.1:8000/create_token?id=1").then((response) => {
    //     setJwt(response.data)});
    return (<h3>{jwt}</h3>)
}