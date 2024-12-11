import logo from "/logo-name.svg"
import {useState} from "react"
import logoMisis from "./images/logo.jpg"

export default function Header(){
  
  const[now, setNow] = useState(new Date())

  setInterval(() => setNow(new Date()), 1000);
  return(
    <header>
      <h3>Завтра в МИСОС(</h3>
      <img src = {logoMisis} width = "40" height="40" alt = "" />
      <span>Текущее время:{now.toLocaleTimeString()}</span>
    </header>
    )
}