import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Main from "./Main";
import ConfirmPopup from "./ConfirmPopup";
import ImagePopup from "./ImagePopup";
import EditProfilePopup from "./EditProfilePopup";
import EditAvatarPopup from "./EditAvatarPopup";
import AddPlacePopup from "./AddPlacePopup";
import InfoToolTip from "./InfoTooltip";

import api from "../utils/api";
import * as auth from "../utils/auth";

import { CurrentUserContext } from "../contexts/CurrentUserContext";

import { Route, Switch, useHistory, Redirect } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";

import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [cards, setCards] = useState([]);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [deletedCard, setDeletedCard] = useState({})
  const [authorizationEmail, setAuthorizationEmail] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const token = localStorage.getItem("token")
console.log(token);
    if (token) {
      auth
        .checkToken(token)
        .then((data) => {
          setLoggedIn(true);
          setAuthorizationEmail(data.email)
          history.push("/")
        })
        .catch((err) => {
          if (err.status === 401) {
            console.log("401 — Токен не передан или передан не в том формате")
          }
          console.log("401 — Переданный токен некорректен")
          console.log(err.status, err.message, err.stack)
        })
    }
  }, [history])

  useEffect(() => {
    loggedIn &&
      Promise.all([api.getUserInfo(), api.getInitialCards()])
        .then(([profileInfo, cards]) => {
          console.log(profileInfo);
          console.log(cards)
          setCurrentUser(profileInfo)
          setCards(cards.data.reverse())
        })
        .catch((error) => console.log(`Ошибка: ${error}`))
  }, [loggedIn])

  function handleCardLike(card) {
    const isLiked = card.likes.some((user) => user === currentUser._id);
    (isLiked ? api.removeLike(card._id) : api.addLike(card._id, true))
      .then((newCard) => {
        setCards((state) =>
          state.map((c) => (c._id === newCard.data._id ? newCard.data : c))
        );
      })
      .catch((err) => console.log(err));
  }

  function handleCardDelete(card) {
    setIsLoading(true);
    api
      .deleteCard(card._id)
      .then(() => {
        setCards((state) => state.filter((c) => c !== card));
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  function handleAddPlaceSubmit(data) {
    setIsLoading(true);
    console.log(data)
    api
      .createCard(data)
      .then((newCard) => {
        setCards([newCard.data, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(!isEditProfilePopupOpen);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(!isAddPlacePopupOpen);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleInfoToolTipOpen() {
    setIsInfoToolTipOpen(!isInfoToolTipOpen);
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsInfoToolTipOpen(false);
    setIsConfirmPopupOpen(false);
    setSelectedCard(null);
    setDeletedCard({});
  }

  function handleOverlayClick(evt) {
    if (evt.target === evt.currentTarget) {
      console.log("overlay")
      closeAllPopups();
    }
  }

  function handleUpdateAvatar(data) {
    setIsLoading(true);
    api
      .setUserAvatar(data)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  function handleUpdateUser(data) {
    setIsLoading(true);
    api
      .setUserInfo(data)
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }

  function register(data) {
    console.log(data);
    auth
      .register(data)
      .then((data) => {
        setIsSuccess(true);
        handleInfoToolTipOpen();
        history.push("/sign-in");
      })
      .catch((err) => {
        console.log(err);
        setIsSuccess(false);
        handleInfoToolTipOpen();
      });
  }

  function login(data) {
    console.log(data);
    auth
      .autorize(data)
      .then((data) => {
        
        localStorage.setItem("token", data.token);
        setLoggedIn(true);
        history.push("/");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleSignOut() {
    setLoggedIn(false);
    localStorage.removeItem("token");
    history.push("/sign-in");
  }


  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="App">
        <div className="root">
          <div className="page">
            <Header
              loggedIn={loggedIn}
              onSignOut={handleSignOut}
              authorizationEmail={authorizationEmail}
            />
            <Switch>
              <Route path="/sign-up">
                <Register onRegister={register} />
              </Route>
              <Route path="/sign-in">
                <Login onLogin={login} />
              </Route>

              <ProtectedRoute
                path
                exact="/"
                component={Main}
                loggedIn={loggedIn}
                cards={cards}
                onCardLike={handleCardLike}
                //onCardDelete={handleCardDelete}
                onDeletedCard={setDeletedCard}
                onEditProfile={handleEditProfileClick}
                onAddPlace={handleAddPlaceClick}
                onEditAvatar={handleEditAvatarClick}
                onCardClick={handleCardClick}
                onConfirmPopup={setIsConfirmPopupOpen}
                isLoading={isLoading}
              />
              <Route>
                {loggedIn ? <Redirect to="/sign-in" /> : <Redirect to="/" />}
              </Route>
            </Switch>
            <Footer />
          </div>
          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
            onLoading={isLoading}
            handleOverlayClick={handleOverlayClick}
          />
          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddPlaceSubmit}
            onLoading={isLoading}
            handleOverlayClick={handleOverlayClick}
          />

          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
            onLoading={isLoading}
            handleOverlayClick={handleOverlayClick}
          />

          <ConfirmPopup
            isOpen={isConfirmPopupOpen}
            onClose={closeAllPopups}
            //onSubmit={handleCardDelete}
            onLoading={isLoading}
            handleOverlayClick={handleOverlayClick}
            card={deletedCard}
            onCardDelete={handleCardDelete}
          />

          <ImagePopup
            card={selectedCard}
            onClose={closeAllPopups}
            handleOverlayClick={handleOverlayClick}
            
          />
        </div>
      </div>
      <InfoToolTip
        isOpen={isInfoToolTipOpen}
        onClose={closeAllPopups}
        isSuccess={isSuccess}
        handleOverlayClick={handleOverlayClick}
        
      />
    </CurrentUserContext.Provider>
  );
}

export default App;
