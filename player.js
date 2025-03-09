// Music Player JavaScript with enhanced mobile support and cross-page persistence
document.addEventListener('DOMContentLoaded', function() {
  // Create and append the music player to the body
  const musicPlayerHTML = document.getElementById('music-player');
  if (!musicPlayerHTML) {
    const playerDiv = document.createElement('div');
    playerDiv.id = 'music-player';
    playerDiv.innerHTML = `
      <div class="player-header">
        <span class="player-title">Music Player</span>
        <button id="minimize-player" class="player-btn">_</button>
      </div>
      <div class="player-content">
        <div class="now-playing">
          <div class="track-info">
            <div id="track-name">No track selected</div>
            <div id="artist-name"></div>
          </div>
          <div class="progress-container">
            <div id="progress-bar"></div>
            <div class="time-display">
              <span id="current-time">0:00</span>
              <span id="total-time">0:00</span>
            </div>
          </div>
        </div>
        <div class="controls">
          <button id="prev-btn" class="control-btn" disabled>◀◀</button>
          <button id="play-btn" class="control-btn" disabled>▶</button>
          <button id="next-btn" class="control-btn" disabled>▶▶</button>
          <div class="volume-container">
            <button id="mute-btn" class="control-btn">🔊</button>
            <input type="range" id="volume-slider" min="0" max="100" value="80">
          </div>
        </div>
        <div class="playlist-section">
          <div class="playlist-header">
            <h3>Playlists</h3>
            <select id="playlist-select">
              <option value="default">Default Playlist</option>
              <option value="favorites">Favorites</option>
            </select>
          </div>
          <ul id="playlist-songs">
            <!-- Playlist items will be added here dynamically -->
          </ul>
        </div>
      </div>
    `;
    document.body.appendChild(playerDiv);
  }

  // Sample playlists data (you would replace this with your actual music data)
  const playlists = {
    'default': [
      { title: 'all down', artist: 'gunk', src: 'https://files.catbox.moe/t5xp75.mp3' },
      { title: 'Dimension 63', artist: 'Moh Baretta', src: 'https://files.catbox.moe/0758ha.mp3' },
      { title: 'lover', artist: 'xstasyslim', src: 'https://files.catbox.moe/ypi1h7.mp3' },
      { title: 'overcast', artist: 'bbyazul', src: 'https://files.catbox.moe/mmgi11.mp3' },
      { title: 'Call Of Duty', artist: 'Izaya Tiji', src: 'https://files.catbox.moe/gn3see.mp3' },
      { title: 'journal 6', artist: 'chinapoet', src: 'https://files.catbox.moe/68dxb0.mp3' }
    ],
    'favorites': [
    ]
  };

  // Player elements
  const player = document.getElementById('music-player');
  const minimizeBtn = document.getElementById('minimize-player');
  const playBtn = document.getElementById('play-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const muteBtn = document.getElementById('mute-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const trackName = document.getElementById('track-name');
  const artistName = document.getElementById('artist-name');
  const progressBar = document.getElementById('progress-bar');
  const currentTime = document.getElementById('current-time');
  const totalTime = document.getElementById('total-time');
  const playlistSelect = document.getElementById('playlist-select');
  const playlistSongs = document.getElementById('playlist-songs');
  const progressContainer = document.querySelector('.progress-container');

  // Audio element
  const audio = new Audio();
  let currentPlaylist = 'default';
  let currentTrackIndex = -1;
  let isPlaying = false;
  let isMobile = window.innerWidth <= 480;
  
  // Set a unique ID for this player instance
  const playerInstanceId = 'musicPlayer_' + Date.now();
  
  // Add storage event listener to sync state across tabs/pages
  window.addEventListener('storage', handleStorageEvent);
  
  // Listen for page visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Check if device is mobile
  function checkMobile() {
    isMobile = window.innerWidth <= 480;
    if (isMobile) {
      // Reset player position for mobile
      player.style.left = '';
      player.style.top = '';
      player.style.right = '10px';
      player.style.bottom = '10px';
    }
  }
  
  // Listen for window resize
  window.addEventListener('resize', checkMobile);
  checkMobile(); // Check on load

  // Make player draggable (only on desktop)
  let isDragging = false;
  let dragOffsetX, dragOffsetY;

  const playerHeader = player.querySelector('.player-header');
  
  // Only enable dragging on non-mobile
  playerHeader.addEventListener('mousedown', function(e) {
    if (!isMobile) {
      isDragging = true;
      dragOffsetX = e.clientX - player.getBoundingClientRect().left;
      dragOffsetY = e.clientY - player.getBoundingClientRect().top;
    }
  });

  // Touch support for mobile dragging (limited functionality)
  playerHeader.addEventListener('touchstart', function(e) {
    if (!isMobile) { // Still only enable on larger screens
      isDragging = true;
      const touch = e.touches[0];
      dragOffsetX = touch.clientX - player.getBoundingClientRect().left;
      dragOffsetY = touch.clientY - player.getBoundingClientRect().top;
    }
  });

  document.addEventListener('mousemove', function(e) {
    if (isDragging && !isMobile) {
      const x = e.clientX - dragOffsetX;
      const y = e.clientY - dragOffsetY;
      
      // Keep player within viewport bounds
      const maxX = window.innerWidth - player.offsetWidth;
      const maxY = window.innerHeight - player.offsetHeight;
      
      player.style.right = 'auto';
      player.style.bottom = 'auto';
      player.style.left = `${Math.max(0, Math.min(maxX, x))}px`;
      player.style.top = `${Math.max(0, Math.min(maxY, y))}px`;
    }
  });

  document.addEventListener('touchmove', function(e) {
    if (isDragging && !isMobile) {
      const touch = e.touches[0];
      const x = touch.clientX - dragOffsetX;
      const y = touch.clientY - dragOffsetY;
      
      // Keep player within viewport bounds
      const maxX = window.innerWidth - player.offsetWidth;
      const maxY = window.innerHeight - player.offsetHeight;
      
      player.style.right = 'auto';
      player.style.bottom = 'auto';
      player.style.left = `${Math.max(0, Math.min(maxX, x))}px`;
      player.style.top = `${Math.max(0, Math.min(maxY, y))}px`;
      
      // Prevent page scrolling while dragging
      e.preventDefault();
    }
  });

  document.addEventListener('mouseup', function() {
    isDragging = false;
  });

  document.addEventListener('touchend', function() {
    isDragging = false;
  });

  // Minimize player
  minimizeBtn.addEventListener('click', function() {
    player.classList.toggle('minimized');
    minimizeBtn.textContent = player.classList.contains('minimized') ? '□' : '_';
  });

  // Make progress bar clickable for seek
  progressContainer.addEventListener('click', function(e) {
    if (audio.duration) {
      const clickPosition = (e.offsetX / this.offsetWidth);
      audio.currentTime = clickPosition * audio.duration;
      saveCurrentTime(audio.currentTime);
    }
  });

  // Touch support for progress bar
  progressContainer.addEventListener('touchstart', function(e) {
    if (audio.duration) {
      const rect = this.getBoundingClientRect();
      const touchPosition = (e.touches[0].clientX - rect.left) / rect.width;
      audio.currentTime = touchPosition * audio.duration;
      saveCurrentTime(audio.currentTime);
      e.preventDefault(); // Prevent scrolling
    }
  });

  // Load playlist
  function loadPlaylist(playlistName) {
    const playlist = playlists[playlistName];
    currentPlaylist = playlistName;
    
    // Clear playlist display
    playlistSongs.innerHTML = '';
    
    // Add songs to playlist display
    playlist.forEach((song, index) => {
      const li = document.createElement('li');
      li.className = 'playlist-item';
      li.textContent = `${song.title} - ${song.artist}`;
      
      // Add touch and click events
      function playThisTrack() {
        loadTrack(index);
        playTrack();
      }
      
      li.addEventListener('click', playThisTrack);
      li.addEventListener('touchend', function(e) {
        playThisTrack();
        e.preventDefault(); // Prevent double triggering
      });
      
      playlistSongs.appendChild(li);
    });
    
    // Enable controls if playlist has songs
    if (playlist.length > 0) {
      playBtn.disabled = false;
      prevBtn.disabled = false;
      nextBtn.disabled = false;
    } else {
      playBtn.disabled = true;
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    }
  }

  // Load track
  function loadTrack(index) {
    const playlist = playlists[currentPlaylist];
    if (index >= 0 && index < playlist.length) {
      currentTrackIndex = index;
      const track = playlist[index];
      
      // Update track info display
      trackName.textContent = track.title;
      artistName.textContent = track.artist;
      
      // Load audio
      audio.src = track.src;
      audio.load();
      
      // Update playlist highlighting
      const playlistItems = playlistSongs.querySelectorAll('.playlist-item');
      playlistItems.forEach((item, i) => {
        if (i === index) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      
      // Reset progress bar
      progressBar.style.width = '0%';
      currentTime.textContent = '0:00';
      
      // Set play button icon
      playBtn.textContent = '▶';
      isPlaying = false;
      
      // Save current track info to localStorage for cross-page persistence
      saveTrackInfo(track, index);
    }
  }

  // Play current track
  function playTrack() {
    if (currentTrackIndex >= 0) {
      // Try to resume from stored position
      const storedTime = getStoredCurrentTime();
      if (storedTime !== null) {
        try {
          audio.currentTime = parseFloat(storedTime);
        } catch (e) {
          console.warn("Could not set stored time:", e);
        }
      }
      
      audio.play().catch(error => {
        console.error("Error playing audio:", error);
        // Handle autoplay restrictions on mobile
        if (error.name === 'NotAllowedError') {
          alert("Please interact with the player to enable audio playback.");
        }
      });
      playBtn.textContent = '❚❚';
      isPlaying = true;
      
      // Update playback state in localStorage
      savePlayerState();
      broadcastPlaybackState('play');
    }
  }

  // Pause current track
  function pauseTrack() {
    audio.pause();
    playBtn.textContent = '▶';
    isPlaying = false;
    
    // Update playback state in localStorage
    savePlayerState();
    broadcastPlaybackState('pause');
  }

  // Format time in mm:ss
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Save current playback time to localStorage
  function saveCurrentTime(time) {
    try {
      localStorage.setItem('musicPlayer_currentTime', time.toString());
    } catch (e) {
      console.warn("Could not save current time:", e);
    }
  }

  // Get stored current time
  function getStoredCurrentTime() {
    return localStorage.getItem('musicPlayer_currentTime');
  }

  // Save track info to localStorage for cross-page persistence
  function saveTrackInfo(track, index) {
    try {
      const trackInfo = {
        src: track.src,
        title: track.title,
        artist: track.artist,
        index: index,
        playlist: currentPlaylist,
        timestamp: Date.now()
      };
      localStorage.setItem('musicPlayer_currentTrack', JSON.stringify(trackInfo));
    } catch (e) {
      console.warn("Could not save track info:", e);
    }
  }

  // Get stored track info
  function getStoredTrackInfo() {
    try {
      const storedInfo = localStorage.getItem('musicPlayer_currentTrack');
      return storedInfo ? JSON.parse(storedInfo) : null;
    } catch (e) {
      console.warn("Could not parse stored track info:", e);
      return null;
    }
  }

  // Broadcast playback state change to other tabs/pages
  function broadcastPlaybackState(action) {
    try {
      localStorage.setItem('musicPlayer_action', JSON.stringify({
        action: action,
        instanceId: playerInstanceId,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn("Could not broadcast playback state:", e);
    }
  }

  // Handle storage events (for cross-tab/page sync)
  function handleStorageEvent(e) {
    if (e.key === 'musicPlayer_action') {
      try {
        const data = JSON.parse(e.newValue);
        
        // Ignore events from this instance
        if (data.instanceId === playerInstanceId) return;
        
        // Process the action
        if (data.action === 'play') {
          syncPlayerState(true);
        } else if (data.action === 'pause') {
          syncPlayerState(false);
        }
      } catch (e) {
        console.warn("Could not process storage event:", e);
      }
    } else if (e.key === 'musicPlayer_currentTrack') {
      // Track changed in another tab/page
      syncCurrentTrack();
    }
  }

  // Handle page visibility changes
  function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      // When page becomes visible again, sync with current state
      syncPlayerState();
      syncCurrentTrack();
    }
  }

  // Sync player with current track from localStorage
  function syncCurrentTrack() {
    const storedTrackInfo = getStoredTrackInfo();
    if (storedTrackInfo) {
      if (currentPlaylist !== storedTrackInfo.playlist) {
        currentPlaylist = storedTrackInfo.playlist;
        playlistSelect.value = currentPlaylist;
        loadPlaylist(currentPlaylist);
      }
      
      // Only change track if we're not already playing the same one
      if (currentTrackIndex !== storedTrackInfo.index || audio.src !== storedTrackInfo.src) {
        currentTrackIndex = storedTrackInfo.index;
        
        // Update display
        trackName.textContent = storedTrackInfo.title;
        artistName.textContent = storedTrackInfo.artist;
        
        // Update playlist highlighting
        const playlistItems = playlistSongs.querySelectorAll('.playlist-item');
        playlistItems.forEach((item, i) => {
          if (i === currentTrackIndex) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
        
        // Update audio source if different
        if (audio.src !== storedTrackInfo.src) {
          audio.src = storedTrackInfo.src;
          audio.load();
        }
      }
    }
  }

  // Sync player with current playback state
  function syncPlayerState(forcePlayState = null) {
    try {
      const savedState = localStorage.getItem('musicPlayerState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // Apply saved settings
        audio.volume = state.volume || 0.8;
        audio.muted = state.muted || false;
        volumeSlider.value = audio.volume * 100;
        muteBtn.textContent = audio.muted ? '🔇' : '🔊';
        
        // Apply playback state if specified
        if (forcePlayState !== null) {
          if (forcePlayState && !isPlaying) {
            playTrack();
          } else if (!forcePlayState && isPlaying) {
            pauseTrack();
          }
        } else {
          // Use stored playback state
          if (state.isPlaying && !isPlaying) {
            playTrack();
          } else if (!state.isPlaying && isPlaying) {
            pauseTrack();
          }
        }
        
        // Apply minimized state
        if (state.minimized) {
          player.classList.add('minimized');
          minimizeBtn.textContent = '□';
        } else {
          player.classList.remove('minimized');
          minimizeBtn.textContent = '_';
        }
      }
    } catch (e) {
      console.warn("Could not sync player state:", e);
    }
  }

  // Save player state to localStorage (position, volume, playlist)
  function savePlayerState() {
    try {
      const state = {
        volume: audio.volume,
        muted: audio.muted,
        playlist: currentPlaylist,
        minimized: player.classList.contains('minimized'),
        isPlaying: isPlaying,
        currentTime: audio.currentTime,
        timestamp: Date.now()
      };
      localStorage.setItem('musicPlayerState', JSON.stringify(state));
      
      // Save current time separately for more frequent updates
      if (isPlaying && audio.currentTime > 0) {
        saveCurrentTime(audio.currentTime);
      }
    } catch (e) {
      console.warn("Could not save player state:", e);
    }
  }

  // Load player state from localStorage
  function loadPlayerState() {
    try {
      const savedState = localStorage.getItem('musicPlayerState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // Apply saved settings
        audio.volume = state.volume || 0.8;
        audio.muted = state.muted || false;
        volumeSlider.value = audio.volume * 100;
        muteBtn.textContent = audio.muted ? '🔇' : '🔊';
        
        if (state.playlist && playlists[state.playlist]) {
          currentPlaylist = state.playlist;
          playlistSelect.value = state.playlist;
        }
        
        if (state.minimized) {
          player.classList.add('minimized');
          minimizeBtn.textContent = '□';
        }
      }
      
      // Now load track info
      syncCurrentTrack();
      
      // Check if we should be playing
      const storedState = JSON.parse(localStorage.getItem('musicPlayerState') || '{}');
      if (storedState.isPlaying && currentTrackIndex >= 0) {
        // Small delay to allow audio to initialize
        setTimeout(() => {
          playTrack();
        }, 100);
      }
    } catch (e) {
      console.warn("Could not load player state:", e);
    }
  }

  // Event listeners
  playlistSelect.addEventListener('change', function() {
    loadPlaylist(this.value);
    currentTrackIndex = -1;
    trackName.textContent = 'No track selected';
    artistName.textContent = '';
    pauseTrack();
    savePlayerState();
  });

  // Add touch support for buttons
  function setupButtonEvents(btn, action) {
    btn.addEventListener('click', action);
    btn.addEventListener('touchend', function(e) {
      action();
      e.preventDefault(); // Prevent double firing
    });
  }

  setupButtonEvents(playBtn, function() {
    if (isPlaying) {
      pauseTrack();
    } else {
      if (currentTrackIndex === -1 && playlists[currentPlaylist].length > 0) {
        loadTrack(0);
      }
      playTrack();
    }
  });

  setupButtonEvents(prevBtn, function() {
    if (currentTrackIndex > 0) {
      loadTrack(currentTrackIndex - 1);
      playTrack();
    } else if (playlists[currentPlaylist].length > 0) {
      loadTrack(playlists[currentPlaylist].length - 1);
      playTrack();
    }
  });

  setupButtonEvents(nextBtn, function() {
    if (currentTrackIndex < playlists[currentPlaylist].length - 1) {
      loadTrack(currentTrackIndex + 1);
      playTrack();
    } else if (playlists[currentPlaylist].length > 0) {
      loadTrack(0);
      playTrack();
    }
  });

  setupButtonEvents(muteBtn, function() {
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? '🔇' : '🔊';
    savePlayerState();
  });

  volumeSlider.addEventListener('input', function() {
    audio.volume = this.value / 100;
    if (audio.volume === 0) {
      muteBtn.textContent = '🔇';
    } else {
      muteBtn.textContent = '🔊';
      audio.muted = false;
    }
    savePlayerState();
  });

  // Support for mobile device orientation changes
  window.addEventListener('orientationchange', function() {
    // Ensure player stays visible after orientation change
    setTimeout(function() {
      checkMobile();
    }, 300);
  });

  // Audio events
  audio.addEventListener('timeupdate', function() {
    if (audio.duration) {
      const percentage = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${percentage}%`;
      currentTime.textContent = formatTime(audio.currentTime);
      
      // Save current time every 2 seconds while playing
      if (isPlaying && Math.floor(audio.currentTime) % 2 === 0) {
        saveCurrentTime(audio.currentTime);
      }
    }
  });

  audio.addEventListener('loadedmetadata', function() {
    totalTime.textContent = formatTime(audio.duration);
    
    // Try to resume from saved position
    const storedTime = getStoredCurrentTime();
    if (storedTime !== null && !isNaN(parseFloat(storedTime))) {
      try {
        const time = parseFloat(storedTime);
        if (time > 0 && time < audio.duration) {
          audio.currentTime = time;
        }
      } catch (e) {
        console.warn("Could not set stored time:", e);
      }
    }
  });

  audio.addEventListener('ended', function() {
    if (currentTrackIndex < playlists[currentPlaylist].length - 1) {
      loadTrack(currentTrackIndex + 1);
      playTrack();
    } else {
      loadTrack(0);
      playTrack();
    }
  });

  // Save state periodically while playing
  setInterval(function() {
    if (isPlaying) {
      savePlayerState();
    }
  }, 5000);

  // Save state when browser is closed or page is refreshed
  window.addEventListener('beforeunload', savePlayerState);

  // Initialize
  loadPlayerState();
  loadPlaylist(currentPlaylist);
});