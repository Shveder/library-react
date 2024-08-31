import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import ProfileMenu from '../../ProfileMenu/ProfileMenu';
import NotificationList from '../../NotificationList/NotificationLIst';
import './AuthorView.css'; // Создайте и добавьте стили для AuthorView

function AuthorView() {
    const { id } = useParams();
    const [author, setAuthor] = useState(null);
    const [books, setBooks] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [typeOfIcon, setTypeOfIcon] = useState(false);
    const [typeOfNotifications, setTypeOfNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState("");

    useEffect(() => {
        const fetchAuthorDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Токен не найден.');
                    setLoading(false);
                    return;
                }

                // Fetch author details
                const authorResponse = await axios.get(`https://localhost:44350/api/Author/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (authorResponse.data && authorResponse.data.data) {
                    setAuthor(authorResponse.data.data);

                    // Fetch books of the author
                    const booksResponse = await axios.get(`https://localhost:44350/api/Book/GetByAuthor?{id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (booksResponse.data && booksResponse.data.data) {
                        setBooks(booksResponse.data.data);
                    } else {
                        setError('Ошибка получения данных о книгах автора.');
                    }
                } else {
                    setError('Ошибка получения данных об авторе.');
                }
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
                setError('Ошибка при получении данных. Проверьте консоль для подробностей.');
            } finally {
                setLoading(false);
            }
        };

        fetchAuthorDetails();
    }, [id]);

    function handleProfileIcon() {
        setTypeOfIcon(!typeOfIcon);
    }

    function handleNotifications() {
        setTypeOfNotifications(!typeOfNotifications);
    }

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
            <div className="author-view-container">
                <h1>Информация об авторе</h1>
                {author && (
                    <div className="author-details">
                        <h2>{author.name}</h2>
                        <p><strong>Дата рождения:</strong> {author.birthDate || 'Неизвестно'}</p>
                        <p><strong>Биография:</strong> {author.biography || 'Информация отсутствует'}</p>
                    </div>
                )}
                <h3>Книги автора</h3>
                <div className="books-list">
                    {books.length > 0 ? (
                        books.map((book) => (
                            <div key={book.id} className="book-item">
                                <Link to={`/bookView/${book.id}`}>
                                    <h4>{book.bookName}</h4>
                                </Link>
                                <p><strong>Жанр:</strong> {book.genre}</p>
                                <p><strong>ISBN:</strong> {book.isbn}</p>
                            </div>
                        ))
                    ) : (
                        <p>Книги отсутствуют.</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default AuthorView;
