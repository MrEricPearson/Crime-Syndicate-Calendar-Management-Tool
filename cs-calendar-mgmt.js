// ==UserScript==
// @name         Crime Syndicate Calendar Management Tool
// @namespace    https://github.com/MrEricPearson
// @version      0.3.39
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

    const headerWrapper = document.createElement('div');
    headerWrapper.style.width = '100%';
    headerWrapper.style.display = 'flex';
    headerWrapper.style.alignItems = 'center';
    headerWrapper.style.justifyContent = 'space-between';
    headerWrapper.style.padding = '2px 10px';
    headerWrapper.style.position = 'relative';

    const backButton = document.createElement('button');
    backButton.style.position = 'absolute';
    backButton.style.left = '10%';
    backButton.style.top = '5px';
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
    modalTitle.style.margin = '0';
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
    cardHeader.style.marginBottom = '20px';

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

    const navButtonsContainer = document.createElement('div');
    navButtonsContainer.style.display = 'flex';
    navButtonsContainer.style.alignItems = 'center'; // Vertically center
    navButtonsContainer.appendChild(cardBackButton);
    navButtonsContainer.appendChild(cardForwardButton);
    titleAndButtonsContainer.appendChild(navButtonsContainer);

    cardHeader.appendChild(titleAndButtonsContainer);

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
    cardBackButton.style.padding = '0';
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
    cardForwardButton.style.padding = '0';
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
    headerCell.style.height = '16px'; // Set height as desired

    return headerCell;
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
        dayCell.style.backgroundColor = '#ffffff';
        dayCell.style.color = '#6C6D71';
    });

    calendarGrid.innerHTML = ''; // Clear previous grid

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
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1; // Month is 0-indexed
    const todayDay = today.getDate();

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

// CALENDAR: Create and style each day element inside the calendar grid
function createDayElement(d, index, year, month, todayYear, todayMonth, todayDay) {
    const dayElem = document.createElement('div');
    dayElem.className = `day ${d.class}`;

    let cellId = null;

    // Assign unique identifier only if the day belongs to the current month
    if (d.isCurrentMonth) {
        const cellDate = new Date(year, month, d.day);
        const cellYear = cellDate.getFullYear();
        const cellMonth = String(cellDate.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month
        const cellDay = String(d.day).padStart(2, '0');
        cellId = `cell-${cellYear}-${cellMonth}-${cellDay}`;
        dayElem.id = cellId;

        // Check if it's today's date
        const isToday = (
            cellYear === todayYear &&
            parseInt(cellMonth) === todayMonth && // Parse the month back to an integer
            parseInt(cellDay) === todayDay         // Parse the day back to an integer
        );

        if (isToday) {
            dayElem.classList.add('today');  // Add the 'today' class
        }
    }

    // Apply default styles for day cells
    if (d.class === 'prev' || d.class === 'next') {
        dayElem.style.backgroundColor = '#FFFFFF';
        dayElem.style.color = '#DDDFE7';
    } else if (d.class === 'current') {
        dayElem.style.backgroundColor = '#FFFFFF';
        dayElem.style.color = '#6C6D71';
    }

    // General styles for all day elements
    dayElem.style.height = '33px';
    dayElem.style.width = '33px';
    dayElem.style.display = 'flex';
    dayElem.style.flexDirection = 'column';
    dayElem.style.justifyContent = 'flex-start';
    dayElem.style.alignItems = 'center';

    // Create and position the day number
    const dateNumber = document.createElement('span');
    dateNumber.textContent = d.day;
    dateNumber.style.fontSize = '12px';

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

    // Placeholder icon
    const icon = document.createElement('div');
    icon.className = 'event-icon';
    icon.textContent = '📌';

    // Event details
    const details = document.createElement('div');
    details.className = 'event-details';

    const startDate = new Date(event.event_start_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const endDate = event.event_end_date ? new Date(event.event_end_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '??';
    const startTime = event.event_start_time || '--:--';
    const endTime = event.event_end_time || '--:--';

    details.innerHTML = `
        <div class="event-title-container">
            <strong class="event-title">${event.event_type}</strong>
            ${isPastEvent || event.event_status ? `
            <div class="status-box">
                <span class="status-dot"></span>
                ${isPastEvent ? 'Completed' : event.event_status}
            </div>` : ''}
        </div>
        <div class="date-line">
            <span>${startDate}</span>
            <span class="arrow-separator">> > ></span>
            <span>${endDate}</span>
        </div>
        <div class="time-line">
            <img src="https://epearson.me/faction_status_images/clock.svg" class="clock-icon"><span> ${formatTime(startTime)}</span>
            <img src="https://epearson.me/faction_status_images/clock.svg" class="clock-icon"><span> ${formatTime(endTime)}</span>
        </div>
    `;

    eventRow.appendChild(icon);
    eventRow.appendChild(details);

    return eventRow;
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
    contentWrapper.style.overflowY = 'auto';
    contentWrapper.style.height = '180px';
    contentWrapper.style.display = 'flex';
    contentWrapper.style.flexDirection = 'column';
    contentWrapper.style.alignItems = 'center';

    modal.appendChild(card);

    // Create event list container and append it to the modal *after* the card.
    const eventListContainer = document.createElement('div');
    eventListContainer.id = 'event-list-container';
    eventListContainer.style.width = '90%'; // Make it the same width as the card
    eventListContainer.style.boxSizing = 'border-box'; // Include padding/border in width

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
        display: none; /* Initially hidden */
        z-index: 100001;
        align-items: center;
        flex-direction: column;
        pointer-events: auto;
        padding-top: 5%;
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
        border: 1px solid #E7E7E7
        border-radius: 10px;
        margin: 20px 0;
        width: 94%;
        box-sizing: border-box;
    }

    .card-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
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
        grid-gap: 5px;
    }

    .content-wrapper-container {
        width: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        box-sizing: border-box; /*Ensures padding stays within bounds*/
    }

    .event-container {
        display: flex;
        justify-content: center; /* Horizontally center the circles */
        align-items: center;
        margin-top: 12px; /* Distance below the day number */
        gap: 4px; /* Space inbetween */
    }

    .event-circle {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
    }

    .event-list-container {
        width: 95%;
        box-sizing: border-box;
    }

    .day.today {
        background-color: #F6FAFB;
        color: #000000;
        border-color: #F6FAFB;
    }

    .event-card {
        background-color: #f4f9f5;
        color: #333;
        padding: 10px;
        border-radius: 10px;
        margin-bottom: 10px;
        width: 100%;
        box-sizing: border-box;
    }

    .event-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        padding: 5px 0;
    }

    .event-icon {
        width: 80px;
        text-align: center;
    }

    .event-details {
        flex-grow: 1;
        text-align: left;
        position: relative;
    }

    .event-title-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 5px;
    }

    .event-title {
        font-size: 16px;
    }

    .date-line {
        font-size: 12px;
        color: #797977;
        margin-bottom: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .date-line span {
        white-space: nowrap;
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

    .status-box {
        border: 1px solid #ddd;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        font-size: 12px;
        position: absolute; /*Positions status in top right of .event-detail*/
        top: 0;
        right: 0;
    }

    .status-dot {
        height: 8px;
        width: 8px;
        background-color: #2ecc71; /* Example color */
        border-radius: 50%;
        display: inline-block;
        margin-right: 5px;
    }

    .clock-icon {
        width: 12px; /* Adjust size as needed */
        height: 12px;
        margin-right: 5px;
        vertical-align: middle;
    }
`;
document.head.appendChild(style);

// Call the function directly
initializeCalendarTool();
