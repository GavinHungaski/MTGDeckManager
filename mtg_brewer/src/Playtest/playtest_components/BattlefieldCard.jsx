import { useContext, useRef, memo } from "react";
import { Image, Group, Rect } from "react-konva";
import useImage from "use-image";
import { PlaytestContext } from "../Playtest";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_BACK_IMAGE,
} from "../playtest_utils/constants";
import CounterBadge from "./CounterBadge";

function BattlefieldCard({ card }) {
  const { state, actions } = useContext(PlaytestContext);
  const { instanceId, x, y, tapped, flipped } = card;

  const cardData = state.cardLibrary[instanceId];
  const [image] = useImage(cardData?.image);
  const [back_image] = useImage(cardData?.back_image || CARD_BACK_IMAGE);

  const isSelected = state.selectedInstanceIds.includes(instanceId);

  const rotation = tapped ? 90 : 0;
  const offsetX = tapped ? -CARD_WIDTH / 2 : 0;
  const offsetY = tapped ? CARD_HEIGHT : 0;

  const handleDragStart = () => {
    const idsToMove = isSelected ? state.selectedInstanceIds : [instanceId];
    actions.bringToFront(idsToMove);
  };

  const handleDragEnd = (e) => {
    const { x: newX, y: newY } = e.target.position();

    if (isSelected && state.selectedInstanceIds.length > 1) {
      actions.stackCards(state.selectedInstanceIds, newX, newY);
    } else {
      actions.moveCard(instanceId, newX, newY);
    }
  };

  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    const pos = e.target.getStage().getPointerPosition();
    actions.setContextMenu(pos.x, pos.y, "card", instanceId);
  };

  const handleDbClick = (e) => {
    if (e.evt.button === 0) {
      isSelected
        ? actions.tapMany(state.selectedInstanceIds)
        : actions.tapCard(instanceId);
    }
  };

  return (
    <Group
      x={x}
      y={y}
      draggable
      rotation={rotation}
      offsetX={offsetX}
      offsetY={offsetY}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onContextMenu={handleContextMenu}
      onDblClick={handleDbClick}
    >
      {image ? (
        <Image
          image={flipped ? back_image : image}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          cornerRadius={10}
        />
      ) : (
        <Rect
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          fill="#1a1a2e"
          cornerRadius={10}
        />
      )}

      {card.counters.map((counter, index) => (
        <CounterBadge
          key={counter.id}
          counter={counter}
          instanceId={instanceId}
          index={index}
        />
      ))}

      {isSelected && (
        <Rect
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          stroke="#00bfff"
          strokeWidth={3}
          fill="rgba(0, 191, 255, 0.1)"
          listening={false}
          cornerRadius={10}
        />
      )}
    </Group>
  );
}

export default memo(BattlefieldCard);
