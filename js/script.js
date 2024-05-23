// array to hold currently opened windows
let openWindows = ['kalamApp'];

// variable to hold the currently focused window
let focusedWindow = null;

// possible windows to open
const windows = ['kalamApp', 'projectsApp', 'socialsApp'];

// map of window names to their taskbar buttons
const taskbarButtons = {
    kalamApp: document.querySelector('#kalamTaskbarIcon'),
    projectsApp: document.querySelector('#explorerTaskbarIcon'),
    socialsApp: document.querySelector('#ieTaskbarIcon')
}

// function to open a window
function openWindow(windowName) {
    // if the window is already open, return
    if (openWindows.includes(windowName)) return;

    // get the window element
    const window = document.querySelector(`.${windowName}`);

    // remove the hidden attribute
    window.removeAttribute('hidden');

    // add the window to the openWindows array
    openWindows.push(windowName);

    // set the window to the focused window
    focusedWindow = windowName;

    // change the taskbar button state to active
    changeTaskbarButtonState(taskbarButtons[windowName], 'active');
}

// function to close a window
function closeWindow(windowName) {
    // if the window is not open, return
    if (!openWindows.includes(windowName)) return;

    // get the window element
    const window = document.querySelector(`.${windowName}`);

    // add the hidden attribute
    window.setAttribute('hidden', '');

    // remove the window from the openWindows array
    openWindows.splice(openWindows.indexOf(windowName), 1);

    // if the window is the focused window, set the last window in the openWindows array to the focused window
    if (focusedWindow === windowName) {
        focusedWindow = openWindows[openWindows.length - 1];
    }

    // change the taskbar button state to inactive
    changeTaskbarButtonState(taskbarButtons[windowName], 'inactive');
}

// function to toggle a window
function toggleWindow(windowName) { 
    // if the window is open, close it
    if (openWindows.includes(windowName)) {
        closeWindow(windowName);
    } else {
        // otherwise, open it
        openWindow(windowName);
    }
}

// function to change taskbar button state
function changeTaskbarButtonState(button, state) {
    let allowedStates = ['default', 'active', 'inactive'];

    // if the state is not allowed, return
    if (!allowedStates.includes(state)) return;

    // remove all states from the button
    button.classList.remove(...allowedStates);

    // add the state to the button
    button.classList.add(state);
}

document.addEventListener('DOMContentLoaded', function () {
    // Get references to the start button and start menu
    const startButton = document.querySelector('.start');
    const startMenu = document.querySelector('.start-menu');

    // Get reference to the image element
    const startImg = document.querySelector('.start img');

    // Add a click event listener to the start button
    startButton.addEventListener('click', function () {
        // Toggle the "active" class on the start menu
        startMenu.classList.toggle('active');

        // Change the img src based on the startMenu's active state
        if (startMenu.classList.contains('active')) {
            startImg.src = '/images/startClicked.webp';
        } else {
            startImg.src = '/images/startNormal.webp';
        }
    });

    // Add a mouseover event listener to the start button
    startButton.addEventListener('mouseover', function () {
        // Change the img src to /images/startHover.webp when not active
        if (!startMenu.classList.contains('active')) {
            startImg.src = '/images/startHover.webp';
        }
    });

    // Add a mouseout event listener to the start button
    startButton.addEventListener('mouseout', function () {
        // Change the img src back to /images/startNormal.webp when not active
        if (!startMenu.classList.contains('active')) {
            startImg.src = '/images/startNormal.webp';
        }
    });


    // Add listeners to the taskbar application buttons
    document.querySelector('#kalamTaskbarIcon').addEventListener('click', function () {
        toggleWindow('kalamApp');
    });

    // Get date and time elements and update them every second
    const dateElement   = document.querySelector('#tray-date');
    const timeElement   = document.querySelector('#tray-time');
    let   semiColonFlag = true;

    setInterval(function () {
        const date = new Date();

        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const hour = date.getHours();
        const minute = date.getMinutes();

        dateElement.textContent = `${day}/${month}/${year}`;

        // Convert the hour to 12 hour format and add AM/PM to the end
        let hour12 = hour % 12;
        if (hour12 === 0) hour12 = 12;
        const ampm = hour < 12 ? 'AM' : 'PM';

        // Add leading zeros to the minute if it is less than 10
        const minuteStr = minute < 10 ? `0${minute}` : minute;

        const colon = semiColonFlag ? ':' : ' ';
        semiColonFlag = !semiColonFlag;

        timeElement.textContent = `${hour12}${colon}${minuteStr} ${ampm}`;
    }, 1000);

});


// Kalam App Script
const kalamAppTextPairs = [
    { title: "Software Developer", subtitle: "Projects available by clicking below" },
    { title: "Computer Science Student", subtitle: "Placement Year @ Aston University" },
    { title: "Open Source Contributor", subtitle: "Active contributor to Open Source Projects"},
    { title: "Technology Enthusiast", subtitle: "Constantly exploring new technologies and programming languages"},
    { title: "Community Founder", subtitle: "Leading a vibrant online community of nearly 200 members"},
    { title: "Retail Professional", subtitle: "Experienced in sales, buying and customer service"},
    { title: "Linux Server Administrator", subtitle: "Proficient in managing and configuring Linux for projects"},
    { title: "Electronics Troubleshooter", subtitle: "Skilled at repairing various electronic devices"},
    { title: "Aspiring Software Engineer", subtitle: "Due to start placement @ Blueberry Consultants"},
  ];
  
  let currentKalamAppIndex = 0;
  const kalamTitleElement = document.getElementById("kalamTitle");
  const kalamSubtitleElement = document.getElementById("kalamSubtitle");
  const typingSpeed = 40; // Adjust the typing speed (in milliseconds)
  const pauseDuration = 1000; // Pause duration (in milliseconds)
  
  function typeText(element, text, callback) {
    let i = 0;
    element.innerHTML = "";
    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, typingSpeed);
      } else {
        callback();
      }
    }
    type();
  }
  
  function deleteText(element, callback) {
    let text = element.innerText;
    let i = text.length;
    function del() {
      if (i > 0) {
        element.innerText = text.substring(0, i - 1);
        i--;
        setTimeout(del, typingSpeed);
      } else {
        callback();
      }
    }
    del();
  }
  
  function cycleText() {
    const { title, subtitle } = kalamAppTextPairs[currentKalamAppIndex];
    let titleIndex = 0;
    let subtitleIndex = 0;
  
    function typeTexts() {
      if (titleIndex < title.length || subtitleIndex < subtitle.length) {
        if (titleIndex < title.length) {
          kalamTitleElement.innerHTML += title.charAt(titleIndex);
          titleIndex++;
        }
        if (subtitleIndex < subtitle.length) {
          kalamSubtitleElement.innerHTML += subtitle.charAt(subtitleIndex);
          subtitleIndex++;
        }
        setTimeout(typeTexts, typingSpeed);
      } else { 
        setTimeout(deleteTexts, pauseDuration);
      }
    }
  
    function deleteTexts() {
      if (titleIndex > 0 || subtitleIndex > 0) {
        if (titleIndex > 0) {
          kalamTitleElement.innerText = title.substring(0, titleIndex - 1);
          titleIndex--;
        }
        if (subtitleIndex > 0) {
          kalamSubtitleElement.innerText = subtitle.substring(0, subtitleIndex - 1);
          subtitleIndex--;
        }
        setTimeout(deleteTexts, typingSpeed);
      } else {
        currentKalamAppIndex = (currentKalamAppIndex + 1) % kalamAppTextPairs.length;
        setTimeout(cycleText, pauseDuration);
      }
    }
  
    typeTexts();
  }
  
  cycleText();