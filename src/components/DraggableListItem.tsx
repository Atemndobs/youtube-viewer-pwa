import React, { useRef } from 'react';
import { Button } from 'antd';
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useDrag, useDrop } from 'react-dnd';
import { useMediaQuery } from 'react-responsive';

interface PlaylistItem {
  url: string;
  title: string;
  publishedAt?: string;
  views?: number;
  likes?: number;
}

interface DraggableItemProps {
  video: PlaylistItem;
  index: number;
  moveVideo: (dragIndex: number, hoverIndex: number) => void;
  setCurrentSong: (video: PlaylistItem) => void;
  removeFromPlaylist: (url: string) => void;
  isDarkMode: boolean;
}

interface DragItem {
  index: number;
}

export const DraggableListItem: React.FC<DraggableItemProps> = ({
  video,
  index,
  moveVideo,
  setCurrentSong,
  removeFromPlaylist,
  isDarkMode

}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Drop handler
  const [, drop] = useDrop({
    accept: 'video',
    hover(item: DragItem, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveVideo(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // Drag handler
  const [{ isDragging }, drag] = useDrag({
    type: 'video',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));
  const isMobile = useMediaQuery({ maxWidth: 430 }); // Adjust for mobile

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: isDarkMode ? 'white' : 'gray',
      }}
    >
      <Button
        type="link"
        icon={<PlayCircleOutlined />}
        onClick={() => setCurrentSong(video)}
        style={{ color: isDarkMode ? 'white' : 'black' }}
      >
        {isMobile ? '' : 'Play'}
      </Button>
      <span
        style={{
          marginLeft: '8px',
          color: isDarkMode ? 'white' : 'black',
          textAlign: 'left',  // Align text to the left
          flex: 1,  // Ensure the text takes up remaining space in the row
        }}
      >
        {video.title}
      </span>

      <Button
        icon={<DeleteOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          removeFromPlaylist(video.url);
        }}
        style={{ color: isDarkMode ? 'white' : 'black', border: 'none', background: 'transparent' }}
      />
    </div>
  );
};
