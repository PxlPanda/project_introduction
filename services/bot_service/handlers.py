import asyncio
from aiogram import F, Router
from aiogram.types import Message, CallbackQuery
from aiogram.filters import CommandStart, Command
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.context import FSMContext
from .keyboards import inline_keyboard_auth, inline_keyboard_log_in_users, start_reply_keyboard, inline_keyboard_sign_in_users, register_button
from ..registration_service import UserService
from User_aut.mail_validation import send_email

class Register(StatesGroup):
    name = State()
    patronymic = State()
    surname = State()
    email_reg = State()
    email_log_in = State()
    password_reg = State()
    password_log_in = State()
    password_rep = State()
    finish_reg = State()
    waiting = State()
    confirmed = State()
    reg_started = State()
    

router = Router()
bot_user_service = UserService()
number_for_confirming = ""

@router.message(F.text.upper().in_({"ГЛАВНАЯ", "MAIN", "/START"}))
async def cmd_start(message: Message):
    await message.answer("Бу! Испугался? Не бойся. Я МИСИСовский бот. Не бойся меня. Используй меня. Запишись на физру. У тебя будет все: деньги, телки, тачки, админки (ну и далее по списку)", reply_markup = start_reply_keyboard)
    await message.reply("Накачаться хочешь?")


@router.message(F.text.upper() == "ВХОД")
async def enter(message: Message):
    await message.answer("Выберите нужную опцию", reply_markup = inline_keyboard_auth)
    
    
@router.message(Command('help'))
async def cmd_help(message: Message):
    await message.answer("Браток(или братиха, мы тут прогрессивные), сейчас все разрулим, не кипишуй")


#@router.message(F.text.upper() in ["ГОЙДА", "Z", "V", "PUTIN", "РОССИЯ", "ОРЕШНИК"])
@router.message(F.text.upper().in_({"ГОЙДА", "Z", "V", "PUTIN", "RUSSIA", "ПУТИН", "РОССИЯ"}))
async def response_to_goida(message: Message):
    await message.answer("АНГЕЛА ХРАНИТЕЛЯ Z КАVДОМУ ИZ ВАZ🙏❤БОVЕ ХРАНИ Z🙏❤ZПАСИБО VАМ НАШИ СВО🙏🏼❤🇷🇺 ХРАНИ ZOV✊🇷🇺💯ZПАСИБО НАШИМ БОЙЦАМ СлаVа Боzу Z🙏❤СЛАVА Z🙏❤АНГЕЛА ХРАНИТЕНАШ Слава Богу 🙏❤СЛАВА РОССИИ 🙏❤АНГЕЛА ХРАНИТЕЛЯ КАЖДОМУ ИЗ ВАС 🙏❤БОЖЕ ХРАНИ РОССИЮ 🙏❤СПАСИБО ВАМ НАШИ МАЛЬЧИКИ 🙏❤🇷🇺 ЧТО ПОДДЕРЖИВАЕТЕ НАШИХ МАЛЬЧИКОВ НА СВО🙏❤🇷🇺 ХРАНИ ВАС ГОСПОДЬ🙏❤🇷🇺СЛАВА СВО🇷🇺❤ ❤🇷🇺БОЖЕ ХРАНИ НАШИХ МАЛЬЧИШЕК🇷🇺❤ СЛАВА РОССИИ❤🇷🇺 ❤🇷🇺ГОЙДА🇷🇺❤ ❤🇷🇺НАШИ СЛОНЫ🇷🇺❤РАБОТАЙТЕ БРАТЬЯ❤🇷🇺🇷🇺❤ZOV❤🇷🇺❤🇷🇺Z❤🇷🇺🇷🇺❤V🇷🇺❤🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺 За РОССИЮ❤🇷🇺 ❤🇷🇺СЛАВА СВО🇷🇺❤ ❤🇷🇺БОЖЕ ХРАНИ НАШИХ МАЛЬЧИШЕК🇷🇺❤ СЛАВА РОССИИ❤🇷🇺 ❤🇷🇺ГОЙДА🇷🇺❤ ❤🇷🇺НАШИ СЛОНЫ🇷🇺❤РАБОТАЙТЕ БРАТЬЯ❤🇷🇺🇷🇺❤ZOV❤🇷🇺❤🇷🇺Z❤🇷🇺🇷🇺❤V🇷🇺❤🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺 За РОССИЮ❤🇷🇺 ❤🇷🇺СЛАВА СВО🇷🇺❤ ❤🇷🇺БОЖЕ ХРАНИ НАШИХ МАЛЬЧИШЕК🇷🇺❤ СЛАВА РОССИИ❤🇷🇺 ❤🇷🇺ГОЙДА🇷🇺❤ ❤🇷🇺НАШИ СЛОНЫ🇷🇺❤РАБОТАЙТЕ БРАТЬЯ❤🇷🇺🇷🇺❤ZOV❤🇷🇺❤🇷🇺Z❤🇷🇺🇷🇺❤V🇷🇺❤🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺 За РОССИЮ❤🇷🇺 ❤🇷🇺СЛАВА СВО🇷🇺❤ ❤🇷🇺БОЖЕ ХРАНИ НАШИХ МАЛЬЧИШЕК🇷🇺❤ СЛАВА РОССИИ❤🇷🇺 ❤🇷🇺ГОЙДА🇷🇺❤ ❤🇷🇺НАШИ СЛОНЫ🇷🇺❤РАБОТАЙТЕ БРАТЬЯ❤🇷🇺🇷🇺❤ZOV❤🇷🇺❤🇷🇺Z❤🇷🇺🇷🇺❤V🇷🇺❤🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺 За РОССИЮ❤🇷🇺 ❤🇷🇺СЛАВА СВО🇷🇺❤ ❤🇷🇺БОЖЕ ХРАНИ НАШИХ МАЛЬЧИШЕК🇷🇺❤ СЛАВА РОССИИ❤🇷🇺 ❤🇷🇺ГОЙДА🇷🇺❤ ❤🇷🇺НАШИ СЛОНЫ🇷🇺❤РАБОТАЙТЕ БРАТЬЯ❤🇷🇺🇷🇺❤ZOV❤🇷🇺❤🇷🇺Z❤🇷🇺🇷🇺❤V🇷🇺❤🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺🇷🇺 За РОССИЮ❤")

    
@router.callback_query(F.data == "sign_in_tg")
async def sign_in_tg(callback : CallbackQuery):
    ...
    
@router.callback_query(F.data == "sign_in_stand")
async def sign_in_stand(callback : CallbackQuery):
    ...

@router.callback_query(F.data == "sign_in_API")
async def sign_in_API(callback : CallbackQuery):
    ...
    
@router.message(F.text.upper().in_({"ПАВЕЛ ДМИТРИЕВИЧ ХОНЕР", "ДАНЯ"}))
async def easy_100_points(message: Message):
    await message.answer("https://www.youtube.com/watch?v=Z54FdjHqPgM")
# @router.callback_query(F.data == "student")
# async def stud_reg(callback: CallbackQuery):
#     await callback.answer(text = "Yeah")
#     ...
    
@router.callback_query(F.data == "log_in")
async def log_in_func(callback: CallbackQuery):
    await callback.answer()
    await callback.message.edit_text("Выберите опцию для входа", reply_markup = inline_keyboard_log_in_users)
    

@router.callback_query(F.data == "sign_in")
async def sign_up_func(callback: CallbackQuery):
    await callback.answer()
    await callback.message.edit_text("Выберите опцию для регистрации", reply_markup = inline_keyboard_sign_in_users)

    
@router.callback_query(F.data == "teacher")
async def teach_reg(callback: CallbackQuery):
    await callback.answer()
    await callback.message.answer("/register_teacher")
    

@router.callback_query(F.data == "student")
async def stud_reg(callback: CallbackQuery, state: FSMContext):
    await callback.answer()
    await callback.message.answer("А вот и нужная команда подъехала, просто нажми на кнопочку", reply_markup = register_button)
    
     
@router.message(F.text.upper() == "РЕГИСТРАЦИЯ")
async def register(message:Message, state: FSMContext):
    print(await state.get_state())
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


@router.message(Register.surname)
async def reg_email(message: Message, state: FSMContext):
    await state.update_data(surname = message.text)
    await state.set_state(Register.email_reg)
    await message.answer("Ваша почта")
    
    
@router.message(Register.email_reg)
async def reg_email(message: Message, state: FSMContext):
    if message.text.count("@") < 1:
        await message.answer("Какая-то странная почта...")
        await state.clear()
    else:
        await state.update_data(email_reg = message.text)
        await state.set_state(Register.password_reg)
        await message.answer("Придумайте пароль")
    

@router.message(Register.password_reg)
async def reg_password(message: Message, state: FSMContext):
    await state.update_data(password_reg = message.text)
    await state.set_state(Register.password_rep)
    await message.answer("Введите пароль снова")
    

@router.message(Register.password_rep)
async def reg_password_rep(message: Message, state: FSMContext):
    await state.update_data(password_rep = message.text)
    data = await state.get_data()
    print(data)
    if data["password_rep"] == data["password_reg"]:
        if await bot_user_service.check_user(email = data["email_reg"]) == None:
            global number_for_confirming
            number_for_confirming = str(await send_email(getter = data["email_reg"]))
            await state.set_state(Register.waiting)
            await message.answer("Введите число, отправленное вам на почту")
        else:
            await message.answer(f"Такой пользователь уже есть(")
            await state.clear()
    else:
        await message.answer(f"Пароли не совпадают")
        await state.clear()

@router.message(Register.waiting)
async def confirming_email(message:Message, state: FSMContext):
    global number_for_confirming
    if message.text ==  number_for_confirming:
        data = await state.get_data()
        await bot_user_service.put_user(email = data["email_reg"], password = data["password_reg"], name = data["name"], surname = data["surname"], patronymic= data["patronymic"])
        await message.answer(f"Регистрация прошла успешно, имя = {data["name"]}, отчество = {data["patronymic"]}, фамилия = {data["surname"]}")
    else:
        await message.answer("Введенное число не совпало с отправленным(")
    await state.clear()
    
@router.message(Command("log_in"))
async def log_in_start(message:Message, state: FSMContext):
    await state.set_state(Register.email_log_in)
    await message.answer("Ваша почта")
    
    
@router.message(Register.email_log_in)
async def log_in_email(message: Message, state: FSMContext):
    if message.text.count("@") < 1:
        await message.answer("Какая-то странная почта...")
        await state.clear()
    else:
        await state.update_data(email_log_in = message.text)
        await state.set_state(Register.password_log_in)
        await message.answer("Ваш пароль")
    

@router.message(Register.password_log_in)
async def log_in_password(message: Message, state: FSMContext):
    await state.update_data(password_log_in = message.text)
    data = await state.get_data()
    if await bot_user_service.get_user(email = data["email_log_in"], password = data["password_log_in"]) != None:
        await message.answer("Вы аутентифицированы")
    else:
        await message.answer("Аутентификация провалилась")
    await state.clear()
