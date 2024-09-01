import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import './ManageBooks.css';

Modal.setAppElement('#root'); // Устанавливаем корневой элемент для модальных окон

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBook, setNewBook] = useState({
    isbn: '',
    bookName: '',
    genre: '',
    description: '',
    authorId: '',
  });
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Отсутствует токен авторизации.');
        setLoading(false);
        return;
      }

      // Запрос на получение книг
      const response = await axios.get('https://localhost:44350/api/Book/GetAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        const booksData = response.data.data;
        setBooks(booksData);

        // Получение авторов
        const authorsResponse = await axios.get('https://localhost:44350/api/Author/GetAll', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAuthors(authorsResponse.data.data || []);
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

  useEffect(() => {
    fetchBooks();
  }, []);

  const validateFields = () => {
    if (!newBook.isbn.trim()) return 'Поле "ISBN" не должно быть пустым.';
    if (!newBook.bookName.trim()) return 'Поле "Название книги" не должно быть пустым.';
    if (!newBook.genre.trim()) return 'Поле "Жанр" не должно быть пустым.';
    if (!newBook.description.trim()) return 'Поле "Описание" не должно быть пустым.';
    if (!newBook.authorId) return 'Пожалуйста, выберите автора из списка.';
    return '';
  };

  const handleAddBook = async () => {
    const validationError = validateFields();
    if (validationError) {
      setValidationError(validationError);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await axios.post('https://localhost:44350/api/Book', newBook, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewBook({
        isbn: '',
        bookName: '',
        genre: '',
        description: '',
        authorId: '',
      });
      setValidationError('');
      await fetchBooks(); // Обновляем список книг после успешного добавления
    } catch (error) {
      console.error('Ошибка при добавлении книги:', error);
      setError('Ошибка при добавлении книги. Проверьте консоль для подробностей.');
    }
  };

  const handleEdit = (bookId) => {
    navigate(`/editBook/${bookId}`);
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://localhost:44350/api/Book/${selectedBookId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBooks(books.filter(book => book.id !== selectedBookId));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Ошибка при удалении книги:', error);
      setError('Ошибка при удалении книги. Проверьте консоль для подробностей.');
    }
  };

  const openDeleteModal = (bookId) => {
    setSelectedBookId(bookId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="manage-books-container">
      <h1>Управление книгами</h1>

      <div className="add-book-form">
        <h2>Добавить книгу</h2>
        {validationError && <p className="validation-error">{validationError}</p>}
        <input
          type="text"
          name="isbn"
          placeholder="ISBN"
          value={newBook.isbn}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="bookName"
          placeholder="Название книги"
          value={newBook.bookName}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="genre"
          placeholder="Жанр"
          value={newBook.genre}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Описание"
          value={newBook.description}
          onChange={handleInputChange}
        />
        <select
          name="authorId"
          value={newBook.authorId}
          onChange={handleInputChange}
        >
          <option value="">Выберите автора</option>
          {authors.map(author => (
            <option key={author.id} value={author.id}>
              {author.name} {author.surname}
            </option>
          ))}
        </select>
        <button onClick={handleAddBook}>Добавить книгу</button>
      </div>

      <table className="books-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Автор</th>
            <th>Жанр</th>
            <th>Описание</th>
            <th>ISBN</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => {
            const author = authors.find(author => author.id === book.authorId);
            return (
              <tr key={book.id}>
                <td>{book.bookName}</td>
                <td>{author ? `${author.name} ${author.surname}` : 'Неизвестно'}</td>
                <td>{book.genre}</td>
                <td>{book.description}</td>
                <td>{book.isbn}</td>
                <td>
                  <button onClick={() => handleEdit(book.id)}>Редактировать</button>
                  <button onClick={() => openDeleteModal(book.id)}>Удалить</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Модальное окно для подтверждения удаления */}
      <Modal
        isOpen={showDeleteModal}
        onRequestClose={closeDeleteModal}
        contentLabel="Подтверждение удаления"
        className="delete-modal"
        overlayClassName="delete-modal-overlay"
      >
        <h2>Подтверждение удаления</h2>
        <p>Вы уверены, что хотите удалить эту книгу?</p>
        <button onClick={handleDelete}>Удалить</button>
        <button onClick={closeDeleteModal}>Отмена</button>
      </Modal>
    </div>
  );
}

export default ManageBooks;
