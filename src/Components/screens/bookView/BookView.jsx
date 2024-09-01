import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ProfileMenu from '../../ProfileMenu/ProfileMenu';
import NotificationList from '../../NotificationList/NotificationLIst';
import './BookView.css';

function BookView() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [author, setAuthor] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [typeOfIcon, setTypeOfIcon] = useState(false);
    const [typeOfNotifications, setTypeOfNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Токен не найден.');
                    setLoading(false);
                    return;
                }

                const bookResponse = await axios.get(`https://localhost:44350/api/Book/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (bookResponse.data && bookResponse.data.data) {
                    setBook(bookResponse.data.data);
                    const authorResponse = await axios.get(
                        `https://localhost:44350/api/Author/${bookResponse.data.data.authorId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    setAuthor(authorResponse.data.data);
                } else {
                    setError('Ошибка получения данных о книге.');
                }
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
                setError('Ошибка при получении данных. Проверьте консоль для подробностей.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

    function handleProfileIcon() {
        setTypeOfIcon(!typeOfIcon);
    }

    function handleNotifications() {
        setTypeOfNotifications(!typeOfNotifications);
    }

    const handleGetBook = async () => {
        if (!book.isAvailable) {
            setError('Книга недоступна для получения.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId'); // Получите userId из localStorage

            if (!token || !userId) {
                setError('Пользователь не авторизован.');
                return;
            }

            const now = new Date();
            const dateTaken = now.toISOString(); // Текущая дата
            const dateReturn = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(); // Дата возврата через 14 дней

            const response = await axios.post(
                'https://localhost:44350/api/UserBook',
                {
                    userId,
                    bookId: book.id,
                    dateTaken,
                    dateReturn,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                navigate('/userProfile'); // Перенаправление на страницу профиля
            } else {
                setError('Ошибка при получении книги. Попробуйте снова.');
            }
        } catch (error) {
            console.error('Ошибка при получении книги:', error);
            setError('Ошибка при получении книги. Проверьте консоль для подробностей.');
        }
    };

    // Проверка значения book.isAvailible
    useEffect(() => {
        if (book) {
            console.log(`Книга доступна: ${book.isAvailable}`);
        }
    }, [book]);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p className="error-message">{error}</p>;

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
                            src="/images/notification.png"
                            className="notificationBell"
                            alt="Иконка уведомления"
                            onClick={handleNotifications}
                        />
                    </div>
                    <span className="notifNumber">{notificationCount}</span>
                    <span>
                        <img
                            src="/images/profileIcon.png"
                            alt="Иконка профиля"
                            className="profileIcon"
                            onClick={handleProfileIcon}
                        />
                    </span>
                </div>
            </header>
            <div className="book-view-container">
                <h1>Информация о книге</h1>
                {book && (
                    <div className="book-details">
                        <img
                            src={`https://localhost:44350/Photo/GetPhoto/${book.id}`}
                            alt={book.bookName}
                            className="book-photo"
                        />
                        <div className="book-info">
                            <h2>{book.bookName}</h2>
                            <p><strong>Автор:</strong> {author ? author.name : 'Неизвестно'}</p>
                            <p><strong>Жанр:</strong> {book.genre}</p>
                            <p><strong>Описание:</strong> {book.description}</p>
                            <p><strong>ISBN:</strong> {book.isbn}</p>
                            <p><strong>Наличие:</strong> {book.isAvailable ? 'Есть в наличии' : 'Нет в наличии'}</p>
                            <button
                                onClick={handleGetBook}
                                className="get-book-button"
                                disabled={!book.isAvailable} // Сделать кнопку недоступной, если книга не в наличии
                            >
                                Получить книгу
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default BookView;
