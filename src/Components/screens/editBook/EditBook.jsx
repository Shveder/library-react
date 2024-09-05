import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditBook.css';

function EditBook() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState({
    id: '',
    isbn: '',
    bookName: '',
    genre: '',
    description: '',
    isAvailable: true,
    authorId: '',
  });
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (bookId) {
      fetchBook();
      fetchAuthors();
    } else {
      setError('Неверный идентификатор книги.');
      setLoading(false);
    }
  }, [bookId]);

  const fetchBook = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Токен авторизации отсутствует.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`https://localhost:44350/api/Book/${bookId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data && response.data.data) {
        setBook(response.data.data);
      } else {
        setError('Ошибка получения данных о книге.');
      }
    } catch (error) {
      console.error('Ошибка при получении данных книги:', error);
      if (error.response) {
        if (error.response.status === 404) {
          setError('Книга не найдена. Проверьте правильность идентификатора.');
        } else if (error.response.status === 401) {
          setError('Ошибка авторизации. Проверьте токен.');
        } else {
          setError('Ошибка при получении данных книги. Проверьте консоль для подробностей.');
        }
      } else {
        setError('Ошибка сети или сервер недоступен.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Токен авторизации отсутствует.');
        return;
      }

      const response = await axios.get('https://localhost:44350/api/Author/GetAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 && response.data) {
        setAuthors(response.data.data || []);
      } else {
        setError('Ошибка получения списка авторов.');
      }
    } catch (error) {
      console.error('Ошибка при получении списка авторов:', error);
      setError('Ошибка при получении списка авторов. Проверьте консоль для подробностей.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBook((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpdateBook = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`https://localhost:44350/api/Book`, book, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Книга успешно обновлена!');
      navigate('/adminMain');
    } catch (error) {
      console.error('Ошибка при обновлении книги:', error);
      setError('Ошибка при обновлении книги. Проверьте консоль для подробностей.');
    }
  };

  const handleUploadPhoto = async () => {
    const token = localStorage.getItem('token');
    if (!selectedFile) {
      setError('Пожалуйста, выберите файл.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post(`https://localhost:44350/Photo/HandleFileUpload/${book.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Фото успешно загружено!');
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
      setError('Ошибка при загрузке фото. Проверьте консоль для подробностей.');
    }
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="edit-book-container">
      <h1>Редактировать книгу</h1>
      <div className="edit-book-form">
        <input
          type="text"
          name="bookName"
          placeholder="Название книги"
          maxLength={50}
          value={book.bookName}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="isbn"
          placeholder="ISBN"
          maxLength={50}
          value={book.isbn}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="genre"
          placeholder="Жанр"
          maxLength={10}
          value={book.genre}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Описание"
          maxLength={250}
          value={book.description}
          onChange={handleInputChange}
        />
        <select
          name="authorId"
          value={book.authorId}
          onChange={handleInputChange}
        >
          <option value="">Выберите автора</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name} {author.surname}
            </option>
          ))}
        </select>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUploadPhoto}>Загрузить фото</button>
        <button onClick={handleUpdateBook}>Обновить книгу</button>
      </div>
    </div>
  );
}

export default EditBook;
