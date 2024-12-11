import Button from "./Button/Button"
export default function TabsSection({active, onChange}){
    return (
        <section>
            <h3><span>Основные функции</span></h3>
            <Button isActive = {active == "main"} onClick={() => onChange("main")}>Главная</Button>
            <Button isActive = {active == "feedback"} onClick={() => onChange("feedback")}>Обратная связь</Button>
            <Button isActive = {active == "signup"} onClick={() => onChange("signup")}>Регистрация</Button>
            <Button isActive = {active == "login"} onClick={() => onChange("login")}>Аутентификация</Button>
        </section>
    )
}