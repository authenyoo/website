// Create the style switcher container
function createStyleSwitcher() {
  // Create toggle button first (so it stays visible when panel is closed)
  const toggleButton = document.createElement('button');
  toggleButton.innerHTML = '🎨';
  toggleButton.className = 'style-switcher-toggle';
  toggleButton.style.position = 'fixed';
  toggleButton.style.top = '10px';
  toggleButton.style.right = '10px';
  toggleButton.style.zIndex = '1001';
  toggleButton.style.backgroundColor = 'var(--red)';
  toggleButton.style.color = 'var(--blue)';
  toggleButton.style.border = '2px solid var(--blue)';
  toggleButton.style.borderRadius = '50%';
  toggleButton.style.width = '40px';
  toggleButton.style.height = '40px';
  toggleButton.style.fontSize = '20px';
  toggleButton.style.cursor = 'pointer';
  document.body.appendChild(toggleButton);

  // Create main switcher panel
  const switcher = document.createElement('div');
  switcher.className = 'style-switcher';
  switcher.style.position = 'fixed';
  switcher.style.top = '60px';
  switcher.style.right = '10px';
  switcher.style.background = 'var(--red)';
  switcher.style.border = '2px solid var(--blue)';
  switcher.style.padding = '10px';
  switcher.style.zIndex = '1000';
  switcher.style.maxWidth = '150px';
  // Hide it by default
  switcher.style.display = 'none';
  
  // Add title
  const title = document.createElement('div');
  title.textContent = 'Theme Switcher';
  title.style.marginBottom = '10px';
  title.style.fontWeight = 'bold';
  switcher.appendChild(title);
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '5px';
  closeButton.style.backgroundColor = 'transparent';
  closeButton.style.border = 'none';
  closeButton.style.color = 'var(--blue)';
  closeButton.style.fontSize = '16px';
  closeButton.style.cursor = 'pointer';
  switcher.appendChild(closeButton);
  
  // Create theme options
  const themes = [
    { name: 'Default', red: '#330000', blue: '#33ffff' },
    { name: 'Monochrome', red: '#000000', blue: '#ffffff' },
    { name: 'absturztau.be', red: '#121a24', blue: '#accfe8' },
    { name: 'Fauux', red: '#000000', blue: '#d2738a' },
    { name: 'Gruvbox', red: '#282828', blue: '#a89984' },
  ];
  
  // Create buttons for each theme
  themes.forEach(theme => {
    const button = document.createElement('button');
    button.textContent = theme.name;
    button.style.display = 'block';
    button.style.width = '100%';
    button.style.margin = '5px 0';
    button.style.padding = '5px';
    button.style.backgroundColor = theme.red;
    button.style.color = theme.blue;
    button.style.border = `1px solid ${theme.blue}`;
    button.style.cursor = 'pointer';
    
    // Apply theme when clicked
    button.addEventListener('click', () => {
      document.documentElement.style.setProperty('--red', theme.red);
      document.documentElement.style.setProperty('--blue', theme.blue);
      
      // Save preference to localStorage
      localStorage.setItem('selectedTheme', JSON.stringify(theme));
    });
    
    switcher.appendChild(button);
  });
  
  // Add to document
  document.body.appendChild(switcher);
  
  // Toggle panel visibility when toggle button is clicked
  toggleButton.addEventListener('click', () => {
    if (switcher.style.display === 'none') {
      switcher.style.display = 'block';
    } else {
      switcher.style.display = 'none';
    }
  });
  
  // Close panel when close button is clicked
  closeButton.addEventListener('click', () => {
    switcher.style.display = 'none';
  });
  
  // Close panel when a theme is selected (especially helpful on mobile)
  switcher.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' && e.target !== closeButton) {
      // Give a small delay so user can see the theme change before panel closes
      setTimeout(() => {
        switcher.style.display = 'none';
      }, 300);
    }
  });
}

// Load saved theme from localStorage
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('selectedTheme');
  if (savedTheme) {
    const theme = JSON.parse(savedTheme);
    document.documentElement.style.setProperty('--red', theme.red);
    document.documentElement.style.setProperty('--blue', theme.blue);
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  createStyleSwitcher();
  loadSavedTheme();
});