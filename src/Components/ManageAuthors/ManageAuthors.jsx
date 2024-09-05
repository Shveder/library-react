import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './ManageAuthors.css';

Modal.setAppElement('#root'); // Устанавливаем корневой элемент для модальных окон

function ManageAuthors() {
  const [authors, setAuthors] = useState([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAuthor, setNewAuthor] = useState({
    name: '',
    surname: '',
    birthday: '',
    country: '',
  });
  const [validationError, setValidationError] = useState(''); // Состояние для хранения ошибки валидации

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Токен не найден.');
        setLoading(false);
        return;
      }

      const response = await axios.get('https://localhost:44350/api/Author/GetAll', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAuthors(response.data.data);
    } catch (error) {
      console.error('Ошибка при получении данных о авторах:', error);
      setError('Ошибка при получении данных о авторах. Проверьте консоль для подробностей.');
    } finally {
      setLoading(false);
    }
  };

  const validateFields = () => {
    if (!newAuthor.name.trim()) return 'Поле "Имя" не должно быть пустым.';
    if (!newAuthor.surname.trim()) return 'Поле "Фамилия" не должно быть пустым.';
    if (!newAuthor.birthday) return 'Поле "Дата рождения" не должно быть пустым.';
    if (isNaN(Date.parse(newAuthor.birthday))) return 'Поле "Дата рождения" должно содержать корректную дату.';
    if (!newAuthor.country.trim()) return 'Поле "Страна" не должно быть пустым.';
    return '';
  };

  const handleAddAuthor = async () => {
    const validationError = validateFields();
    if (validationError) {
      setValidationError(validationError);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const formattedBirthday = new Date(newAuthor.birthday).toISOString(); // Преобразуем дату в формат UTC
      await axios.post('https://localhost:44350/api/Author', { ...newAuthor, birthday: formattedBirthday }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewAuthor({
        name: '',
        surname: '',
        birthday: '',
        country: '',
      });
      setValidationError(''); // Очистить ошибку валидации после успешного добавления
      await fetchAuthors();
    } catch (error) {
      console.error('Ошибка при добавлении автора:', error);
      setError('Ошибка при добавлении автора. Проверьте консоль для подробностей.');
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://localhost:44350/api/Author/${selectedAuthorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAuthors(authors.filter(author => author.id !== selectedAuthorId));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Ошибка при удалении автора:', error);
      setError('Ошибка при удалении автора. Проверьте консоль для подробностей.');
    }
  };

  const openDeleteModal = (authorId) => {
    setSelectedAuthorId(authorId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAuthor(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="manage-authors-container">
      <h1>Управление авторами</h1>

      <div className="add-author-form">
        <h2>Добавить автора</h2>
        {validationError && <p className="validation-error">{validationError}</p>} {/* Вывод ошибки валидации */}
        <input
          type="text"
          name="name"
          placeholder="Имя"
          maxLength={30}
          value={newAuthor.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="surname"
          maxLength={30}
          placeholder="Фамилия"
          value={newAuthor.surname}
          onChange={handleInputChange}
        />
        <input
          type="date"
          name="birthday"
          placeholder="Дата рождения"
          value={newAuthor.birthday}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="country"
          maxLength={30}
          placeholder="Страна"
          value={newAuthor.country}
          onChange={handleInputChange}
        />
        <button onClick={handleAddAuthor}>Добавить</button>
      </div>

      <table className="authors-table">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Дата рождения</th>
            <th>Страна</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {authors.map(author => (
            <tr key={author.id}>
              <td>{author.name}</td>
              <td>{author.surname}</td>
              <td>{new Date(author.birthday).toLocaleDateString()}</td>
              <td>{author.country}</td>
              <td>
                <button onClick={() => openDeleteModal(author.id)}>Удалить</button>
              </td>
            </tr>
          ))}
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
        <p>Вы уверены, что хотите удалить этого автора?</p>
        <button onClick={handleDelete}>Удалить</button>
        <button onClick={closeDeleteModal}>Отмена</button>
      </Modal>
    </div>
  );
}

export default ManageAuthors;
