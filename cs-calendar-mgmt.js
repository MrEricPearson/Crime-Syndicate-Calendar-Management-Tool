// ==UserScript==
// @name         Crime Syndicate Calendar Management Tool
// @namespace    https://github.com/MrEricPearson
// @version      0.2.22
// @description  Adds calendar management capabilities to your faction.
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
    // Step 1: Create the top bar container
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

    // Step 2: Create the modal button
    const modalButton = document.createElement('button');
    modalButton.textContent = 'Open Modal';
    modalButton.style.backgroundColor = '#007BFF';
    modalButton.style.color = '#fff';
    modalButton.style.border = 'none';
    modalButton.style.padding = '5px 10px';
    modalButton.style.marginRight = '8px';
    modalButton.style.cursor = 'pointer';
    modalButton.style.borderRadius = '5px';

    // Step 3: Attach event listener to show the modal
    modalButton.onclick = () => {
        modal.style.display = 'flex';
    };

    // Step 4: Append button to top bar
    topBar.appendChild(modalButton);

    // Step 5: Update initialization for event logging
    modalButton.addEventListener("click", () => {
        modal.style.display = "flex";
        fetchEventData();
    });

    // Step 6: Return the constructed top bar
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

    // Step 8: Insert top bar before header
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
    // Step 1: Create the card container
    const card = document.createElement('div');
    card.style.backgroundColor = '#f4f9f5';
    card.style.color = '#333';
    card.style.padding = '20px';
    card.style.borderRadius = '10px';
    card.style.marginTop = '20px';
    card.style.width = '80%';

    // Step 2: Create the card header container
    const cardHeader = document.createElement('div');
    card.appendChild(cardHeader);
    cardHeader.style.width = '100%';
    cardHeader.style.display = 'flex';
    cardHeader.style.alignItems = 'center';
    cardHeader.style.justifyContent = 'space-between';
    cardHeader.style.marginBottom = '20px';

    // Step 3: Create the back button and its arrow image
    const cardBackButton = createBackButton();
    cardHeader.appendChild(cardBackButton);

    // Step 4: Create the month title
    const monthTitle = createMonthTitle();
    cardHeader.appendChild(monthTitle);

    // Step 5: Create the forward button and its arrow image
    const cardForwardButton = createForwardButton();
    cardHeader.appendChild(cardForwardButton);

    // Step 6: Create the calendar grid container
    const calendarGrid = createCalendarGrid();
    card.appendChild(calendarGrid);

    return card;
}

//////////////////////////////
// START Calendar Functions //

    // Parent calendar function to organize and render the entire calendar UI
    function initializeCalendar() {
        let currentMonthIndex = 0;
        let currentYear = 2025;

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Create and initialize UI elements
        const calendarUI = createCalendarUI();
        const { monthTitle, cardBackButton, cardForwardButton, calendarGrid } = calendarUI;
        document.body.appendChild(calendarUI.container); // Assume you want to append this to the body or another element

        const updateCalendar = () => {
            monthTitle.textContent = `${months[currentMonthIndex]} ${currentYear}`;
            renderCalendar(currentYear, currentMonthIndex, calendarGrid);
            fetchEventData(); // Fetch and apply events for the current month
        };

        // Month navigation event listeners
        cardBackButton.addEventListener('click', () => {
            if (currentYear === 2025 && currentMonthIndex === 0) return;
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
    }

    // Create and initialize the UI components for the calendar
    function createCalendarUI() {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';

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

    // Create the month title with its styling
    function createMonthTitle() {
        const monthTitle = document.createElement('h3');
        monthTitle.textContent = 'January';
        monthTitle.style.margin = '0';
        monthTitle.style.textAlign = 'center';
        monthTitle.style.flexGrow = '1';
        return monthTitle;
    }

    // Create the back button with its styling and functionality
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

    // Create the forward button with its styling and functionality
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

    // Create the calendar grid for displaying days and events
    function createCalendarGrid() {
        const calendarGrid = document.createElement('div');
        calendarGrid.style.display = 'grid';
        calendarGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        calendarGrid.style.gridGap = '5px';

        return calendarGrid;
    }

    // Render the calendar days, filling in the grid and handling events
    function renderCalendar(year, month, calendarGrid) {
        calendarGrid.innerHTML = '';  // Clear previous calendar grid

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

        days.forEach((d, index) => {
            const dayElem = createDayElement(d, index, year, month);
            calendarGrid.appendChild(dayElem);
        });
    }

    // Create and style each day element inside the calendar grid
    function createDayElement(d, index, year, month) {
        const dayElem = document.createElement('div');
        dayElem.className = `day ${d.class}`;
        dayElem.textContent = d.day;
        
        // Create and position the day number inside the cell
        const dateNumber = document.createElement('span');
        dateNumber.textContent = d.day;
        dateNumber.style.position = 'absolute';
        dateNumber.style.bottom = '5px';
        dateNumber.style.left = '5px';

        dayElem.appendChild(dateNumber);

        return dayElem;
    }

    // Function to get the number of days in a given month
    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

////////////////////////////
// END Calendar Functions //

// Fetch and process data using PDA_httpGet
async function fetchEventData() {
    try {
        const storedEvents = localStorage.getItem("eventsData"); // Check if events data is stored in localStorage
        
        if (storedEvents) {
            // If events data is found in localStorage, use it
            const events = JSON.parse(storedEvents);
            processEvents(events); // Process the events just like in the API call
        } else {
            // If no data is found, make the API request
            const endpoint = "https://epearson.me:3000/api/twisted-minds/calendar";
    
            // Make GET request using PDA_httpGet
            const response = await PDA_httpGet(endpoint);
    
            // Validate response structure
            if (!response || typeof response !== "object") {
                logToContainer("Error: Invalid response from PDA_httpGet.", true);
                return;
            }
    
            // Parse response content
            const status = response.status;
            const statusText = response.statusText;
            const responseText = response.responseText;
    
            if (status !== 200) {
                logToContainer(`Error: Received status ${status} - ${statusText}`, true);
                return;
            }
    
            let jsonResponse;
            try {
                jsonResponse = JSON.parse(responseText);
            } catch (e) {
                logToContainer("Error: Unable to parse response JSON.", true);
                return;
            }
    
            const events = jsonResponse.events || [];
    
            // Store the fetched events in localStorage for future use
            localStorage.setItem("eventsData", JSON.stringify(events));
    
            // Process events
            processEvents(events);
        }
    } catch (error) {
        logToContainer(`Fetch Error: ${error.message}`, true);
    }
}

// Helper fucntion to reformat date string to UTC
function parseDateAsUTC(dateString) {
    const dateParts = dateString.split("-"); // Assuming format is YYYY-MM-DD
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Months are 0-indexed in JavaScript
    const day = parseInt(dateParts[2], 10);
    
    // Create a Date object in UTC
    return new Date(Date.UTC(year, month, day));
}    

// Process and display the events
function processEvents(events) {
    // Filter out invalid events
    const validEvents = events.filter((event) => {
        if (!event || !event.event_start_date || !event.event_type) {
            return false;
        }
        const eventYear = parseInt(event.event_start_date.split("-")[0], 10);
        const eventMonth = parseInt(event.event_start_date.split("-")[1], 10) - 1; // 0-based month
        const validYear = eventYear === currentYear;
        const validMonth = eventMonth === currentMonthIndex;
        const validType = ["event", "training", "stacking", "war", "chaining", "other"].includes(event.event_type);

        return validYear && validMonth && validType;
    });

    // If no valid events, return early
    if (validEvents.length === 0) {
        return;
    }

    console.log("=== Analyzing Event Group Levels for Current Month ===");

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

    // Sort events
    upcomingEvents.sort((a, b) => new Date(a.event_start_date) - new Date(b.event_start_date));
    pastEvents.sort((a, b) => new Date(b.event_end_date) - new Date(a.event_end_date));

    // Render events
    setTimeout(() => {
        [...upcomingEvents, ...pastEvents].forEach(event => {
            modalContentWrapper.appendChild(createEventElement(event, pastEvents.includes(event)));
        });
    }, 0);        

    // === Retain existing calendar logic ===
    
    // Sort valid events by start date
    validEvents.sort((a, b) => {
        const dateA = new Date(a.event_start_date);
        const dateB = new Date(b.event_start_date);
        return dateA - dateB; // Sort in ascending order (earliest first)
    });

    const eventBarLayerMap = new Map();
    const maxLayer = 3;

    let eventAnalysisOutput = [];

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
    
        // Save the event analysis output
        eventAnalysisOutput.push({ eventObjectId, eventDays, determinedLayer: eventLayer });
    
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

    console.log("=== Event Group Level Analysis ===");
    eventAnalysisOutput.forEach((eventInfo) => {
        console.log(`Event Object ID: ${eventInfo.eventObjectId}`);
        console.log("Event Days:", eventInfo.eventDays.map((day) => day.cellId));
        console.log("Assigned Layer:", eventInfo.determinedLayer);
        console.log("====================================");
    });

    console.log("=== End of Event Days ===");
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
    const modal = createModal(); // Ensure createModal() is properly defined
    const topBar = createTopBar(modal); // Ensure createTopBar() is properly defined
    const card = createCard(); // Ensure createCard() is properly defined
    const calendarElement = Calendar(); // Initialize the calendar

    document.body.appendChild(topBar); // Append top bar to body
    document.body.appendChild(modal); // Append modal to body
    modal.appendChild(card); // Append card inside the modal
    modal.appendChild(calendarElement); // Append the calendar inside the modal (or another suitable container)
}

// Call the function directly
initializeCalendarTool();
