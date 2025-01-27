// ==UserScript==
// @name         Crime Syndicate Calendar Management Tool
// @namespace    https://github.com/MrEricPearson
// @version      0.1.10
// @description  Adds a button to the faction management page that will direct to a series of tools that manipulate the current faction schedule.
// @author       BeefDaddy
// @downloadURL  https://github.com/MrEricPearson/Crime-Syndicate-Calendar-Management-Tool/raw/refs/heads/main/cs-calendar-mgmt.js
// @updateURL    https://github.com/MrEricPearson/Crime-Syndicate-Calendar-Management-Tool/raw/refs/heads/main/cs-calendar-mgmt.js
// @match        https://www.torn.com/factions.php*
// @grant        none
// ==/UserScript==

function initializeCalendarTool() {
    // Map event types to their respective background colors
    const colorMap = {
        event: '#51c1b6',
        training: '#4d8dca',
        stacking: '#a5a866',
        war: '#faa31e',
        chaining: '#c79b7a',
        other: '#dde0cf'
    };

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
    modal.style.paddingTop = '5%';

    const headerWrapper = document.createElement('div');
    headerWrapper.style.width = 'calc(80% + 40px)';
    headerWrapper.style.display = 'flex';
    headerWrapper.style.alignItems = 'center';
    headerWrapper.style.justifyContent = 'space-between';
    headerWrapper.style.marginBottom = '20px';
    headerWrapper.style.padding = '0 20px';

    const backButton = document.createElement('button');
    const backArrowImage = document.createElement('img');
    backArrowImage.src = "https://epearson.me/faction_status_images/arrow-back.svg";
    backArrowImage.height = 18;
    backButton.appendChild(backArrowImage);
    backButton.style.backgroundColor = '#ffffff';
    backButton.style.color = '#131311';
    backButton.style.border = 'none';
    backButton.style.borderRadius = '50%';
    backButton.style.padding = '10px 10px 13px 10px';
    backButton.style.cursor = 'pointer';
    backButton.style.fontSize = '30px';
    backButton.style.lineHeight = '28px';
    backButton.style.zIndex = '100';

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

    const card = document.createElement('div');
    card.style.backgroundColor = '#f4f9f5';
    card.style.color = '#333';
    card.style.padding = '20px';
    card.style.borderRadius = '10px';
    card.style.marginTop = '20px';
    card.style.width = '80%';

    const cardHeader = document.createElement('div');
    cardHeader.style.width = '100%';
    cardHeader.style.display = 'flex';
    cardHeader.style.alignItems = 'center';
    cardHeader.style.justifyContent = 'space-between';
    cardHeader.style.marginBottom = '20px';

    const cardBackButton = document.createElement('button');
    const cardBackArrowImage = document.createElement('img');
    cardBackArrowImage.src = "https://epearson.me/faction_status_images/arrow-back.svg";
    cardBackArrowImage.height = 12;
    cardBackButton.appendChild(cardBackArrowImage);
    cardBackButton.style.backgroundColor = '#ffffff';
    cardBackButton.style.color = '#131311';
    cardBackButton.style.border = 'none';
    cardBackButton.style.borderRadius = '50%';
    cardBackButton.style.padding = '10px 10px 12px 10px';
    cardBackButton.style.cursor = 'pointer';
    cardBackButton.style.fontSize = '20px';
    cardBackButton.style.lineHeight = '18px';

    const monthTitle = document.createElement('h3');
    monthTitle.textContent = 'January';
    monthTitle.style.margin = '0';
    monthTitle.style.textAlign = 'center';
    monthTitle.style.flexGrow = '1';

    const cardForwardButton = document.createElement('button');
    const cardForwardArrowImage = document.createElement('img');
    cardForwardArrowImage.src = "https://epearson.me/faction_status_images/arrow-forward.svg";
    cardForwardArrowImage.height = 12;
    cardForwardButton.appendChild(cardForwardArrowImage);
    cardForwardButton.style.backgroundColor = '#ffffff';
    cardForwardButton.style.color = '#131311';
    cardForwardButton.style.border = 'none';
    cardForwardButton.style.borderRadius = '50%';
    cardForwardButton.style.padding = '10px 10px 12px 10px';
    cardForwardButton.style.cursor = 'pointer';
    cardForwardButton.style.fontSize = '20px';
    cardForwardButton.style.lineHeight = '18px';

    cardHeader.appendChild(cardBackButton);
    cardHeader.appendChild(monthTitle);
    cardHeader.appendChild(cardForwardButton);

    const calendarGrid = document.createElement('div');
    calendarGrid.style.display = 'grid';
    calendarGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    calendarGrid.style.gridGap = '5px';
    card.appendChild(cardHeader);
    card.appendChild(calendarGrid);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

    const renderCalendar = (year, month) => {
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
            days.push({
                day: daysInPrevMonth - i,
                class: 'prev',
                isCurrentMonth: false, // Mark as not part of the current month
            });
        }
    
        // Fill current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                class: 'current',
                isCurrentMonth: true, // Mark as part of the current month
            });
        }
    
        // Fill next month's overflow days
        while (days.length < totalCells) {
            days.push({
                day: days.length - daysInMonth - firstDay + 1,
                class: 'next',
                isCurrentMonth: false, // Mark as not part of the current month
            });
        }
    
        let currentWeekStart = null;
        let currentWeekEnd = null;
    
        days.forEach((d, index) => {
            const dayElem = document.createElement('div');
            dayElem.className = `day ${d.class}`;
            dayElem.textContent = d.day;
    
            let cellId = null;
    
            // Assign unique identifier only if the day belongs to the current month
            if (d.isCurrentMonth) {
                const cellDate = new Date(year, month, d.day);
                const cellYear = cellDate.getFullYear();
                const cellMonth = String(cellDate.getMonth() + 1).padStart(2, '0'); // Add 1 since months are 0-based
                const cellDay = String(d.day).padStart(2, '0');
                cellId = `cell-${cellYear}-${cellMonth}-${cellDay}`;
                dayElem.id = cellId;
            }
    
            // Apply default styles for days
            if (d.class === 'prev' || d.class === 'next') {
                dayElem.style.backgroundColor = '#ecf1ed';
                dayElem.style.color = '#d3d8d4';
            } else if (d.class === 'current') {
                dayElem.style.backgroundColor = '#eff4f1';
                dayElem.style.color = '#333333';
            }
    
            // General styles for all day elements
            dayElem.style.height = '4em';
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
    
            calendarGrid.appendChild(dayElem);
    
            // Logic to identify week boundaries only for current month days
            if (d.isCurrentMonth && index % 7 === 0) {
                // Start of a new week
                if (currentWeekStart !== null) {
                    // Mark the end of the previous week (previous cell)
                    currentWeekEnd = dayElem;
                    currentWeekEnd.setAttribute("data-week-end", "true");
                    currentWeekEnd.appendChild(createBoundaryText("end"));
                }
                // Mark the start of this week
                currentWeekStart = dayElem;
                currentWeekStart.setAttribute("data-week-start", "true");
                currentWeekStart.appendChild(createBoundaryText("start"));
            }
    
            // Detect and label the start of the month only if it's part of the current month
            if (d.day === 1 && d.isCurrentMonth) {
                dayElem.setAttribute("data-month-start", "true");
                dayElem.appendChild(createBoundaryText("start of month"));
            }
    
            // Detect and label the end of the month only if it's part of the current month
            if (d.day === daysInMonth && d.isCurrentMonth) {
                dayElem.setAttribute("data-month-end", "true");
                dayElem.appendChild(createBoundaryText("end of month"));
            }
    
            // Mark the day before the week start as the end of the week
            if (index % 7 !== 0 && d.isCurrentMonth && days[index - 1].isCurrentMonth) {
                const prevDayElem = calendarGrid.children[index - 1];
                // Ensure it's not a peek day or a start/end of month
                if (!prevDayElem.hasAttribute('data-month-start') && 
                    !prevDayElem.hasAttribute('data-month-end') && 
                    !prevDayElem.hasAttribute('data-week-start')) {
                    prevDayElem.setAttribute("data-week-end", "true");
                    prevDayElem.appendChild(createBoundaryText("end"));
                }
            }
        });
    
        // Utility function to create boundary text
        function createBoundaryText(type) {
            const boundaryText = document.createElement('span');
            boundaryText.textContent = type === "start" ? "Start of Week" : 
                                      type === "end" ? "End of Week" :
                                      type === "start of month" ? "Start of Month" : "End of Month";
            boundaryText.style.position = 'absolute';
            boundaryText.style.top = '0';
            boundaryText.style.right = '0';
            boundaryText.style.backgroundColor = 'yellow';
            boundaryText.style.padding = '2px';
            return boundaryText;
        }
    };
    
    let currentMonthIndex = 0;
    let currentYear = 2025;

    const updateCalendar = () => {
        monthTitle.textContent = `${months[currentMonthIndex]} ${currentYear}`; // Include year
        renderCalendar(currentYear, currentMonthIndex);
        fetchEventData(); // Fetch and apply events for the current month
    };    

    cardBackButton.addEventListener('click', () => {
        // Prevent going backward past January 2025
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

    modal.appendChild(headerWrapper);
    modal.appendChild(card);

    const headerRoot = document.getElementById('header-root');
    if (headerRoot) {
        headerRoot.style.position = 'relative';
        headerRoot.style.marginTop = '33px';
        document.body.insertBefore(topBar, headerRoot);
    }

    document.body.appendChild(modal);
    topBar.appendChild(modalButton);

    modalButton.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    backButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // START EVENT DISPLAY SECTION

    // Create a scrollable area to display event details
    const eventDisplayContainer = document.createElement('div');
    eventDisplayContainer.style.width = '80%';
    eventDisplayContainer.style.height = '100px'; // 5-line height
    eventDisplayContainer.style.overflowY = 'scroll';
    eventDisplayContainer.style.backgroundColor = '#f8f9fa';
    eventDisplayContainer.style.border = '1px solid #ddd';
    eventDisplayContainer.style.marginTop = '20px';
    eventDisplayContainer.style.padding = '10px';
    eventDisplayContainer.style.fontFamily = 'monospace';
    eventDisplayContainer.style.fontSize = '0.9em';
    eventDisplayContainer.style.color = '#333';

    // Append the scrollable area to the modal
    modal.appendChild(eventDisplayContainer);

    // Create a utility function for logging to eventDisplayContainer
    function logToContainer(message, isError = false) {
        const logEntry = document.createElement("div");
        logEntry.textContent = message;
        logEntry.style.color = isError ? "#ff0000" : "#333333"; // Red for errors, default for normal logs
        eventDisplayContainer.appendChild(logEntry);
        eventDisplayContainer.scrollTop = eventDisplayContainer.scrollHeight; // Auto-scroll to the bottom
    }

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

            if (!validYear || !validMonth || !validType) {
                return false;
            }
            return true;
        });

        // If no valid events, return early
        if (validEvents.length === 0) {
            return;
        }

        // If there are valid events, just loop through without modifying any cells
        validEvents.forEach((event) => {
            const startDate = parseDateAsUTC(event.event_start_date);
            const endDate = parseDateAsUTC(event.event_end_date);
            
            // We're not doing anything with the event days, so no coloring or cell modification happens
            for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
                // You could use this loop if you plan to implement a new visual identification method later
                const year = d.getUTCFullYear();
                const month = String(d.getUTCMonth() + 1).padStart(2, "0");
                const day = String(d.getUTCDate()).padStart(2, "0");
                const cellId = `cell-${year}-${month}-${day}`;

                // Just log the event days if needed, for debugging
                console.log(`Event day: ${cellId}`);
            }
        });
    }

    // Handle clearing of local storage when the back button is clicked
    backButton.addEventListener("click", () => {
        modal.style.display = 'none';
        localStorage.removeItem("eventsData"); // Clear events data when modal is closed
    });

    // Update initialization for event logging
    modalButton.addEventListener("click", () => {
        modal.style.display = "flex";
        fetchEventData();
    });

    // END EVENT DISPLAY SECTION

}

// Call the function directly
initializeCalendarTool();
