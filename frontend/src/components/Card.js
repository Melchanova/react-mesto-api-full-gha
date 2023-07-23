import React from "react";
import { CurrentUserContext } from "../contexts/CurrentUserContext";

function Card(props) {
  const currentUser = React.useContext(CurrentUserContext);

  const isOwn = (props.card.owner?._id || props.card.owner) === currentUser._id

  const isLiked = props.card.likes.some((i) => i === currentUser._id);

  const cardLikeButtonClassName = `card__like ${
    isLiked ? "card__like_active" : "card__like"
  }`;

  function handleCardClick() {
    props.onCardClick(props.card);
  }
  function handleLikeClick() {
    props.onCardLike(props.card);
  }
  function handleCardDelete() {
    props.onCardDelete(props.card);
    props.onConfirmPopup(true)
  }
  return (
    <li className="card">
      <img
        className="card__image"
        onClick={handleCardClick}
        src={props.card.link}
        alt={`Фотография ${props.card.name}`}
      />
      {isOwn && (
        <button
          className="card__delete-button"
          aria-label="Удалить"
          onClick={handleCardDelete}
          type="button"
        />
      )}

      <div className="card__item">
        <h2 className="card__title text-content">{props.card.name} </h2>
        <div className="card__like-container">
          <button
            type="button"
            onClick={handleLikeClick}
            className={cardLikeButtonClassName}
          />
          <span className="card__like-count">{props.card.likes.length}</span>
        </div>
      </div>
    </li>
  );
}

export default Card;
