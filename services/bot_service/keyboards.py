from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton

keyboard = ReplyKeyboardMarkup(keyboard = [
    [KeyboardButton(text = "Регистрация"), KeyboardButton(text = "Вход")],
    [KeyboardButton(text = "Записаться на свободное время")],
    ], resize_keyboard= True, input_field_placeholder="Выбери чонить по-братски")
inline_keyboard = InlineKeyboardMarkup(inline_keyboard = [
    [InlineKeyboardButton(text = "Студент", callback_data="student")],
    [InlineKeyboardButton(text = "Преподаватель", callback_data="teacher")],
    [InlineKeyboardButton(text = "Да я так, по приколу, салам кстати", callback_data="conch"),]
    ])