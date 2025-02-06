// ==UserScript==
// @name         Crime Syndicate Calendar Management Tool
// @namespace    https://github.com/MrEricPearson
// @version      0.3.4
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
    modal.style.display = 'none'; // Initially hidden
    modal.style.zIndex = '100001';
    modal.style.alignItems = 'center';
    modal.style.flexDirection = 'column';
    modal.style.pointerEvents = 'auto';
    modal.style.paddingTop = '5%';

    const headerWrapper = document.createElement('div');
    headerWrapper.style.width = 'calc(80% + 40px)';
    headerWrapper.style.display = 'flex';
    headerWrapper.style.alignItems = 'center';
    headerWrapper.style.justifyContent = 'space-between';
    headerWrapper.style.marginBottom = '20px';
    headerWrapper.style.padding = '0 20px';

    const backButton = document.createElement('button');
    backButton.style.backgroundColor = '#ffffff';
    backButton.style.color = '#131311';
    backButton.style.border = 'none';
    backButton.style.borderRadius = '50%';
    backButton.style.padding = '10px 10px 13px 10px';
    backButton.style.cursor = 'pointer';
    backButton.style.fontSize = '30px';
    backButton.style.lineHeight = '28px';
    const backArrowImage = document.createElement('img');
    backArrowImage.src = "https://epearson.me/faction_status_images/arrow-back.svg";
    backArrowImage.height = 18;
    backButton.appendChild(backArrowImage);

    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Faction Calendar';
    modalTitle.style.margin = '0';
    modalTitle.style.textAlign = 'center';
    modalTitle.style.flexGrow = '1';
    modalTitle.style.fontSize = '1.5em';
    modalTitle.style.fontWeight = '300';
    modalTitle.style.color = '#111612';
    modalTitle.style.marginLeft = '-50px';
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
    cardHeader.style.marginBottom = '20px';

    const cardBackButton = createBackButton();
    const monthTitle = createMonthTitle();
    const cardForwardButton = createForwardButton();

    cardHeader.appendChild(cardBackButton);
    cardHeader.appendChild(monthTitle);
    cardHeader.appendChild(cardForwardButton);

    const calendarGrid = createCalendarGrid();
    card.appendChild(calendarGrid);

    const calendarData = initializeCalendar(monthTitle, cardBackButton, cardForwardButton, calendarGrid);

    return card;
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
    monthTitle.style.flexGrow = '1';
    return monthTitle;
}

// CALENDAR: Create the back button with its styling and functionality
function createBackButton() {
    const cardBackButton = document.createElement('button');
    const cardBackArrowImage = document.createElement('img');
    cardBackButton.appendChild(cardBackArrowImage);

    cardBackArrowImage.src = "https://epearson.me/faction_status_images/arrow-back.svg";
    cardBackArrowImage.height = 12;
    cardBackButton.style.backgroundColor = '#ffffff';
    cardBackButton.style.color = '#131311';
    cardBackButton.style.border = 'none';
    cardBackButton.style.borderRadius = '50%';
    cardBackButton.style.padding = '10px 10px 12px 10px';
    cardBackButton.style.cursor = 'pointer';
    cardBackButton.style.fontSize = '20px';
    cardBackButton.style.lineHeight = '18px';

    cardBackButton.onclick = () => { modal.style.display = 'none'; };
    return cardBackButton;
}

// CALENDAR: Create the forward button with its styling and functionality
function createForwardButton() {
    const cardForwardButton = document.createElement('button');
    const cardForwardArrowImage = document.createElement('img');
    cardForwardButton.appendChild(cardForwardArrowImage);

    cardForwardArrowImage.src = "https://epearson.me/faction_status_images/arrow-forward.svg";
    cardForwardArrowImage.height = 12;
    cardForwardButton.style.backgroundColor = '#ffffff';
    cardForwardButton.style.color = '#131311';
    cardForwardButton.style.border = 'none';
    cardForwardButton.style.borderRadius = '50%';
    cardForwardButton.style.padding = '10px 10px 12px 10px';
    cardForwardButton.style.cursor = 'pointer';
    cardForwardButton.style.fontSize = '20px';
    cardForwardButton.style.lineHeight = '18px';

    return cardForwardButton;
}

// CALENDAR: Create the calendar grid for displaying days and events
function createCalendarGrid() {
    const calendarGrid = document.createElement('div');
    calendarGrid.style.display = 'grid';
    calendarGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    calendarGrid.style.gridGap = '5px';

    return calendarGrid;
}

// CALENDAR: Render the calendar days, filling in the grid and handling events
function renderCalendar(year, month, calendarGrid) {
    // Clear all event highlights from previous months
    Array.from(calendarGrid.querySelectorAll('.day.current')).forEach(dayCell => {
        dayCell.style.backgroundColor = '#eff4f1'; // Default background color
        dayCell.style.color = '#333333'; // Default text color
    });

    calendarGrid.innerHTML = ''; // Clear previous grid

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const totalCells = 42; // 6 rows * 7 days
    const days = [];

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
        const dayElem = createDayElement(d, index, year, month);
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

// CALENDAR: Create and style each day element inside the calendar grid
function createDayElement(d, index, year, month) {
    const dayElem = document.createElement('div');
    dayElem.className = `day ${d.class}`;
    dayElem.textContent = d.day;

    let cellId = null;

    // Assign unique identifier only if the day belongs to the current month
    if (d.isCurrentMonth) {
        const cellDate = new Date(year, month, d.day);
        const cellYear = cellDate.getFullYear();
        const cellMonth = String(cellDate.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
        const cellDay = String(d.day).padStart(2, '0');
        cellId = `cell-${cellYear}-${cellMonth}-${cellDay}`;
        dayElem.id = cellId;
    }

    // Apply default styles for day cells
    if (d.class === 'prev' || d.class === 'next') {
        dayElem.style.backgroundColor = '#ecf1ed';
        dayElem.style.color = '#d3d8d4';
    } else if (d.class === 'current') {
        dayElem.style.backgroundColor = '#eff4f1';
        dayElem.style.color = '#333333';
    }

    // General styles for all day elements
    dayElem.style.height = '4.5em';
    dayElem.style.display = 'block';
    dayElem.style.position = 'relative';
    dayElem.style.borderRadius = '8px';

    // Create and position the day number
    const dateNumber = document.createElement('span');
    dateNumber.textContent = d.day;
    dateNumber.style.position = 'absolute';
    dateNumber.style.bottom = '5px';
    dateNumber.style.left = '5px';

    // Clear text content to avoid duplicate numbers
    dayElem.textContent = '';
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
    const maxLayer = 3;

    validEvents.forEach((event) => {
        const startDate = parseDateAsUTC(event.event_start_date);
        const endDate = event.event_end_date ? parseDateAsUTC(event.event_end_date) : startDate;
        const eventColor = getEventColor(event.event_type); // Use the new getEventColor function
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
                eventDays.push({ cellId, objectId: eventObjectId });
            }
        }

        let eventLayer = 0;
        let conflictFound = false;

        // Check for conflicts in the event layers
        eventDays.forEach(({ cellId }) => {
            for (let layer = 0; layer <= maxLayer; layer++) {
                if (eventBarLayerMap.get(cellId + `-layer-${layer}`)) {
                    conflictFound = true;
                    break;
                }
            }
        });

        // If there's a conflict, find the next available layer
        if (conflictFound) {
            while (eventLayer <= maxLayer && eventBarLayerMap.get(eventDays[0].cellId + `-layer-${eventLayer}`)) {
                eventLayer++;
            }
        }

        // If no layer is available, exit early
        if (eventLayer > maxLayer) return;

        // Mark the layers for each event day
        eventDays.forEach(({ cellId }) => {
            eventBarLayerMap.set(cellId + `-layer-${eventLayer}`, true);
        });

        // Create event bars for each event day
        eventDays.forEach(({ cellId }, index) => {
            const eventCell = document.getElementById(cellId);
            if (!eventCell) return;

            let eventBar = document.createElement("div");
            eventBar.className = "event-bar";
            eventCell.appendChild(eventBar);

            eventBar.style.cssText = `
                height: 12px;
                position: absolute;
                bottom: ${21 + eventLayer * 13}px;
                left: 0px;
                background: ${eventColor};
                width: calc(100% + 5px);
                margin-top: 1px;
            `;

            // Special styling for the first event bar in the series
            if (index === 0) {
                if (eventCell.getAttribute("data-week-end") === "true") {
                    eventBar.style.cssText += `
                        border-top-left-radius: 12px;
                        border-bottom-left-radius: 12px;
                        width: calc(100% + 3px);
                        left: 0px;
                    `;
                } else {
                    eventBar.style.cssText += `
                        border-top-left-radius: 12px;
                        border-bottom-left-radius: 12px;
                        width: calc(100% + 3px);
                        left: 2px;
                    `;
                }
            }

            // Special styling for the last event bar in the series
            if (index === eventDays.length - 1) {
                eventBar.style.cssText += `
                    border-top-right-radius: 12px;
                    border-bottom-right-radius: 12px;
                    width: calc(100% - 2px);
                `;
            }

            // Styling for single-day events
            if (eventDays.length === 1) {
                eventBar.style.cssText += `
                    border-radius: 12px;
                    width: calc(100% - 2px);
                `;
            }

            // If it's a weekend, make the event bar span the entire width of the cell
            if (eventCell.getAttribute("data-week-end") === "true") {
                eventBar.style.width = "100%";
            }
        });
    });
}

// Create an event element for display in the modal
function createEventElement(event, isPastEvent) {
    const eventRow = document.createElement('div');
    eventRow.style.display = 'flex';
    eventRow.style.alignItems = 'center';
    eventRow.style.marginBottom = '10px';
    eventRow.style.padding = '5px 0';
    eventRow.style.borderBottom = '1px solid #ddd';

    // Placeholder icon
    const icon = document.createElement('div');
    icon.textContent = '📌'; // Placeholder for now
    icon.style.width = '30px';
    icon.style.textAlign = 'center';

    // Event details
    const details = document.createElement('div');
    details.style.flexGrow = '1';
    details.style.textAlign = 'left';

    details.innerHTML = `
        <strong>${event.event_type}</strong><br>
        ${event.event_start_date} >>> ${event.event_end_date || '??'}<br>
        ${event.event_start_time || '--:--'} >>> ${event.event_end_time || '--:--'}
    `;

    if (isPastEvent) {
        details.innerHTML += `<br><em>Completed</em>`; // Status only for past events
    } else if (event.event_status) {
        details.innerHTML += `<br><em>${event.event_status}</em>`;
    }

    eventRow.appendChild(icon);
    eventRow.appendChild(details);

    return eventRow;
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
    contentWrapper.id = 'content-wrapper';
    contentWrapper.style.width = '100%';
    contentWrapper.style.overflowY = 'auto'; // Enable vertical scrolling
    contentWrapper.style.height = 'calc(100% - ' + modal.querySelector(':scope > div').offsetHeight + 'px)'; // Occupy remaining height, compensating for header
    contentWrapper.style.display = 'flex'; // Use flexbox to center content horizontally
    contentWrapper.style.flexDirection = 'column'; // Stack children vertically
    contentWrapper.style.alignItems = 'center'; // Center content horizontally
    contentWrapper.style.padding = '10px'; // Add some padding to the content wrapper

    modal.appendChild(contentWrapper);
    contentWrapper.appendChild(card);

    // Create event list container and append it to the modal *after* the card.
    const eventListContainer = document.createElement('div');
    eventListContainer.id = 'event-list-container';
    eventListContainer.style.width = '80%'; // Make it the same width as the card
    eventListContainer.style.boxSizing = 'border-box'; // Include padding/border in width
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
    .calendar-card {
        background-color: #f4f9f5;
        color: #333;
        padding: 20px;
        border-radius: 10px;
        margin-top: 20px;
        width: 80%;
        box-sizing: border-box; /* Ensure padding doesn't increase the width */
    }

    .event-card {
        background-color: #f4f9f5;
        color: #333;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
        width: 100%;
        box-sizing: border-box; /* Ensure padding doesn't increase the width */
    }
`;
document.head.appendChild(style);

// Call the function directly
initializeCalendarTool();
