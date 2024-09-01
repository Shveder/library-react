import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Authorization.css";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { useState, useContext } from "react";
import { AuthContext } from '../../../providers/AuthProvider';

function Authorization() {
  const [password, setPassword] = useState('');
  const [login, setLogin] = useState('');
  const [errorMessage, setText] = useState('');
  const navigate = useNavigate();
  const {setUser } = useContext(AuthContext);

  const handleAuth = (event) => {
    event.preventDefault();
    axios.post('https://localhost:44350/Authorization/Login', { login, password })
      .then(response => {
        if (response.status === 200) {
          const token = response.data; // Получаем токен из ответа
          const decoded = jwtDecode(token); // Декодируем токен

          setUser({
            id: decoded.id,
            login: decoded.login,
            role: decoded.role,
          });
          console.log(decoded);

          // Сохраняем токен для дальнейшего использования
          localStorage.setItem('token', token);
          localStorage.setItem('userId', decoded.id);

          if (decoded.role === "admin") {
            console.log("Это админ");
            navigate("/adminMain");
          } else if (decoded.role === "user") {
            console.log("Это юзер");
            navigate("/userMain");
          }
        }
      })
      .catch(error => {
        console.error(error.response.data.message);
        setText(error.response.data.message);
      });
  };

  return (
    <>
      <div className="container">
        <div className="login">
          <div className="container">
            <h1>Авторизация</h1>
            <input
              type="email"
              maxLength={30}
              placeholder="Логин"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
            />
            <input
              type="password"
              maxLength={30}
              placeholder="Пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <br />
            <button onClick={handleAuth}>Войти</button>
            <h4 className="errorText1">{errorMessage}</h4>
            <div className="clearfix"></div>
            <span className="copyright">&copy;2024</span>
          </div>
        </div>
        <div className="register">
          <div className="container">
            <img
              src="/images/peopleLogo.png"
              alt="Иконка человека"
              className="peopleLogo"
            />
            <h2>Привет!</h2>
            <p>Введи свои данные и получи полный доступ ко всем возможностям</p>
            <Link to="/registration">
              <button>Регистрация</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Authorization;
