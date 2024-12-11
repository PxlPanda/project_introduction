import {differences} from "../data"
import Button from "./Button/Button"
import {useState} from "react"



export default function ButtonsSection(){
    const [contentType, setContentType] = useState(null)

    // let content = "Нажми на кнопочку"
    function handleClick(type){
     // console.log("Kuku mudila", type)
     setContentType(type)
     // content = type;
    }
    return(
        <section>
        <h3>Очень важные кнопочки</h3>
        <Button isActive = {contentType == "way"} onClick = {() => handleClick("way")}>записаться на занятие</Button>
        <Button isActive = {contentType == "easy"} onClick={() => handleClick("easy")}>Записаться на занятие!</Button>
        <Button isActive = {contentType == "program"} onClick={() => handleClick("program")}>ЗАПИСАТЬСЯ НА ЗАНЯТИЕ!!!</Button>
        
        {contentType ? (<p>{differences[contentType]}</p>) : (<p>Привет, это Пригожин Женя</p>)}
        </section>
    )
}