import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyBooks.css';

const MyBooks = () => {
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserBooks = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!token || !userId) {
          setError('Пользователь не авторизован.');
          setLoading(false);
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
          setUserBooks(response.data);
        } else {
          setError('Ошибка получения данных о книгах.');
        }
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        setError(error.response?.data?.message || 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBooks();
  }, []);

  const returnBook = async (userBookId) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        setError('Пользователь не авторизован.');
        return;
      }

      // Запрос для возврата книги
      await axios.delete(
        `https://localhost:44350/api/UserBook/${userBookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Обновление списка книг после возврата
      setUserBooks((prevBooks) => prevBooks.filter((userBook) => userBook.id !== userBookId));
    } catch (error) {
      console.error('Ошибка при возврате книги:', error);
      setError(error.response?.data?.message || 'Неизвестная ошибка');
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <div className="mybooks-error-message">{error}</div>;

  return (
    <div className="mybooks-container">
      <h2 className="mybooks-heading">Мои книги</h2>
      <div className="mybooks-list">
        {userBooks.length > 0 ? (
          userBooks.map(({ book, dateTaken, dateReturn, id }) => (
            <div key={id} className="mybooks-item">
              <h4>{book.bookName}</h4>
              <p>
                <strong>Дата взятия:</strong> {new Date(dateTaken).toLocaleDateString()}
              </p>
              <p>
                <strong>Дата возврата:</strong> {new Date(dateReturn).toLocaleDateString()}
              </p>
              <button
                className="mybooks-return-button"
                onClick={() => returnBook(id)}
              >
                Вернуть книгу
              </button>
            </div>
          ))
        ) : (
          <p className="mybooks-no-books">У вас нет книг.</p>
        )}
      </div>
    </div>
  );
};

export default MyBooks;
