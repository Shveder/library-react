import React, { useState } from "react";
import "./NotificationList.css";

function NotificationList({ updateNotificationCount }) {
    const [notificationList, setNotificationList] = useState([]);

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
        <>
            <div className="notificationBlock">
                {notificationList.length === 0 ? (
                    <p>У вас нет уведомлений</p>
                ) : (
                    <>
                        {notificationList.map((notification) => (
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
                        ))}
                    </>
                )}
            </div>
        </>
    );
}

export default NotificationList;