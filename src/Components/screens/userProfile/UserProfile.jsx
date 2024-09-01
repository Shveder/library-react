import React, { useContext, useState } from "react";
import { AuthContext } from "../../../providers/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import './UserProfile.css'
import MyBooks from "../../MyBooks/MyBooks";
import HelpBlock from "../../HelpBlock/HelpBlock";

function UserProfile() {
  // eslint-disable-next-line
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedComponent, setSelectedComponent] = useState('myBooks');

  function handleExit() {
    setUser(null);
    navigate('/authorization');
  }
  const handleButtonClick = (component) => {
    setSelectedComponent(component);
  }


  const renderComponent = () => {
    switch (selectedComponent) {
      case 'myBooks':
        return <MyBooks />;
      case 'helpBlock':
        return <HelpBlock />;
      default:
        return <HelpBlock />;
    }
  }

  return <>

    <header>
      <div className="logo">
        <Link to="/userMain" title=" Перейти на главную страницу"><p>Library</p></Link>
      </div>
    </header>
    <div className="profileMenu">
      <img src="images/profileIcon.png" alt="Иконка профиля" className="avatar" />
      <button className="profileButt" title="Мои заказы" onClick={() => handleButtonClick('myBooks')}><p className="textInMenu">Мои книги</p></button>
      <button className="profileButt" title="Получить помощь" onClick={() => handleButtonClick('helpBlock')}><p className="textInMenu"><img src="/images/helpIcon.png" className="menuIcon" alt="Иконка помощи" />Помощь и поддержка</p></button>
      <button className="profileButt" onClick={handleExit} title="Выйти из аккаунта"><p className="textInMenu"><img src="/images/exitIcon.png" className="menuIcon" alt="Иконка выхода" />Выйти</p></button>
    </div>
    {renderComponent(selectedComponent)}
  </>

}

export default UserProfile;