// ==UserScript==
// @name         Crime Syndicate Calendar Management Tool
// @namespace    https://github.com/MrEricPearson
// @version      0.2.6
// @description  Adds calendar management capabilities for your faction.
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
    document.body.appendChild(topBar);

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
    topBar.appendChild(modalButton);

    modalButton.textContent = 'Open Modal';
    modalButton.style.backgroundColor = '#007BFF';
    modalButton.style.color = '#fff';
    modalButton.style.border = 'none';
    modalButton.style.padding = '5px 10px';
    modalButton.style.marginRight = '8px';
    modalButton.style.cursor = 'pointer';
    modalButton.style.borderRadius = '5px';

    // Show the modal when the button is clicked
    modalButton.onclick = () => {
        modal.style.display = 'flex';
    };

    const modal = document.createElement('div');
    document.body.appendChild(modal);

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
    modal.appendChild(headerWrapper);

    headerWrapper.style.width = 'calc(80% + 40px)';
    headerWrapper.style.display = 'flex';
    headerWrapper.style.alignItems = 'center';
    headerWrapper.style.justifyContent = 'space-between';
    headerWrapper.style.marginBottom = '20px';
    headerWrapper.style.padding = '0 20px';

    const backButton = document.createElement('button');
    headerWrapper.appendChild(backButton);

    const backArrowImage = document.createElement('img');
    backButton.appendChild(backArrowImage);

    backArrowImage.src = "https://epearson.me/faction_status_images/arrow-back.svg";
    backArrowImage.height = 18;
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
    headerWrapper.appendChild(modalTitle);

    modalTitle.textContent = 'Faction Calendar';
    modalTitle.style.margin = '0';
    modalTitle.style.textAlign = 'center';
    modalTitle.style.flexGrow = '1';
    modalTitle.style.fontSize = '1.5em';
    modalTitle.style.fontWeight = '300';
    modalTitle.style.color = '#111612';
    modalTitle.style.marginLeft = '-50px';
    modalTitle.style.zIndex = '1';

    // Create the wrapper element for scrollable content
    const modalContentWrapper = document.createElement('div');
    modal.appendChild(modalContentWrapper);

    modalContentWrapper.style.display = 'flex';
    modalContentWrapper.style.flexDirection = 'column';
    modalContentWrapper.style.overflowY = 'auto';
    modalContentWrapper.style.flexGrow = '1'; // Take up the remaining space    

    const card = document.createElement('div');
    modalContentWrapper.appendChild(card);

    card.style.backgroundColor = '#f4f9f5';
    card.style.color = '#333';
    card.style.padding = '20px';
    card.style.borderRadius = '10px';
    card.style.marginTop = '20px';
    card.style.width = '80%';

    const cardHeader = document.createElement('div');
    card.appendChild(cardHeader);

    cardHeader.style.width = '100%';
    cardHeader.style.display = 'flex';
    cardHeader.style.alignItems = 'center';
    cardHeader.style.justifyContent = 'space-between';
    cardHeader.style.marginBottom = '20px';

    const cardBackButton = document.createElement('button');
    cardHeader.appendChild(cardBackButton);

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

    const monthTitle = document.createElement('h3');
    cardHeader.appendChild(monthTitle);

    monthTitle.textContent = 'January';
    monthTitle.style.margin = '0';
    monthTitle.style.textAlign = 'center';
    monthTitle.style.flexGrow = '1';

    const cardForwardButton = document.createElement('button');
    cardHeader.appendChild(cardForwardButton);

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

    const calendarGrid = document.createElement('div');
    card.appendChild(calendarGrid);

    calendarGrid.style.display = 'grid';
    calendarGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    calendarGrid.style.gridGap = '5px';

    // Create an area to display event details below the calendar
    const eventDisplayContainer = document.createElement('div');
    modalContentWrapper.appendChild(eventDisplayContainer);

    eventDisplayContainer.style.width = '100%';
    eventDisplayContainer.style.maxHeight = '200px'; // Allow scrolling for many events
    eventDisplayContainer.style.overflowY = 'auto';
    eventDisplayContainer.style.backgroundColor = '#f8f9fa';
    eventDisplayContainer.style.border = '1px solid #ddd';
    eventDisplayContainer.style.marginTop = '10px';
    eventDisplayContainer.style.padding = '10px';
    eventDisplayContainer.style.fontFamily = 'Arial, sans-serif';
    eventDisplayContainer.style.fontSize = '14px';
    eventDisplayContainer.style.color = '#333';

    // Clear previous log functionality
    eventDisplayContainer.innerHTML = ''; // Remove old console behavior

    // Hide the modal when backButton is clicked
    backButton.onclick = () => {
        modal.style.display = 'none';
    };

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
        let rowHeights = new Array(6).fill(4.5); // Initialize row heights (in em)
        
        // Assuming eventGroupsMap holds the event groupings for each day
        const eventGroupsMap = {}; // Keyed by cellId, holds arrays of event groups
    
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
    
            // Track event groups assigned to each cell (if any)
            if (eventGroupsMap[cellId]) {
                // Increase row height if there are multiple event groups for this day
                const eventLayerCount = eventGroupsMap[cellId].length;
                if (eventLayerCount > 1) {
                    const rowIndex = Math.floor(index / 7); // Determine which row the cell belongs to
                    rowHeights[rowIndex] = Math.max(rowHeights[rowIndex], 4.5 + 22); // Increase row height
                }
            }
        });
    
        // Adjust the height of all cells in rows with extra layers
        const rowCells = Array.from(calendarGrid.children); // Convert HTMLCollection to array
        rowHeights.forEach((height, rowIndex) => {
            const startIndex = rowIndex * 7;
            const rowCellsInRow = rowCells.slice(startIndex, startIndex + 7);
    
            rowCellsInRow.forEach(cell => {
                cell.style.height = `${height}em`;
            });
        });
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
        // Clear the event display container before repopulating
        eventDisplayContainer.innerHTML = '';

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

        // Render events in `eventDisplayContainer`
        [...upcomingEvents, ...pastEvents].forEach(event => {
            eventDisplayContainer.appendChild(createEventElement(event, pastEvents.includes(event)));
        });

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
            const eventColor = colorMap[event.event_type] || "#000";
            const eventObjectId = event._id;

            let eventDays = [];

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

            eventDays.forEach(({ cellId }) => {
                for (let layer = 0; layer <= maxLayer; layer++) {
                    if (eventBarLayerMap.get(cellId + `-layer-${layer}`)) {
                        conflictFound = true;
                        break;
                    }
                }
            });

            if (conflictFound) {
                while (eventLayer <= maxLayer && eventBarLayerMap.get(eventDays[0].cellId + `-layer-${eventLayer}`)) {
                    eventLayer++;
                }
            }

            if (eventLayer > maxLayer) return;

            eventAnalysisOutput.push({ eventObjectId, eventDays, determinedLayer: eventLayer });

            eventDays.forEach(({ cellId }) => {
                eventBarLayerMap.set(cellId + `-layer-${eventLayer}`, true);
            });

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

                if (index === eventDays.length - 1) {
                    eventBar.style.cssText += `
                        border-top-right-radius: 12px;
                        border-bottom-right-radius: 12px;
                        width: calc(100% - 2px);
                    `;
                }

                if (eventDays.length === 1) {
                    eventBar.style.cssText += `
                        border-radius: 12px;
                        width: calc(100% - 2px);
                    `;
                }

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
