import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NotificationList.css";

function NotificationList({ updateNotificationCount }) {
    const [notificationList, setNotificationList] = useState([]);

    useEffect(() => {
        const fetchBooksAndNotify = async () => {
            try {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");

                if (!token || !userId) {
                    console.error("Пользователь не авторизован.");
                    return;
                }

                const response = await axios.get(
                    `https://localhost:44350/api/UserBook/GetBooksByUserId?userId=${userId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data && Array.isArray(response.data)) {
                    const overdueNotifications = response.data
                        .filter((userBook) => new Date(userBook.dateReturn) < new Date())
                        .map((userBook) => ({
                            id: userBook.id,
                            notificationBody: `Книга "${userBook.book.bookName}" просрочена!`,
                            dateTime: new Date().toISOString(), // Текущая дата для отображения
                        }));

                    setNotificationList(overdueNotifications);
                    updateNotificationCount(overdueNotifications.length);
                }
            } catch (error) {
                console.error("Ошибка при получении уведомлений:", error);
            }
        };

        fetchBooksAndNotify();
    }, [updateNotificationCount]);

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        return date.toLocaleDateString("ru-RU", options);
    }

    const handleDeleteNotification = (id) => {
        // Обновление списка уведомлений после успешного удаления
        const updatedNotificationList = notificationList.filter(
            (notification) => notification.id !== id
        );
        setNotificationList(updatedNotificationList);
        // Обновление числа уведомлений в компоненте UserMain
        updateNotificationCount(updatedNotificationList.length);
    };

    return (
        <div className="notificationBlock">
            {notificationList.length === 0 ? (
                <p>У вас нет уведомлений</p>
            ) : (
                notificationList.map((notification) => (
                    <div key={notification.id} className="notification">
                        <span className="notBody">
                            <div className="notText">{notification.notificationBody}</div>
                            <img
                                src="/images/close.png"
                                className="closeButt"
                                alt="Кнопка удаления"
                                onClick={() => handleDeleteNotification(notification.id)}
                            />
                        </span>
                        <div className="date">{formatDate(notification.dateTime)}</div>
                    </div>
                ))
            )}
        </div>
    );
}

export default NotificationList;
