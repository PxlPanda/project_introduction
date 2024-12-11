export default async function sendSignInRequest(email, password, name, surname, patronymic) {
    const url = `http://localhost:8000/signin?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&name=${encodeURIComponent(name)}&surname=${encodeURIComponent(surname)}&patronymic=${encodeURIComponent(patronymic)}`

    const payload = {
        email: email,
        password: password,
        name : name,
        surname : surname,
        patronymic : patronymic
    };

    try {
        const response = await fetch(url, {
            method: 'POST', // Метод запроса
            headers: {
                'Content-Type': 'application/json' // Указываем, что передаем JSON
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`); // Если ответ не успешный, выбрасываем ошибку
        }

        const data = await response.json(); // Получаем данные из ответа
        return data; // Возвращаем полученные данные
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
        throw error; // Перебрасываем ошибку для дальнейшей обработки
    }
}
