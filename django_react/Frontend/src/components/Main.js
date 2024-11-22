import React, { useState, useEffect } from "react";
import "./main.css"; // Стили

const App = () => {
  const [currentTimeSlot, setCurrentTimeSlot] = useState(0);
  const [timeSlots] = useState([
    "9:00-10:35",
    "10:50-12:25",
    "12:40-14:15",
    "14:30-16:05",
    "16:30-18:05",
    "18:20-20:00",
  ]);
  const [halls, setHalls] = useState([]); // Залы

  const fetchHalls = async () => {
    try {
      const response = await fetch("/api/halls/");
      const data = await response.json();
      // Проверяем, что data — это массив
      if (Array.isArray(data)) {
        setHalls(data);
      } else {
        console.error("Получены некорректные данные:", data);
        setHalls([]); // Устанавливаем пустой массив, если данные не массив
      }
    } catch (error) {
      console.error("Ошибка при получении данных:", error);
      setHalls([]); // Устанавливаем пустой массив в случае ошибки
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  const handleTimeChange = (direction) => {
    if (direction === "prev" && currentTimeSlot > 0) {
      setCurrentTimeSlot(currentTimeSlot - 1);
    } else if (direction === "next" && currentTimeSlot < timeSlots.length - 1) {
      setCurrentTimeSlot(currentTimeSlot + 1);
    }
  };

  // Функция для обработки записи на зал
  const handleBooking = (hallId) => {
    console.log(`Записан на зал с ID: ${hallId}`);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Спорт МИСИС</h1>
        <div className="buttons">
          <button>Горный</button>
          <button>Беляево</button>
        </div>
      </header>

      <main className="main">
        <div className="time-navigation">
          <button
            onClick={() => handleTimeChange("prev")}
            disabled={currentTimeSlot === 0}
          >
            ←
          </button>
          <span>{timeSlots[currentTimeSlot]}</span>
          <button
            onClick={() => handleTimeChange("next")}
            disabled={currentTimeSlot === timeSlots.length - 1}
          >
            →
          </button>
        </div>

        <div className="halls-container">
          {Array.isArray(halls) && halls.length > 0 ? (
            halls.map((hall, index) => (
              <div className="hall" key={index}>
                <img src={hall.image} alt={hall.name} />
                <h3>{hall.name}</h3>
                <span className={`capacity ${getCapacityColor(hall.capacity)}`}>
                  {hall.capacity}/30
                </span>
                <button
                  className={hall.isBooked ? "booked" : ""}
                  onClick={() => handleBooking(hall.id)}
                >
                  {hall.isBooked ? "Записан" : "Записаться"}
                </button>
              </div>
            ))
          ) : (
            <p>Нет доступных залов.</p>
          )}
        </div>
      </main>

      <aside className="profile">
        <h2>Данные</h2>
        <p>ФИО: Маркин Максим Игоревич</p>
        <p>Группа: БПМ-24-3</p>
        <p>Номер: 2409441</p>
        <button>Перейти в профиль →</button>
      </aside>
    </div>
  );
};

// Получение цвета для заполненности
const getCapacityColor = (capacity) => {
  if (capacity <= 20) return "green";
  if (capacity < 30) return "yellow";
  return "red";
};

export default App;
