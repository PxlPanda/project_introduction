import Button from "./Button/Button"
import { useState } from "react"
import {sendRequest} from "../functions_back"
import sendSignInRequest from "../funcSignIn"

export default function RegisterSection(){


    const [name, setName] = useState("")
    const [surname, setSurname] = useState("")
    const [patronymic, setPatronymic] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    
    const [hasErrorName, setHasErrorName] = useState(false)
    const [hasErrorSurname, setHasErrorSurname] = useState(false)
    const [hasErrorPatronymic, setHasErrorPatronymic] = useState(false)
    const [hasErrorEmail, setHasErrorEmail] = useState(false)
    const [hasErrorPassword, setHasErrorPassword] = useState(false)


    function handleNameChange(event){
        setName(event.target.value)
        setHasErrorName(event.target.value.trim().length == 0)
    }

    function handleSurameChange(event){
        setSurname(event.target.value)
        setHasErrorSurname(event.target.value.trim().length == 0)
    }

    function handlePatronymicChange(event){
        setPatronymic(event.target.value)
        setHasErrorPatronymic(event.target.value.trim().length == 0)
    }

    function handleEmailChange(event){
        setEmail(event.target.value)
        setHasErrorEmail(event.target.value.trim().length == 0)
    }

    function handlePasswordChange(event){
        setPassword(event.target.value)
        setHasErrorPassword(event.target.value.trim().length == 0)
    }

    return(
    <section>
        <h3>Регистрация</h3>
        <form>
            <label htmlFor="name">Имя</label>
            <input 
            className = "control" 
            id = "name" 
            type = "text" 
            value = {name} 
            style={{
                border : hasErrorName == false ? null : "1px solid red"
            }} 
            onChange={handleNameChange}/>


            <label htmlFor="name">Фамилия</label>
            <input 
            className = "control" 
            id = "surname" 
            type = "text" 
            value = {surname} 
            style={{
                border : hasErrorSurname == false ? null : "1px solid red"
            }} 
            onChange={handleSurameChange}/>
            
            
            <label htmlFor="patronymic">Отчество</label>
            <input 
            className = "control" 
            id = "patronymic" 
            type = "text" 
            value = {patronymic} 
            style={{
                border : hasErrorPatronymic == false ? null : "1px solid red"
            }} 
            onChange={handlePatronymicChange}/>
            
            <label htmlFor="email">Электронная почта</label>
            <input 
            className = "control" 
            id = "email" 
            type = "text" 
            value = {email} 
            style={{
                border : hasErrorEmail == false ? null : "1px solid red"
            }} 
            onChange={handleEmailChange}/>


            <label htmlFor="password">Пароль</label>
            <input 
            className = "control" 
            id = "password" 
            type = "text" 
            value = {password} 
            style={{
                border : hasErrorPassword == false ? null : "1px solid red"
            }} 
            onChange={handlePasswordChange}/>

            {console.log(typeof(email))}
            <Button disabled = {hasErrorName || hasErrorSurname || hasErrorPatronymic || hasErrorEmail || hasErrorPassword} onClick = {sendSignInRequest(email, password, name, surname, patronymic)}>Отправить</Button>

        </form>
    </section>
)}
