///getManifest.js
export const getManifest = () => {
    // Read the background color from local storage, or use a default
    const backgroundColor = localStorage.getItem('backgroundColor') || '#ffffff';
  
    return {
      name: "YouTube Watchlist",
      short_name: "YT Watchlist",
      start_url: "/",
      display: "standalone",
      background_color: backgroundColor,
      theme_color: "#ffffff",
      description: "View all your YouTube videos in one place, add free",
      icons: [
        {
          src: "/fav_ivon_lightmode-144x144.png",
          sizes: "144x144",
          type: "image/png"
        },
        {
          src: "/fav_ivon_lightmode-192x192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/fav_ivon_lightmode-256x256.png",
          sizes: "256x256",
          type: "image/png"
        },
        {
          src: "/fav_ivon_lightmode-384x384.png",
          sizes: "384x384",
          type: "image/png"
        },
        {
          src: "/fav_ivon_lightmode-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ],
      screenshots: [
        {
          src: "/prev_1.png",
          sizes: "1280x720",
          type: "image/png",
          form_factor: "wide"
        },
        {
          src: "/prev_2.png",
          sizes: "1280x720",
          type: "image/png",
          form_factor: "wide"
        },
        {
          src: "/thumb-512x512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    };
  };
  