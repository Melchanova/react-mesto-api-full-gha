import React from "react";
import Card from "./Card";
import { CurrentUserContext } from "../contexts/CurrentUserContext";

function Main(props) {
  const currentUser = React.useContext(CurrentUserContext);

  return (
    <main className="content">
      <section className="profile page__content">
        <div className="profile__overlay">
          <img
            src={currentUser.avatar}
            alt={`Аватар пользователя ${currentUser.name}`}
            className="profile__avatar"
          />
          <button
            onClick={props.onEditAvatar}
            className="profile__avatar-edit-button"
          />
        </div>
        <div className="profile__info">
          <div className="profile__header">
            <h1 className="profile__title">{currentUser.name}</h1>
            <p className="profile__description">{currentUser.about}</p>
          </div>
          <button
            onClick={props.onEditProfile}
            type="button"
            className="profile__popup-button"
          />
        </div>

        <button
          onClick={props.onAddPlace}
          type="button"
          className="profile__add-button"
        />
      </section>
      <section className="cards" aria-label="#">
        <ul className="cards__list">
          {props.cards.map((card) => (
            <Card
              key={card._id}
              card={card}
              onCardClick={props.onCardClick}
              onCardLike={props.onCardLike}
              //onCardDelete={props.onCardDelete}
              onCardDelete={props.onDeletedCard}
              onConfirmPopup={props.onConfirmPopup}
            />
          ))}
        </ul>
      </section>
    </main>
  );
}

export default Main;
