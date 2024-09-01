import React, { useState } from "react";
import AdminProfileMenu from "../../AdminProfileMenu/AdminProfileMenu";
import './AdminMain.css'
import ManageBooks from "../../ManageBooks/ManageBooks";
import ManageAuthors from "../../ManageAuthors/ManageAuthors";


function AdminMain() {
  const [typeOfIcon, setTypeOfIcon] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);

  function handleProfileIcon() {
    setTypeOfIcon(!typeOfIcon);
  }

  function handleBooksClick() {
    setActiveComponent(<ManageBooks/>);
  }
  function handleAuthorsClick() {
    setActiveComponent(<ManageAuthors/>);
  }


  return (
    <>
      {typeOfIcon && <AdminProfileMenu />}

      <header>
        <div className="logo"></div>
        <div className="rightBlock">
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

      <div className="buttonsBlockAdmin">
        <button onClick={handleBooksClick} className = "userButton">Книги</button>
        <button onClick={handleAuthorsClick} className = "userButton">Авторы</button>
      </div>

      {/* Отображение активного компонента */}
      {activeComponent}
    </>
  );
}

export default AdminMain;