import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BookTable.css';

const PAGE_SIZE = 10; // Количество книг на одной странице

function BookTable() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Токен не найден.');
        setLoading(false);
        return;
      }

      // Формирование параметров запроса
      const params = {
        pageNumber: currentPage,
        pageSize: PAGE_SIZE,
        authorId: selectedAuthor || undefined,
        genre: selectedGenre || undefined,
        search: searchQuery || undefined,
      };

      // Запрос на получение книг с фильтрацией, сортировкой и пагинацией
      const response = await axios.get('https://localhost:44350/api/Book/GetAllFiltered', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      if (response.data && response.data.data) {
        const booksData = response.data.data.books;
        setBooks(booksData);

        // Получение уникальных ID авторов из книг
        const authorIds = [...new Set(booksData.map(book => book.authorId))];

        // Запросы на получение авторов по их ID
        const authorPromises = authorIds.map(id =>
          axios.get(`https://localhost:44350/api/Author/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        );

        // Ожидание завершения всех запросов к авторам
        const authorResponses = await Promise.all(authorPromises);

        // Извлечение данных авторов из ResponseDto
        const authorsData = authorResponses.map(res => res.data?.data).filter(author => author);

        // Обновление состояния авторов и жанров
        setAuthors(authorsData);
        setGenres([...new Set(booksData.map(book => book.genre))]);
      } else {
        setError('Ошибка получения данных о книгах.');
      }
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      setError('Ошибка при получении данных. Проверьте консоль для подробностей.');
    } finally {
      setLoading(false);
    }
  };

  // Запуск запроса при изменении фильтров, поиска, сортировки или номера страницы
  useEffect(() => {
    fetchBooks();
  }, [currentPage, selectedAuthor, selectedGenre, searchQuery]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
    setCurrentPage(1); // Сбросить на первую страницу при поиске
  };

   const handlePageChange = (newPage) => {
    if (newPage >= 1) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="book-table-container">
      <h1>Просмотр книг</h1>
      {loading && <p>Загрузка...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        <>
          <input
            type="text"
            placeholder="Поиск по названию, описанию..."
            value={searchQuery}
            onChange={handleSearch}
            maxLength={30}
            className="search-input"
          />
          <div className="filters">
            <select onChange={(e) => setSelectedAuthor(e.target.value)} value={selectedAuthor}>
              <option value="">Все авторы</option>
              {authors.map(author => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
            <select onChange={(e) => setSelectedGenre(e.target.value)} value={selectedGenre}>
              <option value="">Все жанры</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
          <table className="book-table">
            <thead>
              <tr>
                <th >
                  Название 
                </th>
                <th>Автор</th>
                <th>
                  Жанр
                </th>
                <th>Описание</th>
                <th>ISBN</th>
                <th>Наличие</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const author = authors.find(author => author.id === book.authorId);
                return (
                  <tr key={book.id}>
                    <td>
                      <a href={`/bookView/${book.id}`} rel="noopener noreferrer">
                        {book.bookName}
                      </a>
                    </td>
                    <td>
                      {author ? (
                        <a href={`/author/${author.id}`} rel="noopener noreferrer">
                          {author.name}
                        </a>
                      ) : 'Неизвестно'}
                    </td>
                    <td>{book.genre}</td>
                    <td>{book.description}</td>
                    <td>{book.isbn}</td>
                    <td>{book.isAvailable ? 'Есть в наличии' : 'Нет в наличии'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo; Назад
            </button>
            <span>Страница {currentPage}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={books.length < PAGE_SIZE}
            >
              Вперёд &raquo;
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default BookTable;
