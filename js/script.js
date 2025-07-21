import { kalamAppTextPairs, projectsData } from './data.js';


// Website state management
const state = {
    // List of currently open windows
    openWindows: ['kalamApp'],

    // The currently focused window
    focusedWindow: 'kalamApp',

    // Counter to manage how many windows are on top
    zIndexCounter: 2,
};


// DOM Elements
const desktop = document.querySelector('.desktop');
const taskbarButtons = {
    kalamApp: document.querySelector('#kalamTaskbarIcon'),
    projectsApp: document.querySelector('#explorerTaskbarIcon'),
    socialsApp: document.querySelector('#ieTaskbarIcon')
};
const projectListContainer = document.querySelector('.project-list');
const projectDetailsContainer = document.querySelector('.project-details-content');
const sourceButton = document.getElementById('sourceButton');
const linkButton = document.getElementById('linkButton');


/**
 * Brings specified window to top of window stack.
 * @param {HTMLElement} windowElement - The window element to bring to the top.
 * @returns {void}
 */
function bringWindowToTop(windowElement) {
    if (!windowElement) return;
    state.zIndexCounter++;
    windowElement.style.zIndex = state.zIndexCounter;
    state.focusedWindow = windowElement.id;
}

/**
 * Opens a window by its ID, bringing it to the top of the stack.
 * @param {string} windowId - The ID of the window to open.
 * @return
 */
function openWindow(windowId) {
    if (state.openWindows.includes(windowId)) {
        bringWindowToTop(document.getElementById(windowId));
        return;
    }
    const windowElement = document.getElementById(windowId);
    if (!windowElement) return;

    windowElement.classList.remove('hidden');
    state.openWindows.push(windowId);
    bringWindowToTop(windowElement);
    changeTaskbarButtonState(taskbarButtons[windowId], 'active');
}


/**
 * Closes a window by its ID, removing it from the open windows list.
 * @param {string} windowId - The ID of the window to close.
 * @return
 */
function closeWindow(windowId) {
    if (!state.openWindows.includes(windowId)) return;

    document.getElementById(windowId).classList.add('hidden');
    state.openWindows = state.openWindows.filter(w => w !== windowId);

    if (state.focusedWindow === windowId) {
        state.focusedWindow = state.openWindows[state.openWindows.length - 1] || null;
    }
    changeTaskbarButtonState(taskbarButtons[windowId], 'default');
}


/**
 * Toggles the visibility of a window by its ID. Simulates minimize/restore behavior.
 * @param {*} windowId - The ID of the window to toggle.
 * @return
 */
function toggleWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    if (!windowEl || !windowEl.classList.contains('hidden')) {
        closeWindow(windowId);
    } else {
        openWindow(windowId);
    }
}


/**
 * Changes the state of a taskbar button. Simulates behavior of active, inactive, or default states.
 * @param {*} button - The taskbar button element to change state for.
 * @param {*} state - The new state to apply ('default', 'active', 'inactive').
 * @returns 
 */
function changeTaskbarButtonState(button, state) {
    const validStates = ['default', 'active', 'inactive'];
    if (!button && !validStates.includes(state)) return;
    button.classList.remove(...validStates);
    button.classList.add(state);
}


/**
 * Populates the project list with project data.
 * @returns {void}
 */
function populateProjectList() {
    // Reset the project list container
    projectListContainer.innerHTML = '';
    projectsData.forEach((project, index) => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project';
        if (index === 0) {
            projectElement.classList.add('active');
        }
        projectElement.dataset.projectId = project.id;

        projectElement.innerHTML = `
            <img src="${project.icon}" alt="${project.name} icon">
            <p>${project.name}</p>
        `;
        projectListContainer.appendChild(projectElement);
    });
}


/**
 * Dynamically shows project details based on the selected project.
 * @param {string} projectId - The ID of the project to show details for.
 * @returns {void}
 */
function showProjectDetails(projectId) {
    // Attempt to find the project by ID
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    // Shields are small badges representing project tags
    const shields = project.tags.map(tag =>
        `<img alt="${tag}" src="https://img.shields.io/badge/${tag.replace(/\s/g, '_')}-informational?style=flat&logo=${tag.toLowerCase().replace('.','').replace(' ','')}&logoColor=white&color=282828">`
    ).join(' ');

    // Project information dynamically populated
    projectDetailsContainer.innerHTML = `
        <h1>${project.name}</h1>
        <h2><i>${project.shortDescription}</i></h2>
        <div class="projectShields">${shields}</div>
    ` 
    var mediaHtml = '';

    if (project.bannerVideo) {
        mediaHtml = `
            <div class="video-container" style="position:relative;">
            <img 
                class="projectImageDontFit" 
                src="${project.bannerPoster || ''}" 
                alt="${project.name} poster" 
                style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:1;"
            >
            <video 
                class="projectImageDontFit" 
                autoplay 
                loop 
                muted 
                playsinline
                poster="${project.bannerPoster || ''}" 
                preload="metadata"
                style="position:relative;z-index:2;"
                onplaying="this.previousElementSibling.style.display='none';"
            >
                <source src="${project.bannerVideo}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            </div>
        `;
    } else if (project.bannerImage) {
        mediaHtml = `
        <img class="projectImage" src="${project.bannerImage}" alt="${project.name} banner">
        `;
    } 

    projectDetailsContainer.innerHTML += mediaHtml || '';
    
    if (project.tldr) {
        projectDetailsContainer.innerHTML += `
        <div class="tldrContainer">
            <h2>TL;DR</h2>
            <p class="tldr">${project.tldr}</p>
        </div>
        `;
    }

    projectDetailsContainer.innerHTML += `
        ${project.details}
    `;

    // Connect data to footer buttons
    updateProjectFooterButtons(project);

    // Scroll to the top of the project details container
    projectDetailsContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


/**
 * Updates the footer buttons based on the project data.
 * Disables buttons if links are not provided.
 * @param {*} project - The project object containing source and live links.
 */
function updateProjectFooterButtons(project) {
    if (project.sourceLink) {
        sourceButton.classList.remove('disabled');
        sourceButton.onclick = () => window.open(project.sourceLink, '_blank');
    } else {
        sourceButton.classList.add('disabled');
        sourceButton.onclick = null;
    }

    if (project.liveLink) {
        linkButton.classList.remove('disabled');
        linkButton.onclick = () => window.open(project.liveLink, '_blank');
    } else {
        linkButton.classList.add('disabled');
        linkButton.onclick = null;
    }
}


/**
 * Starts the typing effect for the Kalam app title and subtitle.
 * Cycles through predefined text pairs.
 * @returns {void}
 */
function startTypingEffect() {
    const kalamTitleElement = document.getElementById("kalamTitle");
    const kalamSubtitleElement = document.getElementById("kalamSubtitle");
    if (!kalamTitleElement || !kalamSubtitleElement) return;
    
    let currentIndex = 1;
    const typingSpeed = 40;
    const pauseDuration = 2000;

    function type(element, text, callback) {
        let i = 0;
        element.innerHTML = "";
        const typeWriter = () => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, typingSpeed);
            } else if (callback) {
                callback();
            }
        };
        typeWriter();
    }

    function cycle() {
        const pair = kalamAppTextPairs[currentIndex];
        type(kalamTitleElement, pair.title, () => {
            type(kalamSubtitleElement, pair.subtitle, () => {
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % kalamAppTextPairs.length;
                    cycle();
                }, pauseDuration);
            });
        });
    }

    // Start the cycle after a short delay
    setTimeout(cycle, pauseDuration);
}


// DOM Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Start Menu Logic
    const startButton = document.querySelector('.start');
    const startMenu = document.querySelector('.start-menu');
    const startImg = document.querySelector('.start img');
    startButton.addEventListener('click', () => {
        startMenu.classList.toggle('active');
        startImg.src = startMenu.classList.contains('active') ? '/images/startClicked.webp' : '/images/startNormal.webp';
    });

    // Date and Time Display
    const dateElement = document.querySelector('#tray-date');
    const timeElement = document.querySelector('#tray-time');
    setInterval(() => {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString();
        timeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, 1000);

    // Populate project list and show first project details showing first project by default
    populateProjectList();
    showProjectDetails(projectsData[0].id);

    // Initialize the Kalam app typing effect
    startTypingEffect();

    // Event listeners for taskbar and window interactions
    document.body.addEventListener('click', (e) => {
        // Taskbar clicks
        if (e.target.closest('#kalamTaskbarIcon')) toggleWindow('kalamApp');
        if (e.target.closest('#explorerTaskbarIcon')) toggleWindow('projectsApp');
        if (e.target.closest('#ieTaskbarIcon')) toggleWindow('socialsApp');
        

        const closeButton = e.target.closest('.titlebar-button[id$="Close"]');
        if (closeButton) closeWindow(closeButton.closest('.window').id);

        const minimizeButton = e.target.closest('.titlebar-button[id$="Minimize"]');
        if (minimizeButton) closeWindow(minimizeButton.closest('.window').id);
        

        if(e.target.closest('.toggle-sidebar-btn')) {
            document.querySelector('.project-list').classList.toggle('active');
        }

        if (e.target.closest('#projectsButton')) openWindow('projectsApp');
        if (e.target.closest('#socialsButton')) openWindow('socialsApp');
    });


    // Project list click handling
    projectListContainer.addEventListener('click', (e) => {
        const projectElement = e.target.closest('.project');
        if (projectElement) {
            projectListContainer.querySelector('.active')?.classList.remove('active');
            projectElement.classList.add('active');
            showProjectDetails(projectElement.dataset.projectId);
            // Set the scroll position to the top of the project details
            

            if(window.innerWidth <= 800) {
                 projectListContainer.classList.remove('active');
            }
        }
    });

    // Window dragging logic
    desktop.addEventListener('mousedown', (e) => {
        const targetWindow = e.target.closest('.window');
        if(targetWindow) bringWindowToTop(targetWindow);

        const titlebar = e.target.closest('.titlebar');
        if (titlebar) {
            e.preventDefault(); 
            const windowEl = titlebar.closest('.window');
            let isDragging = true;
            let startX = e.clientX;
            let startY = e.clientY;
            let initialLeft = windowEl.offsetLeft;
            let initialTop = windowEl.offsetTop;

            const drag = (moveEvent) => {
                if (!isDragging) return;
                
               
                let newLeft = initialLeft + (moveEvent.clientX - startX);
                let newTop = initialTop + (moveEvent.clientY - startY);

                
                const viewportHeight = document.documentElement.clientHeight;
                const titlebarHeight = titlebar.offsetHeight;

                
                newTop = Math.max(0, newTop);
                
                newTop = Math.min(newTop, viewportHeight - titlebarHeight);


                windowEl.style.left = `${newLeft}px`;
                windowEl.style.top = `${newTop}px`;
            };

            const stopDrag = () => {
                isDragging = false;
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', stopDrag);
            };

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
        }
    });
});