const addToPlaylist = async () => {
    if (!currentUrl) return;
  
    if (playlist.includes(currentUrl)) {
      console.log('URL already in playlist:', currentUrl);
      return;  // Prevent adding the same URL again
    }
    
    try {
      const res = await fetch('/api/add-to-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: currentUrl }),
      });
  
      const data = await res.json();
  
      if (data.playlist) {
        console.log('Adding to playlist:', currentUrl);
        setPlaylist(data.playlist); // Update playlist state with the new playlist
      } else {
        console.error('Error: No playlist returned from API');
      }
    } catch (error) {
      console.error('Failed to add to playlist:', error);
    }
  };
  