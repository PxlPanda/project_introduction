import asyncio
from aiogram import F, Router
from aiogram.types import Message, CallbackQuery
from aiogram.filters import CommandStart, Command
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.context import FSMContext
import keyboards as kb
from services.registration_service import UserService


class Register(StatesGroup):
    name = State()
    patronymic = State()
    surname = State()
    email = State()
    password = State()
    password_rep = State()
    

router = Router()


@router.message(CommandStart())
async def cmd_start(message: Message):
    await message.answer("Бу! Испугался? Не бойся. Я МИСИСовский бот. Не бойся меня. Используй меня. Запишись на физру. У тебя будет все: деньги, телки, тачки, админки (ну и далее по списку)", reply_markup = kb.keyboard)
    await message.reply("Накачаться хочешь?")


@router.message(Command('help'))
async def cmd_help(message: Message):
    await message.answer("Браток(или братиха, мы тут прогрессивные), сейчас все разрулим, не кипишуй")


#@router.message(F.text.upper() in ["ГОЙДА", "Z", "V", "PUTIN", "РОССИЯ", "ОРЕШНИК"])
@router.message(F.text.upper() == "ГОЙДА")
async def response_to_goida(message: Message):
    await message.answer("АНГЕЛА ХРАНИТЕЛЯ Z КАVДОМУ ИZ ВАZ🙏❤БОVЕ ХРАНИ Z🙏❤ZПАСИБО VАМ НАШИ СВО🙏🏼❤🇷🇺 ХРАНИ ZOV✊🇷🇺💯ZПАСИБО НАШИМ БОЙЦАМ СлаVа Боzу Z🙏❤СЛАVА Z🙏❤АНГЕЛА ХРАНИТЕНАШ Слава Богу 🙏❤СЛАВА РОССИИ 🙏❤АНГЕЛА ХРАНИТЕЛЯ КАЖДОМУ ИЗ ВАС 🙏❤БОЖЕ ХРАНИ РОССИЮ 🙏❤СПАСИБО ВАМ НАШИ МАЛЬЧИКИ 🙏❤🇷🇺 ЧТО ПОДДЕРЖИВАЕТЕ НАШИХ МАЛЬЧИКОВ НА СВО🙏❤🇷🇺 ХРАНИ ВАС ГОСПОДЬ🙏❤🇷🇺СЛАВА СВО🇷🇺❤ ❤🇷🇺БОЖЕ ХРАНИ НАШИХ МАЛЬЧИШЕК🇷🇺❤ СЛАВА РОССИИ❤🇷🇺 ❤🇷🇺ГОЙДА🇷🇺❤ ❤🇷🇺НАШИ СЛОНЫ🇷🇺❤РАБОТАЙТЕ БРАТЬЯ❤🇷🇺🇷🇺❤ZOV❤🇷🇺❤🇷🇺Z❤🇷🇺🇷🇺❤V🇷🇺❤🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺 За РОССИЮ❤🇷🇺 ❤🇷🇺СЛАВА СВО🇷🇺❤ ❤🇷🇺БОЖЕ ХРАНИ НАШИХ МАЛЬЧИШЕК🇷🇺❤ СЛАВА РОССИИ❤🇷🇺 ❤🇷🇺ГОЙДА🇷🇺❤ ❤🇷🇺НАШИ СЛОНЫ🇷🇺❤РАБОТАЙТЕ БРАТЬЯ❤🇷🇺🇷🇺❤ZOV❤🇷🇺❤🇷🇺Z❤🇷🇺🇷🇺❤V🇷🇺❤🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺 За РОССИЮ❤🇷🇺 ❤🇷🇺СЛАВА СВО🇷🇺❤ ❤🇷🇺БОЖЕ ХРАНИ НАШИХ МАЛЬЧИШЕК🇷🇺❤ СЛАВА РОССИИ❤🇷🇺 ❤🇷🇺ГОЙДА🇷🇺❤ ❤🇷🇺НАШИ СЛОНЫ🇷🇺❤РАБОТАЙТЕ БРАТЬЯ❤🇷🇺🇷🇺❤ZOV❤🇷🇺❤🇷🇺Z❤🇷🇺🇷🇺❤V🇷🇺❤🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺 За РОССИЮ❤🇷🇺 ❤🇷🇺СЛАВА СВО🇷🇺❤ ❤🇷🇺БОЖЕ ХРАНИ НАШИХ МАЛЬЧИШЕК🇷🇺❤ СЛАВА РОССИИ❤🇷🇺 ❤🇷🇺ГОЙДА🇷🇺❤ ❤🇷🇺НАШИ СЛОНЫ🇷🇺❤РАБОТАЙТЕ БРАТЬЯ❤🇷🇺🇷🇺❤ZOV❤🇷🇺❤🇷🇺Z❤🇷🇺🇷🇺❤V🇷🇺❤🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺 За РОССИЮ❤🇷🇺 ❤🇷🇺СЛАВА СВО🇷🇺❤ ❤🇷🇺БОЖЕ ХРАНИ НАШИХ МАЛЬЧИШЕК🇷🇺❤ СЛАВА РОССИИ❤🇷🇺 ❤🇷🇺ГОЙДА🇷🇺❤ ❤🇷🇺НАШИ СЛОНЫ🇷🇺❤РАБОТАЙТЕ БРАТЬЯ❤🇷🇺🇷🇺❤ZOV❤🇷🇺❤🇷🇺Z❤🇷🇺🇷🇺❤V🇷🇺❤🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺 За РОССИЮ❤")

@router.message(F.text == "Регистрация")
async def registration(message: Message):
    await message.answer("Погнали!", reply_markup = kb.inline_keyboard)
    

# @router.callback_query(F.data == "student")
# async def stud_reg(callback: CallbackQuery):
#     await callback.answer(text = "Yeah")
#     ...
    
    
@router.callback_query(F.data == "teacher")
async def teach_reg(callback: CallbackQuery):
    ...
    

@router.callback_query(F.data == "student")
async def stud_reg(message:Message, state: FSMContext):
    await message.answer("/register")
    
     
@router.message(Command("register"))
async def register(message:Message, state: FSMContext):
    await state.set_state(Register.name)
    await message.answer("Ваше имя")
    
    
@router.message(Register.name)
async def reg_name(message: Message, state: FSMContext):
    await state.update_data(name = message.text)
    await state.set_state(Register.patronymic)
    await message.answer("Ваше отчество (- в случае отсутствия)")
    

@router.message(Register.patronymic)
async def reg_patronymic(message: Message, state: FSMContext):
    await state.update_data(patronymic = message.text)
    await state.set_state(Register.surname)
    await message.answer("Ваша фамилия")


@router.message(Register.email)
async def reg_patronymic(message: Message, state: FSMContext):
    await state.update_data(surname = message.text)
    await state.set_state(Register.email)
    await message.answer("Ваша почта")
    

@router.message(Register.password)
async def reg_patronymic(message: Message, state: FSMContext):
    await state.update_data(email = message.text)
    await state.set_state(Register.password)
    await message.answer("Придумайте пароль")
    

@router.message(Register.password_rep)
async def reg_patronymic(message: Message, state: FSMContext):
    await state.update_data(password = message.text)
    await state.set_state(Register.password_rep)
    await message.answer("Введите пароль снова")
    
        
@router.message(Register.surname)
async def reg_surname(message: Message, state: FSMContext):
    await state.update_data(password_rep = message.text) 
    data = await state.get_data()
    if data["password_rep"] == data["password"]:
        if UserService.get_user(email= data["email"], password = data["password"]) == None:
            UserService.put_user(email= data["email"], password = data["password"], name = data["name"], surname = data["surname"], patronymic= data["patronymic"])
            await message.answer(f"Регистрация прошла успешно, имя = {data["name"]}, отчество = {data["patronymic"]}, фамилия = {data["surname"]}")
        else:
            await message.answer(f"Такой пользователь уже есть(")
    else:
        await message.answer(f"Пароли не совпадают")
    await state.clear()