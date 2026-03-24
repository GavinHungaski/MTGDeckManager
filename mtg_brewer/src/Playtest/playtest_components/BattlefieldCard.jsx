import { useContext, useRef } from "react";
import { Image, Group, Rect } from "react-konva";
import useImage from "use-image";
import { PlaytestContext } from "../Playtest";
import { CARD_WIDTH, CARD_HEIGHT } from "../playtest_utils/constants";

function BattlefieldCard({ card }) {
  const { state, actions } = useContext(PlaytestContext);
  const { instanceId, x, y, tapped } = card;
  const cardData = state.cardLibrary[instanceId];
  const [image] = useImage(cardData?.image);

  const isSelected = state.selectedInstanceIds.includes(instanceId);

  const rotation = tapped ? 90 : 0;
  const offsetX = tapped ? CARD_WIDTH / 2 : 0;
  const offsetY = tapped ? CARD_WIDTH / 2 : 0;

  const dragStartPos = useRef(null);

  const handleDragStart = (e) => {
    actions.moveCard(instanceId, e.target.x(), e.target.y());
  };

  const handleDragEnd = (e) => {
    actions.moveCard(instanceId, e.target.x(), e.target.y());
  };

  const handleContextMenu = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    actions.setContextMenu(pos.x, pos.y, instanceId);
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
      onClick={() => actions.selectCards([instanceId])}
    >
      {image ? (
        <Image
          image={image}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          cornerRadius={4}
        />
      ) : (
        <Rect
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          fill="#1a1a2e"
          cornerRadius={4}
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

export default BattlefieldCard;
