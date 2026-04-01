import { useContext, useRef, memo } from "react";
import { Image, Group, Rect } from "react-konva";
import useImage from "use-image";
import { PlaytestContext } from "../Playtest";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_BACK_IMAGE,
} from "../playtest_utils/constants";

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

  const dragStartPos = useRef(null);

  const handleDragStart = (e) => {
    dragStartPos.current = { x, y };
  };

  const handleDragEnd = (e) => {
    const node = e.target;
    const pos = node.getAbsolutePosition();

    actions.moveCard(instanceId, pos.x, pos.y);
  };

  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    actions.setContextMenu(pos.x, pos.y, "card", instanceId);
  };

  const handleDbClick = (e) => {
    if (e.evt.button === 0) {
      if (isSelected) {
        actions.tapMany(state.selectedInstanceIds);
      } else {
        actions.tapCard(instanceId);
      }
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
          imageSmoothingEnabled={false}
        />
      ) : (
        <Rect
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          fill="#1a1a2e"
          cornerRadius={10}
        />
      )}

      {isSelected && (
        <Rect
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          stroke="#00bfff"
          strokeWidth={2}
          fill="transparent"
          cornerRadius={4}
          listening={false}
        />
      )}
    </Group>
  );
}

export default memo(BattlefieldCard);
