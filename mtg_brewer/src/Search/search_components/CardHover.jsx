import "./CardHover.css";

function CardHover({ card, mousePos }) {
  return (
    <>
      {card && (
        <div
          className="card-hover-container"
          style={{
            ...{ top: mousePos[1] - 175 },
            ...(mousePos[0] < window.innerWidth / 2
              ? { left: mousePos[0] + 115 }
              : { right: window.innerWidth - mousePos[0] + 115 }),
          }}
        >
          <img
            className="hover-img"
            src={
              card.image_uris?.normal ||
              card.image_uris?.small ||
              card.card_faces?.[0]?.image_uris?.normal
            }
            alt={card.name}
          />
          {card.card_faces && (
            <img
              className="hover-img"
              src={card.card_faces?.[1]?.image_uris?.normal}
              alt={card.name}
            />
          )}
        </div>
      )}
    </>
  );
}

export default CardHover;
