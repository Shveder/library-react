import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../../providers/AuthProvider";
import { Link } from "react-router-dom";
import './UserMain.css';
import ProfileMenu from "../../ProfileMenu/ProfileMenu.jsx";
import NotificationList from "../../NotificationList/NotificationLIst.jsx";
import BookTable from "./BookTable.jsx";

function UserMain() {
    const { user, setUser } = useContext(AuthContext);
    const [books] = useState([]);
    const [typeOfIcon, setTypeOfIcon] = useState(false);
    const [typeOfNotifications, setTypeOfNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState("");
    const [loading, setLoading] = useState(true); // состояние для отслеживания загрузки
    const [error, setError] = useState(''); // состояние для ошибок

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const token = localStorage.getItem('token');

                if (!userId || !token) {
                    setError('Нет данных для получения пользователя. Авторизуйтесь снова.');
                    setLoading(false);
                    return;
                }

                // Запрос на получение данных пользователя по сохранённому userId
                const response = await axios.get(`https://localhost:44350/api/User/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.data) {
                    setUser(response.data.data); // Устанавливаем данные пользователя в контекст
                } else {
                    setError('Не удалось получить данные пользователя.');
                }
            } catch (error) {
                console.error('Ошибка при получении данных пользователя:', error);
                setError('Ошибка при получении данных пользователя. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        if (!user) {
            fetchUserData(); // вызываем функцию загрузки данных, если user == null
        } else {
            setLoading(false); // останавливаем загрузку, если пользователь уже есть
        }
    }, [user, setUser]);

    if (loading) return <p>Загрузка данных пользователя...</p>;
    if (error) return <p className="error-message">{error}</p>;

    function handleProfileIcon() {
        setTypeOfIcon(!typeOfIcon);
    }

    function handleNotifications() {
        setTypeOfNotifications(!typeOfNotifications);
    }

    return (
        <>
            {typeOfIcon && <ProfileMenu />}
            {typeOfNotifications && <NotificationList updateNotificationCount={setNotificationCount} />}
            <header>
                <div className="logo">
                    <Link to="/userMain"><p>Library</p></Link>
                </div>
                <div className="rightBlock">
                    <div className="bellBlock">
                        <img
                            src="images/notification.png"
                            className="notificationBell"
                            alt="Иконка уведомления"
                            onClick={handleNotifications}
                        />
                    </div>
                    <span className="notifNumber">{notificationCount}</span>
                    <span>
                        <img
                            src="images/profileIcon.png"
                            alt="Иконка профиля"
                            className="profileIcon"
                            onClick={handleProfileIcon}
                        />
                    </span>
                </div>
            </header>
            <BookTable books={books} />
        </>
    );
}

export default UserMain;
