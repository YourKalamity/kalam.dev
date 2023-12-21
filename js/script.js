document.addEventListener('DOMContentLoaded', function () {
    // Get references to the start button and start menu
    const startButton = document.querySelector('.start');
    const startMenu = document.querySelector('.start-menu');

    // Add a click event listener to the start button
    startButton.addEventListener('click', function () {
        // Toggle the "active" class on the start menu
        startMenu.classList.toggle('active');
    });
});
