// import React, { useState } from 'react';
// import { Button, List, Drawer, Input } from 'antd';
// import { FolderOutlined } from '@ant-design/icons'; // Import the folder icon

// interface SidebarProps {
//   folders: string[]; // List of folder names
//   onFolderClick: (folderName: string) => void; // Callback when a folder is clicked
// }

// const LibrarySidebarComponent: React.FC<SidebarProps> = ({ folders, onFolderClick }) => {
//   const [collapsed, setCollapsed] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   // Filter folders based on search term
//   const filteredFolders = folders.filter(folder =>
//     folder.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <>
//       <Button onClick={() => setCollapsed(!collapsed)} style={{ color: 'white', backgroundColor: 'black' }}>
//         {collapsed ? 'Open Libraries' : 'Close Libraries'}
//       </Button>
//       <Drawer
//         title={<span style={{ color: 'white' }}>Your Watchlists</span>}
//         placement="left"
//         closable={false}
//         visible={!collapsed}
//         onClose={() => setCollapsed(true)}
//         style={{ backgroundColor: 'black', color: 'white' }}
//         width={200}
//       >
//         <Input
//           placeholder="Search folders"
//           onChange={(e) => setSearchTerm(e.target.value)}
//           style={{ marginBottom: '16px', borderColor: '#434343', color: 'white', backgroundColor: '#333' }}
//         />
//         <List
//           dataSource={filteredFolders}
//           renderItem={(folder) => (
//             <List.Item 
//               onClick={() => onFolderClick(folder)} 
//               style={{ color: 'white', cursor: 'pointer' }}
//             >
//               <FolderOutlined className="mr-2" /> {/* Folder icon with margin */}
//               {folder}
//             </List.Item>
//           )}
//         />
//       </Drawer>
//     </>
//   );
// };

// export default LibrarySidebarComponent;





import React, { useState } from 'react';
import { Button, List, Drawer, Input, Modal } from 'antd';
import { FolderOutlined, PlusOutlined } from '@ant-design/icons'; // Import the icons

interface SidebarProps {
  folders: string[]; // List of folder names
  onFolderClick: (folderName: string) => void; // Callback when a folder is clicked
  onAddItemToFolder: (folderName: string, item: PlaylistItem) => void; // Callback to add an item to a folder
}

interface PlaylistItem {
  url: string;
  title: string;
}

const LibrarySidebarComponent: React.FC<SidebarProps> = ({ folders, onFolderClick, onAddItemToFolder }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<PlaylistItem>({ url: '', title: '' });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(folderName);
    onFolderClick(folderName);
  };

  const handleAddItemClick = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    if (selectedFolder && newItem.url && newItem.title) {
      onAddItemToFolder(selectedFolder, newItem);
      setNewItem({ url: '', title: '' });
      setIsModalVisible(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button onClick={() => setCollapsed(!collapsed)} style={{ color: 'white', backgroundColor: 'black' }}>
        {collapsed ? 'Open Libraries' : 'Close Libraries'}
      </Button>
      <Drawer
        title={<span style={{ color: 'white' }}>Your Playlists</span>}
        placement="left"
        closable={false}
        visible={!collapsed}
        onClose={() => setCollapsed(true)}
        drawerStyle={{ backgroundColor: 'black', color: 'white' }}
      >
        <List
          dataSource={folders}
          renderItem={(folder) => (
            <List.Item 
              onClick={() => handleFolderClick(folder)} 
              style={{ color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <FolderOutlined className="mr-2" /> {/* Folder icon with margin */}
                {folder}
              </div>
              {selectedFolder === folder && (
                <Button 
                  type="text" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddItemClick} 
                  style={{ color: 'white' }}
                />
              )}
            </List.Item>
          )}
        />
      </Drawer>

      <Modal
        title="Add Item to Folder"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Input
          placeholder="Video URL"
          value={newItem.url}
          onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
          style={{ marginBottom: '8px' }}
        />
        <Input
          placeholder="Title"
          value={newItem.title}
          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
        />
      </Modal>
    </>
  );
};

export default LibrarySidebarComponent;
