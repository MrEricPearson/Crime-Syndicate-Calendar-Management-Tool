// ==UserScript==
// @name         Crime Syndicate Calendar Management Tool
// @namespace    https://github.com/MrEricPearson
// @version      0.3.71
// @description  Adds calendar management capabilities for your faction.
// @author       BeefDaddy
// @downloadURL  https://github.com/MrEricPearson/Crime-Syndicate-Calendar-Management-Tool/raw/refs/heads/main/cs-calendar-mgmt.js
// @updateURL    https://github.com/MrEricPearson/Crime-Syndicate-Calendar-Management-Tool/raw/refs/heads/main/cs-calendar-mgmt.js
// @match        https://www.torn.com/factions.php*
// @grant        none
// ==/UserScript==

 // Helper function to map event types to background colors
 const getEventColor = (eventType) => {
    const colorMap = {
        event: '#51c1b6',
        training: '#4d8dca',
        stacking: '#a5a866',
        war: '#faa31e',
        chaining: '#c79b7a',
        other: '#dde0cf'
    };

    return colorMap[eventType] || colorMap['other']; // Default to 'other' if the eventType is unknown
};

// Create the initial topBar with a button to open the modal
function createTopBar(modal) {
    const topBar = document.createElement('div');
    topBar.style.position = 'fixed';
    topBar.style.top = '0';
    topBar.style.left = '0';
    topBar.style.width = '100%';
    topBar.style.backgroundColor = '#333';
    topBar.style.color = '#fff';
    topBar.style.padding = '5px 10px';
    topBar.style.zIndex = '1000';
    topBar.style.textAlign = 'right';

    const modalButton = document.createElement('button');
    modalButton.textContent = 'Open Modal';
    modalButton.style.backgroundColor = '#007BFF';
    modalButton.style.color = '#fff';
    modalButton.style.border = 'none';
    modalButton.style.padding = '5px 10px';
    modalButton.style.marginRight = '8px';
    modalButton.style.cursor = 'pointer';
    modalButton.style.borderRadius = '5px';

    modalButton.onclick = () => {
        modal.style.display = 'flex';
    };

    topBar.appendChild(modalButton);

    modalButton.addEventListener("click", () => {
        modal.style.display = "flex";
        // Fetch data when modal is opened
        let storedCalendarData = localStorage.getItem('calendarData');
        if (storedCalendarData) {
            storedCalendarData = JSON.parse(storedCalendarData);
            const { currentYear, currentMonthIndex } = storedCalendarData;
            fetchEventData(currentYear, currentMonthIndex);
        }
    });

    return topBar;
}

// Create the modal container with header and content
function createModal() {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = '#ecf1ed';
    modal.style.color = '#fff';
    modal.style.display = 'none';
    modal.style.zIndex = '100001';
    modal.style.alignItems = 'center';
    modal.style.flexDirection = 'column';
    modal.style.pointerEvents = 'auto';
    modal.style.overflowY = 'auto';

    const headerWrapper = document.createElement('div');
    headerWrapper.style.width = '100%';
    headerWrapper.style.display = 'flex';
    headerWrapper.style.alignItems = 'center';
    headerWrapper.style.justifyContent = 'space-between';
    headerWrapper.style.position = 'relative';
    headerWrapper.style.marginBottom = '-20px';

    const backButton = document.createElement('button');
    backButton.style.position = 'absolute';
    backButton.style.left = '5%';
    backButton.style.top = '15px';
    backButton.style.backgroundColor = 'transparent'; // Make it transparent
    backButton.style.border = 'none'; // Remove border
    backButton.style.padding = '0'; // Remove padding
    backButton.style.width = '24px';
    backButton.style.height = '24px';
    backButton.style.cursor = 'pointer';
    backButton.style.display = 'flex'; // To center the image
    backButton.style.alignItems = 'center'; // Center vertically
    backButton.style.justifyContent = 'center'; // Center horizontally

    const backButtonImage = document.createElement('img');
    backButtonImage.src = 'https://epearson.me/faction_status_images/left.svg';
    backButtonImage.style.width = '12px';
    backButtonImage.style.height = '20px';

    backButton.appendChild(backButtonImage); // Append the image to the button

    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Faction Calendar';
    modalTitle.style.fontFamily = 'Arial';
    modalTitle.style.width = '100%';
    modalTitle.style.margin = '20px 0';
    modalTitle.style.textAlign = 'center';
    modalTitle.style.flexGrow = '1';
    modalTitle.style.fontSize = '1.5em';
    modalTitle.style.fontWeight = 'bold';
    modalTitle.style.color = '#3C3B52';
    modalTitle.style.zIndex = '1';

    headerWrapper.appendChild(backButton);
    headerWrapper.appendChild(modalTitle);
    modal.appendChild(headerWrapper);

    backButton.addEventListener("click", () => {
        modal.style.display = 'none';
        localStorage.removeItem("eventsData"); // Clear events data when modal is closed
    });

    const headerRoot = document.getElementById('header-root');
    if (headerRoot) {
        headerRoot.style.position = 'relative';
        headerRoot.style.marginTop = '33px';
        const topBar = createTopBar(modal);
        document.body.insertBefore(topBar, headerRoot);
    }

    return modal;
}

// Create the card component containing the calendar and toggling buttons
function createCard() {
    const card = document.createElement('div');
    card.className = 'calendar-card'; // Add a class for styling
    const cardHeader = document.createElement('div');
    card.appendChild(cardHeader);
    cardHeader.style.width = '100%';
    cardHeader.style.display = 'flex';
    cardHeader.style.alignItems = 'center';
    cardHeader.style.justifyContent = 'space-between';
    cardHeader.style.marginBottom = '5px';

    const cardBackButton = createBackButton();
    const monthTitle = createMonthTitle();
    const cardForwardButton = createForwardButton();

    // Container for the title and buttons
    const titleAndButtonsContainer = document.createElement('div');
    titleAndButtonsContainer.style.display = 'flex';
    titleAndButtonsContainer.style.width = '100%';
    titleAndButtonsContainer.style.alignItems = 'center'; // Vertically center
    titleAndButtonsContainer.style.justifyContent = 'space-between';

    titleAndButtonsContainer.appendChild(monthTitle);

    // --- Navigation and Toggle Container ---
    const navAndToggleContainer = document.createElement('div');
    navAndToggleContainer.style.display = 'flex';
    navAndToggleContainer.style.alignItems = 'center';

    // --- Week/Month Toggle ---
    const viewToggle = createViewToggle(); // Create the toggle switch
    navAndToggleContainer.appendChild(viewToggle);

    const navButtonsContainer = document.createElement('div');
    navButtonsContainer.style.display = 'flex';
    navButtonsContainer.style.alignItems = 'center'; // Vertically center
    navButtonsContainer.appendChild(cardBackButton);
    navButtonsContainer.appendChild(cardForwardButton);

    navAndToggleContainer.appendChild(navButtonsContainer); // Add nav buttons
    titleAndButtonsContainer.appendChild(navAndToggleContainer);

    cardHeader.appendChild(titleAndButtonsContainer);

    const calendarGrid = createCalendarGrid();
    card.appendChild(calendarGrid);

    const calendarData = initializeCalendar(monthTitle, cardBackButton, cardForwardButton, calendarGrid);

    return card;
}

function createViewToggle() {
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'view-toggle-container';

    const weekButton = document.createElement('button');
    weekButton.className = 'view-toggle-button view-toggle-week';
    weekButton.textContent = 'Week';
    weekButton.dataset.view = 'week';

    const monthButton = document.createElement('button');
    monthButton.className = 'view-toggle-button view-toggle-month';
    monthButton.textContent = 'Month';
    monthButton.dataset.view = 'month';

    // Initially, "Month" is selected
    monthButton.classList.add('active');

    toggleContainer.appendChild(weekButton);
    toggleContainer.appendChild(monthButton);

    // --- Add Event Listeners (with TOGGLING logic) ---
    weekButton.addEventListener('click', () => {
        if (!weekButton.classList.contains('active')) { // Only toggle if not already active
            weekButton.classList.add('active');
            monthButton.classList.remove('active');
            // Call a function to switch to week view (you'll implement this)
            switchView('week'); // You'll need to create this function
        }
    });

    monthButton.addEventListener('click', () => {
        if (!monthButton.classList.contains('active')) {
            monthButton.classList.add('active');
            weekButton.classList.remove('active');
            // Call a function to switch to month view
            switchView('month'); // You'll need to create this function
        }
    });

    return toggleContainer;
}

// (You'll need to create this function)
function switchView(viewType) {
    console.log("Switching to view:", viewType);
    // 1. Update localStorage with the selected view
    let storedCalendarData = localStorage.getItem('calendarData');
    if (storedCalendarData) {
        storedCalendarData = JSON.parse(storedCalendarData);
        storedCalendarData.currentView = viewType; // Add or update currentView
        localStorage.setItem('calendarData', JSON.stringify(storedCalendarData));
    }

    // 2. Re-render the calendar based on the selected view
    //    You'll need to modify renderCalendar and related functions
    //    to handle week vs. month views.  This is the more complex part.
    //    For now, we just update localStorage.
    const { container, monthTitle, cardBackButton, cardForwardButton, calendarGrid } = createCalendarUI();
     // Get the current date
    const now = new Date();
    let currentMonthIndex = now.getMonth();  // Get current month (0-11)
    let currentYear = now.getFullYear();     // Get current year
    renderCalendar(currentYear, currentMonthIndex, calendarGrid, viewType);
}

// In initializeCalendar, after getting currentYear and currentMonthIndex,
// check localStorage for a saved view:
// const { container, monthTitle, cardBackButton, cardForwardButton, calendarGrid } = createCalendarUI();
//     const calendarData = initializeCalendar(monthTitle, cardBackButton, cardForwardButton, calendarGrid);

function initializeCalendar(monthTitle, cardBackButton, cardForwardButton, calendarGrid) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Get the current date
    const now = new Date();
    let currentMonthIndex = now.getMonth();  // Get current month (0-11)
    let currentYear = now.getFullYear();     // Get current year

    // Check localStorage for a saved view:
    let storedCalendarData = localStorage.getItem('calendarData');
    let initialView = 'month'; // Default to month view
    if (storedCalendarData) {
        storedCalendarData = JSON.parse(storedCalendarData);
        initialView = storedCalendarData.currentView || 'month'; // Use saved view, or default
    }


    const updateCalendar = (view = initialView) => { // Pass view here
        monthTitle.textContent = `${months[currentMonthIndex]} ${currentYear}`;

        renderCalendar(currentYear, currentMonthIndex, calendarGrid, view); // Pass view here
        fetchEventData(currentYear, currentMonthIndex);
    };

    cardBackButton.addEventListener('click', () => {
        if (currentYear === 2025 && currentMonthIndex === 0) return; // Prevent going before Jan 2025
        currentMonthIndex = (currentMonthIndex === 0) ? 11 : currentMonthIndex - 1;
        if (currentMonthIndex === 11) currentYear--;
        updateCalendar(); // Use default view
    });

    cardForwardButton.addEventListener('click', () => {
        currentMonthIndex = (currentMonthIndex === 11) ? 0 : currentMonthIndex + 1;
        if (currentMonthIndex === 0) currentYear++;
        updateCalendar(); // Use default view
    });

     // Store initial calendar data in localStorage, including the view
    const initialCalendarData = { months, currentMonthIndex, currentYear, currentView: initialView };
    localStorage.setItem('calendarData', JSON.stringify(initialCalendarData));

    updateCalendar(); // Initial render, using initialView


    // Return the months array, currentMonthIndex, and currentYear
    return { months, currentMonthIndex, currentYear };
}

// CALENDAR: Parent calendar function to organize and render the entire calendar UI
function initializeCalendar(monthTitle, cardBackButton, cardForwardButton, calendarGrid) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Get the current date
    const now = new Date();
    let currentMonthIndex = now.getMonth();  // Get current month (0-11)
    let currentYear = now.getFullYear();     // Get current year

    const updateCalendar = () => {
        monthTitle.textContent = `${months[currentMonthIndex]} ${currentYear}`;
        renderCalendar(currentYear, currentMonthIndex, calendarGrid);
        fetchEventData(currentYear, currentMonthIndex);
    };

    cardBackButton.addEventListener('click', () => {
        if (currentYear === 2025 && currentMonthIndex === 0) return; // Prevent going before Jan 2025
        currentMonthIndex = (currentMonthIndex === 0) ? 11 : currentMonthIndex - 1;
        if (currentMonthIndex === 11) currentYear--;
        updateCalendar();
    });

    cardForwardButton.addEventListener('click', () => {
        currentMonthIndex = (currentMonthIndex === 11) ? 0 : currentMonthIndex + 1;
        if (currentMonthIndex === 0) currentYear++;
        updateCalendar();
    });

    updateCalendar();

    // Store initial calendar data in localStorage
    const initialCalendarData = { months, currentMonthIndex, currentYear };
    localStorage.setItem('calendarData', JSON.stringify(initialCalendarData));

    // Return the months array, currentMonthIndex, and currentYear
    return { months, currentMonthIndex, currentYear };
}

// CALENDAR: Create and initialize the UI components for the calendar
function createCalendarUI() {
    console.log("createCalendarUI() was called");

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';

    // Continue creating calendar UI elements
    const monthTitle = createMonthTitle();
    const cardBackButton = createBackButton();
    const cardForwardButton = createForwardButton();

    header.appendChild(cardBackButton);
    header.appendChild(monthTitle);
    header.appendChild(cardForwardButton);

    const calendarGrid = createCalendarGrid();
    container.appendChild(header);
    container.appendChild(calendarGrid);

    return { container, monthTitle, cardBackButton, cardForwardButton, calendarGrid };
}

// CALENDAR: Create the month title with its styling
function createMonthTitle() {
    const monthTitle = document.createElement('h3');
    monthTitle.textContent = 'January';
    monthTitle.style.margin = '0';
    monthTitle.style.textAlign = 'center';
    monthTitle.style.textAlign = 'left';
    monthTitle.style.fontFamily = 'Arial';
    monthTitle.style.fontWeight = 'bold';
    monthTitle.style.fontSize = '18px';
    return monthTitle;
}

// CALENDAR: Create the back button with its styling and functionality
function createBackButton() {
    const cardBackButton = document.createElement('button');
    const cardBackArrowImage = document.createElement('img');
    cardBackButton.appendChild(cardBackArrowImage);

    cardBackArrowImage.src = "https://epearson.me/faction_status_images/left.svg";
    cardBackArrowImage.style.width = '9px';
    cardBackArrowImage.style.height = '14px';

    cardBackButton.style.backgroundColor = '#ffffff';
    cardBackButton.style.color = '#131311';
    cardBackButton.style.border = '1px solid #E7E7E7';
    cardBackButton.style.width = '24px';
    cardBackButton.style.height = '24px';
    cardBackButton.style.padding = '4px 0';
    cardBackButton.style.margin = '0';
    cardBackButton.style.cursor = 'pointer';

    return cardBackButton;
}

// CALENDAR: Create the forward button with its styling and functionality
function createForwardButton() {
    const cardForwardButton = document.createElement('button');
    const cardForwardArrowImage = document.createElement('img');
    cardForwardButton.appendChild(cardForwardArrowImage);

    cardForwardArrowImage.src = "https://epearson.me/faction_status_images/right.svg";
    cardForwardArrowImage.style.width = '9px';
    cardForwardArrowImage.style.height = '14px';

    cardForwardButton.style.backgroundColor = '#ffffff';
    cardForwardButton.style.color = '#131311';
    cardForwardButton.style.border = '1px solid #E7E7E7';
    cardForwardButton.style.width = '24px';
    cardForwardButton.style.height = '24px';
    cardForwardButton.style.padding = '4px 0';
    cardForwardButton.style.margin = '0';
    cardForwardButton.style.cursor = 'pointer';
    cardForwardButton.style.marginLeft = '-1px';

    return cardForwardButton;
}

const dayOfWeekHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function createDayOfWeekHeaderCell(dayAbbreviation) {
    const headerCell = document.createElement('div');
    headerCell.className = 'day-header';  // Add a class for styling
    headerCell.textContent = dayAbbreviation;

    // Apply styles for centering and appearance
    headerCell.style.textAlign = 'center';
    headerCell.style.fontSize = '12px';  // Set font size as desired
    headerCell.style.height = '45px'; // Set height as desired
    headerCell.style.display = 'flex';       // Use flexbox for alignment
    headerCell.style.alignItems = 'center';  // Vertically center text
    headerCell.style.justifyContent = 'center'; // Horizontally center text

    return headerCell;
}

// CALENDAR: Create the calendar grid for displaying days and events
function createCalendarGrid() {
    const calendarGrid = document.createElement('div');
    calendarGrid.style.display = 'grid';
    calendarGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    calendarGrid.style.gridGap = '5px 5px';

    return calendarGrid;
}

// CALENDAR: Render the calendar days, filling in the grid and handling events
function renderCalendar(year, month, calendarGrid, view = 'month') { // Add view parameter
    calendarGrid.innerHTML = ''; // Clear previous grid

    // --- Week View ---
    if (view === 'week') {
        // 1. Determine the start of the week (Sunday)
        const now = new Date(year, month);
        const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek); // Go back to Sunday

        // 2. Create day headers (you might want to show dates here)
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const dayAbbreviation = dayOfWeekHeaders[i]; // S, M, T, etc.
            // You could also format the date: dayDate.toLocaleDateString(...)
            const headerCell = createDayOfWeekHeaderCell(`${dayAbbreviation}`);
            calendarGrid.appendChild(headerCell);
        }

        // 3. Create day cells for the week
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const day = dayDate.getDate();
            const d = { day: day, class: 'current', isCurrentMonth: true};
             // Capture Today Date for comparison
            const today = new Date();
            const todayYear = String(today.getUTCFullYear());
            const todayMonth = String(today.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const todayDay = String(today.getUTCDate()).padStart(2, '0');
            const dayElem = createDayElement(d, i, dayDate.getFullYear(), dayDate.getMonth(), todayYear, todayMonth, todayDay); //pass year, month
            calendarGrid.appendChild(dayElem);
        }
    }
    // --- Month View (Existing Logic) ---
     else {

        dayOfWeekHeaders.forEach(day => {
            const headerCell = createDayOfWeekHeaderCell(day);
            calendarGrid.appendChild(headerCell);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = getDaysInMonth(year, month);
        const daysInPrevMonth = getDaysInMonth(year, month - 1);

        const totalCells = 42; // 6 rows * 7 days
        const days = [];

        // Capture Today Date for comparison
        const today = new Date();
        const todayYear = String(today.getUTCFullYear());
        const todayMonth = String(today.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const todayDay = String(today.getUTCDate()).padStart(2, '0');

        // Fill previous month's overflow days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: daysInPrevMonth - i, class: 'prev', isCurrentMonth: false });
        }

        // Fill current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, class: 'current', isCurrentMonth: true });
        }

        // Fill next month's overflow days
        while (days.length < totalCells) {
            days.push({ day: days.length - daysInMonth - firstDay + 1, class: 'next', isCurrentMonth: false });
        }

        let currentWeekStart = null;

        days.forEach((d, index) => {
            const dayElem = createDayElement(d, index, year, month, todayYear, todayMonth, todayDay);
            calendarGrid.appendChild(dayElem);

            // Logic to identify week boundaries only for current month days
            if (d.isCurrentMonth && index % 7 === 0) {
                // Start of a new week
                if (currentWeekStart !== null) {
                    // Mark the end of the previous week (Saturday, which is index - 1)
                    const prevDayElem = calendarGrid.children[index - 1];
                    if (!prevDayElem.classList.contains('prev') && !prevDayElem.classList.contains('next')) {
                        prevDayElem.setAttribute("data-week-end", "true");
                    }
                }
                // Mark the start of this week
                currentWeekStart = dayElem;
                currentWeekStart.setAttribute("data-week-start", "true");
            }

            // Detect and label the start of the month only if it's part of the current month
            if (d.day === 1 && d.isCurrentMonth) {
                dayElem.setAttribute("data-month-start", "true");
            }

            // Detect and label the end of the month only if it's part of the current month
            if (d.day === daysInMonth && d.isCurrentMonth) {
                dayElem.setAttribute("data-month-end", "true");
            }
        });
    }
}

// CALENDAR: Create and style each day element inside the calendar grid
function createDayElement(d, index, year, month, todayYear, todayMonth, todayDay) {
    const dayElem = document.createElement('div');
    dayElem.className = `day ${d.class}`;

    let cellId = null;

    // Assign unique identifier only if the day belongs to the current month
    if (d.isCurrentMonth) {
        const cellDate = new Date(year, month, d.day);
        const cellYear = String(year);
        const cellMonth = String(month + 1).padStart(2, '0');
        const cellDay = String(d.day).padStart(2, '0');
        cellId = `cell-${cellYear}-${cellMonth}-${cellDay}`;
        dayElem.id = cellId;

        // Check if it's today's date
        const isToday = (
            cellYear === todayYear &&
            cellMonth === todayMonth &&
            cellDay === todayDay
        );

        if (isToday) {
            dayElem.classList.add('today');  // Add the 'today' class
        }
    }

    // Apply default styles for day cells
    if (d.class === 'prev' || d.class === 'next') {
        dayElem.style.backgroundColor = 'transparent';
        dayElem.style.color = '#DDDFE7';
    } else if (d.class === 'current') {
        dayElem.style.backgroundColor = 'transparent'; // No Background
        dayElem.style.color = '#6C6D71';
    }

    // Create and position the day number
    const dateNumber = document.createElement('span');
    dateNumber.textContent = d.day;
    dateNumber.className = 'date-number';

    // Clear text content to avoid duplicate numbers
    dayElem.innerHTML = '';
    dayElem.appendChild(dateNumber);

    return dayElem;
}

// CALENDAR: Function to get the number of days in a given month
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

// Helper fucntion to reformat date string to UTC
const parseDateAsUTC = (dateString) => {
    const dateParts = dateString.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    return new Date(Date.UTC(year, month, day));
}

// Fetch and process data using PDA_httpGet
async function fetchEventData(targetYear, targetMonthIndex) {
    try {
        const storedEvents = localStorage.getItem("eventsData"); // Check if events data is stored in localStorage

        if (storedEvents) {
            // If events data is found in localStorage, use it
            const events = JSON.parse(storedEvents);
            processEvents(events, targetYear, targetMonthIndex); // Pass targetYear and targetMonthIndex
        } else {
            // If no data is found, make the API request
            const endpoint = "https://epearson.me:3000/api/twisted-minds/calendar";

            // Make GET request using PDA_httpGet
            const response = await PDA_httpGet(endpoint);

            // Validate response structure
            if (!response || typeof response !== "object") {
                console.log("Error: Invalid response from PDA_httpGet.", true);
                return;
            }

            // Parse response content
            const status = response.status;
            const statusText = response.statusText;
            const responseText = response.responseText;

            if (status !== 200) {
                console.log(`Error: Received status ${status} - ${statusText}`);
                return;
            }

            let jsonResponse;
            try {
                jsonResponse = JSON.parse(responseText);
            } catch (e) {
                return;
            }

            const events = jsonResponse.events || [];

            // Store the fetched events in localStorage for future use
            localStorage.setItem("eventsData", JSON.stringify(events));

            // Process events
            processEvents(events, targetYear, targetMonthIndex);
        }
    } catch (error) {
        console.log(`Fetch Error: ${error.message}`, true);
    }
}

// Process and display the events
function processEvents(events, currentYear, currentMonthIndex) {
    // Get the months array from localStorage
    const storedCalendarData = localStorage.getItem('calendarData');
    let months;
    if (storedCalendarData) {
        months = JSON.parse(storedCalendarData).months;
    } else {
        // Define the months array here if not found in localStorage
        months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    }

    // Ensure selectedMonth is set correctly
    let selectedMonth; // Declare selectedMonth outside the if block
    if (months && currentMonthIndex >= 0 && currentMonthIndex < months.length) {
        selectedMonth = months[currentMonthIndex];
    } else {
        selectedMonth = 'Unknown';  // Or some other default value
    }

    // Filter out invalid events
    const validEvents = events.filter((event) => {
        if (!event || !event.event_start_date || !event.event_type) {
            return false;
        }

        const eventStartDate = parseDateAsUTC(event.event_start_date);  // Convert to UTC
        const eventEndDate = event.event_end_date ? parseDateAsUTC(event.event_end_date) : eventStartDate;  // Convert to UTC

        const validYear = eventStartDate.getUTCFullYear() === currentYear;
        const validMonth = eventStartDate.getUTCMonth() === currentMonthIndex;
        const validType = ["event", "training", "stacking", "war", "chaining", "other"].includes(event.event_type);

        return validYear && validMonth && validType;
    });

    // If no valid events, return early
    if (validEvents.length === 0) {
        console.log(`No events found for ${selectedMonth} ${currentYear}`);
        const messageContainer = document.getElementById("event-message-container");
        if (messageContainer) {
            messageContainer.innerHTML = `No events found for ${selectedMonth} ${currentYear}`;
        }

        // Update event list container to display message
        const eventListContainer = document.getElementById('event-list-container');
        if (eventListContainer) {
            eventListContainer.innerHTML = `<p>No events found for ${selectedMonth || 'Unknown'} ${currentYear || 'Unknown'}</p>`;
        }
        return;
    }

    // Separate past and upcoming events
    const now = new Date();
    const upcomingEvents = [];
    const pastEvents = [];

    validEvents.forEach(event => {
        const startDate = parseDateAsUTC(event.event_start_date);
        const endDate = event.event_end_date ? parseDateAsUTC(event.event_end_date) : startDate;

        if (endDate < now) {
            pastEvents.push(event);
        } else {
            upcomingEvents.push(event);
        }
    });

    // Render events in the list
    const eventListContainer = document.getElementById('event-list-container');
    if (eventListContainer) {
        eventListContainer.innerHTML = ''; // Clear existing events
        [...upcomingEvents, ...pastEvents].forEach(event => {
            // Wrap each eventRow in a card-like div
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card'; // Use a class for consistent styling

            const eventElement = createEventElement(event, pastEvents.includes(event));
            eventCard.appendChild(eventElement);
            eventListContainer.appendChild(eventCard);
        });
    }

    // Sort valid events by start date
    validEvents.sort((a, b) => {
        const dateA = new Date(a.event_start_date);
        const dateB = new Date(b.event_start_date);
        return dateA - dateB; // Sort in ascending order (earliest first)
    });

    const eventBarLayerMap = new Map();

    validEvents.forEach((event) => {
        const startDate = parseDateAsUTC(event.event_start_date);
        const endDate = event.event_end_date ? parseDateAsUTC(event.event_end_date) : startDate;
        const eventColor = getEventColor(event.event_type);
        const eventObjectId = event._id;

        let eventDays = [];

        // Loop through the event days
        for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
            const year = d.getUTCFullYear();
            const month = d.getUTCMonth();
            const day = d.getUTCDate();

            if (year === currentYear && month === currentMonthIndex) {
                const formattedMonth = String(month + 1).padStart(2, "0");
                const formattedDay = String(day).padStart(2, "0");
                const cellId = `cell-${year}-${formattedMonth}-${formattedDay}`;
                eventDays.push({ cellId, objectId: eventObjectId, eventColor: eventColor }); // Store eventColor for easy access
            }
        }

        // Create event bars for each event day (now circles)
        eventDays.forEach(({ cellId, objectId, eventColor }) => {
            const eventCell = document.getElementById(cellId);
            if (!eventCell) return;

            // Create container for event circles
            let eventContainer = eventCell.querySelector('.event-container');
            if (!eventContainer) {
                eventContainer = document.createElement('div');
                eventContainer.className = 'event-container';

                //Center the EventContainer within the dayCell
                eventContainer.style.display = 'flex';
                eventContainer.style.justifyContent = 'center';
                eventContainer.style.alignItems = 'center';
                eventContainer.style.marginTop = '8px'; // Distance below the day number
                eventContainer.style.gap = '3px'; //Space inbetween

                eventCell.appendChild(eventContainer);
            }

            // Limit to a max of 3 event circles
            if (eventContainer.children.length >= 3) return;

            // Create the event circle element
            let eventCircle = document.createElement("div");
            eventCircle.className = "event-circle";
            eventCircle.style.cssText = `
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${eventColor};
                display: inline-block;
            `;

            eventContainer.appendChild(eventCircle);
        });
    });
}

// Create an event element for display in the modal
function createEventElement(event, isPastEvent) {
    const eventRow = document.createElement('div');
    eventRow.className = 'event-row';
    eventRow.style.display = 'flex'; // Now eventRow is the flex container
    eventRow.style.flexDirection = 'column'; // Stack rows vertically

    // --- First Row (Icon, Details, Toggle Button) ---
    const firstRow = document.createElement('div');
    firstRow.style.display = 'flex'; // Three columns
    firstRow.style.alignItems = 'center'; // Vertically align items in the first row
    firstRow.style.width = '100%';

    // 1. Icon
    const icon = document.createElement('div');
    icon.className = 'event-icon';
    icon.style.backgroundColor = getEventColor(event.event_type);
    icon.style.height = '46px';
    icon.style.width = '6px';
    firstRow.appendChild(icon);

    // 2. Details Wrapper (Contains Title Row and Date Line)
    const detailsWrapper = document.createElement('div');
    detailsWrapper.className = 'event-details-wrapper'; // New class
    detailsWrapper.style.flexGrow = '1'; // Take up remaining space
    detailsWrapper.style.display = 'flex';
    detailsWrapper.style.flexDirection = 'column';
    detailsWrapper.style.width = 'calc(100% - 61px)';


    // Event Title Row
    const titleRow = document.createElement('div');
    titleRow.className = 'event-title-row';
    titleRow.style.display = 'flex'; // Keep for horizontal alignment
    titleRow.style.alignItems = 'center';
    titleRow.style.height = '46px'; // Maintain consistent height

    const titleAndTypeContainer = document.createElement('div');
    titleAndTypeContainer.style.display = 'flex';
    titleAndTypeContainer.style.alignItems = 'center';

    const eventTitleSpan = document.createElement('span');
    eventTitleSpan.className = 'event-title';
    eventTitleSpan.textContent = event.event_title;
    titleAndTypeContainer.appendChild(eventTitleSpan);

    const eventTypeSpan = document.createElement('span');
    eventTypeSpan.className = 'event-type';
    eventTypeSpan.textContent = `(${event.event_type})`;
    titleAndTypeContainer.appendChild(eventTypeSpan);

    titleRow.appendChild(titleAndTypeContainer);
    detailsWrapper.appendChild(titleRow); // Add titleRow to detailsWrapper

    // Date Line Row
    const dateLineRow = document.createElement('div');
    dateLineRow.className = 'date-line';
    dateLineRow.style.marginTop = '5px';

    const calendarIcon = document.createElement('img');
    calendarIcon.src = 'https://epearson.me/faction_status_images/event_calendar.svg';
    calendarIcon.width = 12;
    calendarIcon.height = 15;
    dateLineRow.appendChild(calendarIcon);

    const startDateSpan = document.createElement('span');
    startDateSpan.className = 'start-date-details';
    startDateSpan.textContent = new Date(event.event_start_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    dateLineRow.appendChild(startDateSpan);

    if (isPastEvent || event.event_status) {
        const statusSpan = document.createElement('span');
        statusSpan.className = 'status-box';
        const statusDot = document.createElement('span');
        statusDot.className = 'status-dot';
        statusDot.style.backgroundColor = isPastEvent ? '#5ED8C1' : '#D8C25E';
        statusSpan.appendChild(statusDot);
        const statusMessageSpan = document.createElement('span');
        statusMessageSpan.className = 'status-message-details';
        statusMessageSpan.textContent = isPastEvent ? 'Completed' : 'Upcoming Event';
        statusSpan.appendChild(statusMessageSpan);
        dateLineRow.appendChild(statusSpan);
    }

    detailsWrapper.appendChild(dateLineRow); // Add dateLineRow to detailsWrapper
    firstRow.appendChild(detailsWrapper);

    // 3. Toggle Button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'event-toggle-button';
    const toggleImg = document.createElement('img');
    toggleImg.src = 'https://epearson.me/faction_status_images/dropdown-more.svg';
    toggleImg.width = 17;
    toggleImg.height = 21;
    toggleButton.appendChild(toggleImg);

    // Add the click event listener
    toggleButton.addEventListener('touchstart', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isHidden = actionsRow.style.display === 'none';
        actionsRow.style.display = isHidden ? 'flex' : 'none';
        separator.style.display = isHidden ? 'block' : 'none';
        toggleImg.src = isHidden ? 'https://epearson.me/faction_status_images/dropdown-more-open.svg' : 'https://epearson.me/faction_status_images/dropdown-more.svg';
        toggleButton.style.backgroundColor = isHidden ? '#E7E7E7' : 'transparent';
    });

    firstRow.appendChild(toggleButton); // Add toggleButton to firstRow
    eventRow.appendChild(firstRow); // Add firstRow to eventRow

    // --- Separator (Second Row) ---
    const separator = document.createElement('hr');
    separator.className = 'event-separator';
    separator.style.border = 'none';
    separator.style.borderTop = '1px solid #E7E7E7';
    separator.style.margin = '8px 0';
    separator.style.display = 'none'; // Initially hidden
    eventRow.appendChild(separator); // Add to eventRow

    // --- Actions Row (Third Row) ---
    const actionsRow = document.createElement('div');
    actionsRow.className = 'event-actions-row';
    actionsRow.style.marginTop = '8px';
    actionsRow.style.display = 'none'; // Initially hidden

    const viewButton = createActionButton('View', 'view', event);
    const editButton = createActionButton('Edit', 'edit', event);
    const deleteButton = createActionButton('Delete', 'delete', event);

    actionsRow.appendChild(viewButton);
    actionsRow.appendChild(editButton);
    actionsRow.appendChild(deleteButton);
    eventRow.appendChild(actionsRow); // Add to eventRow

    return eventRow;
}

// Helper function (no changes needed)
function createActionButton(text, actionType, event) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `event-action-button event-action-${actionType}`;

    button.style.backgroundColor = actionType === 'delete' ? '#ff6961' : '#f0f0f0';
    button.style.color = actionType === 'delete' ? '#fff' : '#333';
    button.style.border = '1px solid #ccc';
    button.style.padding = '4px 8px';
    button.style.marginRight = '8px';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '0.8em';

    button.addEventListener('click', () => {
        console.log(`${text} clicked for event:`, event);
    });

    return button;
}

// Helper function (no changes)
function createActionButton(text, actionType, event) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = `event-action-button event-action-${actionType}`;

    button.style.backgroundColor = actionType === 'delete' ? '#ff6961' : '#f0f0f0';
    button.style.color = actionType === 'delete' ? '#fff' : '#333';
    button.style.border = '1px solid #ccc';
    button.style.padding = '4px 8px';
    button.style.marginRight = '8px';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '0.8em';

    button.addEventListener('click', () => {
        console.log(`${text} clicked for event:`, event);
    });

    return button;
}

function formatTime(time) {
    if (!time) return '--:--';
    let [hours, minutes] = time.split(':');
    let period = 'am';
    hours = parseInt(hours);
    if (hours >= 12) {
        period = 'pm';
        if (hours > 12) {
            hours -= 12;
        }
    }
    if (hours === 0) {
        hours = 12;
    }
    return `${hours}:${minutes}${period}`;
}

// Initialize the calendar tool when the page is loaded
function initializeCalendarTool() {
    const modal = createModal();
    const topBar = createTopBar(modal);
    const card = createCard(); // No longer needs modal as param

    document.body.appendChild(topBar);
    document.body.appendChild(modal);

    //Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.id = 'content-wrapper-container';
    contentWrapper.style.width = '100%';
    contentWrapper.style.display = 'flex';
    contentWrapper.style.flexDirection = 'column';
    contentWrapper.style.alignItems = 'center';

    // Create Events Header
    const eventsHeader = document.createElement('h2');
    eventsHeader.textContent = 'Events';
    eventsHeader.style.fontFamily = 'Arial';
    eventsHeader.style.margin = '5px 1px 10px 1px';
    eventsHeader.style.textAlign = 'left';
    eventsHeader.style.fontSize = '1.5em';
    eventsHeader.style.color = '#3C3B52';
    eventsHeader.style.width = '94%'; // Take full width

    modal.appendChild(card);

    // Create event list container and append it to the modal *after* the card.
    const eventListContainer = document.createElement('div');
    eventListContainer.id = 'event-list-container';
    eventListContainer.style.width = '94%';
    eventListContainer.style.boxSizing = 'border-box';

    contentWrapper.appendChild(eventsHeader);
    modal.appendChild(contentWrapper);
    contentWrapper.appendChild(eventListContainer);

    // Initial calendar data retrieval from localStorage
    let storedCalendarData = localStorage.getItem('calendarData');
    if (storedCalendarData) {
        storedCalendarData = JSON.parse(storedCalendarData);
        const { months, currentMonthIndex, currentYear } = storedCalendarData;

        // Call fetchEventData directly with the stored year and month
        fetchEventData(currentYear, currentMonthIndex);
    } else {
        // If no data is found in localStorage, fetch data for the current month/year
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthIndex = now.getMonth();

        fetchEventData(currentYear, currentMonthIndex);
    }
}

//Add these styles to the bottom
const style = document.createElement('style');
style.textContent = `
    .top-bar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: #333;
        color: #fff;
        padding: 5px 10px;
        z-index: 1000;
        text-align: right;
    }

    .modal-button {
        background-color: #007BFF;
        color: #fff;
        border: none;
        padding: 5px 10px;
        margin-right: 8px;
        cursor: pointer;
        border-radius: 5px;
    }

    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #ecf1ed;
        color: #fff;
        display: none;
        z-index: 100001;
        align-items: center;
        flex-direction: column;
        pointer-events: auto;
        padding-top: 5%;
        font-family: Arial;
    }

    .header-wrapper {
        width: calc(80% + 40px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding: 0 20px;
    }

    .back-button {
        background-color: #ffffff;
        color: #131311;
        border: none;
        border-radius: 50%;
        padding: 10px 10px 13px 10px;
        cursor: pointer;
        font-size: 30px;
        line-height: 28px;
    }

    .modal-title {
        margin: 0;
        text-align: center;
        flex-grow: 1;
        font-size: 1.5em;
        font-weight: 300;
        color: #111612;
        margin-left: -50px;
        z-index: 1;
    }

    .header-root {
        position: relative;
        margin-top: 33px;
    }

    .calendar-card {
        background-color: #FFFFFF;
        color: #3C3B52;
        padding: 20px;
        border: 1px solid #E7E7E7;
        border-radius: 10px;
        margin: 20px 0;
        width: 94%;
        box-sizing: border-box;
        font-family: Arial;
    }

     .card-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 5px;
    }

    .view-toggle-container {
        display: flex;
        background-color: #F1EEEE; /* Background of the entire toggle */
        border: 1px solid #E7E7E7;
        border-radius: 6px; /* Rounded corners for the container */
        padding: 2px; /* Inner padding */
        margin-right: 5px;
    }

    .view-toggle-button {
        background-color: transparent; /* Initially transparent */
        border: none;
        padding: 4px 12px;
        border-radius: 4px; /* Rounded corners for buttons */
        cursor: pointer;
        font-family: Arial, sans-serif;
        font-size: 0.8em;
        color: #6C6D71;
        flex: 1; /* Make buttons take equal width */
        display: flex; /* Use flexbox for centering */
        justify-content: center; /* Center horizontally */
        align-items: center; /* Center vertically */
        transition: background-color 0.2s ease; /* Smooth transition */
    }

    .view-toggle-button.active {
        background-color: #fff; /* White background for active button */
        color: #333;
    }

    .card-back-button {
        background-color: #ffffff;
        color: #131311;
        border: none;
        border-radius: 50%;
        padding: 10px 10px 12px 10px;
        cursor: pointer;
        font-size: 20px;
        line-height: 18px;
    }

    .card-forward-button {
        background-color: #ffffff;
        color: #131311;
        border: none;
        border-radius: 50%;
        padding: 10px 10px 12px 10px;
        cursor: pointer;
        font-size: 20px;
        line-height: 18px;
    }

    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-gap: 5px 5px;
    }

    .content-wrapper-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        box-sizing: border-box;
    }

    .event-container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 4px;
        gap: 4px;
    }

    .event-circle {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
    }

    .event-list-container {
        width: 94%;
        box-sizing: border-box;
    }

    .day {
        color: #6C6D71;
        height: 60px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        border-radius: 33px;
        margin-bottom: 2px;
    }

    .today {
        background-color: #F6FAFB !important;
        border-color: #F6FAFB;
    }

    .day .date-number {
        margin: 12px 0;
    }

    .event-card {
        background-color: #FFFFFF;
        color: #333;
        padding: 5px 10px;
        border-radius: 10px;
        margin-bottom: 10px;
        width: 100%;
        box-sizing: border-box;
    }

    .event-row {
        display: flex;
        align-items: center;
        padding: 5px 0;
    }

    .event-icon {
        width: 6px;
        height: 46px;
        text-align: center;
        margin-right: 15px;
        margin-left: 1px;
    }

    .event-details {
        flex-grow: 1;
        text-align: left;
        padding-top: 2px;
        width: calc(100% - 61px)
    }

    .date-line {
        color: #ABADB2;
        display: flex;
        font-size: 12px;
        font-family: Arial;
        margin-top: 5px;
        line-height: 17px;
    }

    .date-line span {
        white-space: nowrap;
        display: inline-block;
        vertical-align: middle;
    }

    .arrow-separator {
        margin: 0 10px;
        opacity: 0.5;
        vertical-align: middle;
    }

    .time-line {
        font-size: 12px;
        color: #797977;
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
    }

    .status-dot {
        height: 14px;
        width: 14px;
        background-color: #2ecc71; /* Example color */
        border-radius: 50%;
        display: inline-block;
        margin-right: 5px;
        margin-left: 10px;
        vertical-align: middle;
    }

    .clock-icon {
        width: 12px; /* Adjust size as needed */
        height: 12px;
        margin-right: 5px;
        vertical-align: middle;
    }

    .event-details {
        width: 90%
    }

    .event-title {
        font-family: Arial;
        font-size: 16px;
        font-weight: bold;
        margin-right: 5px;
        display: inline-block;
        margin-bottom: 2px;
    }

    .event-type {
        font-size: 12px;
        color: #ABADB2;
        vertical-align: middle; /* Visually center with event-title */
        display: inline-block;  /* Keep it inline */
        margin-top: -3px;
        margin-left: 3px;
    }

    .date-line img {
        width: 12px;
        height: 15px;
        margin-right: 5px;
        vertical-align: middle;
        display: inline-block;
        margin-top: 1px;
    }

    .date-line > * {
        display: inline-block;
        vertical-align: middle;
    }

    .status-box {
        font-size: 12px;
        color: #ABADB2;
        font-family: Arial;
        display: inline-block;
        vertical-align: middle;
    }

    .event-toggle-button {
        width: 45px;
        height: 45px;
        border-radius: 6px;
        border: 1px solid #E7E7E7;
        background-color: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .event-actions-row {
        display: flex;
    }

    .event-action-button {
        margin-right: 8px;
    }

    .event-action-view {}
    .event-action-edit {}
    .event-action-delete {}
`;
document.head.appendChild(style);

// Call the function directly
initializeCalendarTool();
