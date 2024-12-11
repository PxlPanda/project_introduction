import Button from "./Button/Button"
import { useState } from "react"

export default function FeedbackSection(){
    const [name, setName] = useState("")
    const [reason, setReason] = useState("SVO")
    const [hasError, setHasError] = useState(false)

    
    function handleNameChange(event){
        setName(event.target.value)
        setHasError(event.target.value.trim().length == 0)
    }
    

    return(
        <section>
            <h3>Обратная связь</h3>
            <form>
                <label htmlFor="name">Имя</label>
                <input 
                className = "control" 
                id = "name" 
                type = "text" 
                value = {name} 
                style={{
                    border : hasError == false ? null : "1px solid red"
                }} 
                onChange={handleNameChange}/>
                
                
                <label htmlFor="reason">Причина обращения</label>
                <select id = "reason" className="control" value = {reason} onChange = {event => setReason(event.target.value)}>
                    <option value = "volonter">Записаться на СВО</option>
                    <option value = "needhelp">Обратиться за помощью</option>
                </select>

                <Button disabled = {hasError}>Отправить</Button>

            </form>
        </section>
    )

}