import React, { useRef } from 'react';
import { Button } from 'antd';
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
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

// Define a type for the collected props
interface CollectedProps {
  isDragging: boolean;
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
    hover(item: unknown, monitor: DropTargetMonitor) {
      if (!ref.current) return;

      const dragItem = item as DragItem; // Type assertion here
      const dragIndex = dragItem.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      // Move the item
      moveVideo(dragIndex, hoverIndex);

      // Update the drag index
      dragItem.index = hoverIndex;
    },
  });

  // Drag handler
  const [{ isDragging }, drag] = useDrag<DragItem, unknown, CollectedProps>({
    type: 'video',
    item: { index },
    collect: (monitor: DragSourceMonitor) => ({
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
        style={{ border: 'none', background: 'transparent', color: "#3b82f6" }}
      />
    </div>
  );
};
