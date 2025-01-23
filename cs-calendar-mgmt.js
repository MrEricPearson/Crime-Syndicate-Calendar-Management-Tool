// ==UserScript==
// @name         Crime Syndicate Calendar Management Tool
// @namespace    https://github.com/MrEricPearson
// @version      0.19
// @description  Adds a button to the faction management page that will direct to a series of tools that manipulate the current faction schedule.
// @author       BeefDaddy
// @downloadURL  https://github.com/MrEricPearson/Crime-Syndicate-Calendar-Management-Tool/raw/refs/heads/main/cs-calendar-mgmt.js
// @updateURL    https://github.com/MrEricPearson/Crime-Syndicate-Calendar-Management-Tool/raw/refs/heads/main/cs-calendar-mgmt.js
// @match        https://www.torn.com/factions.php*
// @grant        none
// ==/UserScript==

function initializeCalendarTool() {
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

    const renderCalendar = (year, month, events) => {
        calendarGrid.innerHTML = ''; // Clear previous grid
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = getDaysInMonth(year, month);
        const totalCells = 42; // 6 rows * 7 days
        const days = [];
    
        // Fill previous month's overflow days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: getDaysInMonth(year, month - 1) - i,
                class: 'prev',
            });
        }
    
        // Fill current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                class: 'current',
            });
        }
    
        // Fill next month's overflow days
        while (days.length < totalCells) {
            days.push({
                day: days.length - daysInMonth - firstDay + 1,
                class: 'next',
            });
        }
    
        // Inside the renderCalendar function
        days.forEach((d) => {
            const dayElem = document.createElement('div');
            dayElem.className = `day ${d.class}`;
            dayElem.textContent = d.day;
    
            // Apply styles based on day type (prev, current, next)
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
    
            // Create a unique ID for the day
            const dayID = `day-${year}-${(month + 1).toString().padStart(2, '0')}-${d.day.toString().padStart(2, '0')}`;
            dayElem.id = dayID;
    
            // Check for events that fall on this day and apply colors
            applyEventColor(dayElem, dayID, events);
    
            // Position the date number
            const dateNumber = document.createElement('span');
            dateNumber.textContent = d.day;
            dateNumber.style.position = 'absolute';
            dateNumber.style.bottom = '5px';
            dateNumber.style.left = '5px';
    
            dayElem.textContent = ''; // Clear text content to avoid duplicate numbers
            dayElem.appendChild(dateNumber);
    
            calendarGrid.appendChild(dayElem);
        });
    };

    // Adjust applyEventColor to ensure it works with proper day matching
    const applyEventColor = (dayElem, dayID, events) => {
        // Check if any event includes this day and apply the corresponding color
        events.forEach((event) => {
            const eventStartDate = new Date(event.event_start_date);
            const eventEndDate = new Date(event.event_end_date);
            const eventType = event.event_type;

            // Ensure we are comparing the right format
            const currentDate = new Date(dayID.split('-').slice(1).join('-'));
            
            if (currentDate >= eventStartDate && currentDate <= eventEndDate) {
                let color = getEventColor(eventType);
                dayElem.style.backgroundColor = color; // Apply color to the day element
            }
        });
    };
    
    const getEventColor = (eventType) => {
        switch (eventType) {
            case 'war': return '#faa31e'; // War
            case 'event': return '#51c1b6'; // Event
            case 'chaining': return '#c79b7a'; // Chaining
            case 'stacking': return '#a5a866'; // Stacking
            case 'training': return '#4d8dca'; // Training
            default: return '#eff4f1'; // Default
        }
    };

    let currentMonthIndex = 0;
    let currentYear = 2025;

    const updateCalendar = () => {
        monthTitle.textContent = `${months[currentMonthIndex]} ${currentYear}`; // Include year
        renderCalendar(currentYear, currentMonthIndex);
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

    // START JSON DISPLAY SECTION

    // Create a scrollable area for the JSON response
    const jsonDisplayContainer = document.createElement('div');
    jsonDisplayContainer.style.width = '80%';
    jsonDisplayContainer.style.height = '100px'; // 5-line height
    jsonDisplayContainer.style.overflowY = 'scroll';
    jsonDisplayContainer.style.backgroundColor = '#f8f9fa';
    jsonDisplayContainer.style.border = '1px solid #ddd';
    jsonDisplayContainer.style.marginTop = '20px';
    jsonDisplayContainer.style.padding = '10px';
    jsonDisplayContainer.style.fontFamily = 'monospace';
    jsonDisplayContainer.style.fontSize = '0.9em';
    jsonDisplayContainer.style.color = '#333';

    // Append the scrollable area to the modal
    modal.appendChild(jsonDisplayContainer);

    // Fetch and display data using PDA_httpGet
    // Apply event colors after rendering the calendar and ensuring all data is fetched
    async function fetchData() {
        try {
            const endpoint = "https://epearson.me:3000/api/twisted-minds/calendar";
            const response = await PDA_httpGet(endpoint);

            if (response.status === 200) {
                const jsonResponse = JSON.parse(response.responseText);
                const events = jsonResponse; // Extract the list of events
                
                const calendarColors = {}; // Track event colors per day
                const colorMapping = {
                    stacking: '#a5a866',
                    training: '#4d8dca',
                    event: '#51c1b6',
                    war: '#faa31e',
                    chaining: '#c79b7a'
                };
                const priority = {
                    war: 1,
                    event: 2,
                    chaining: 3,
                    stacking: 4,
                    training: 5
                };

                // Set color for each day based on events
                events.forEach(event => {
                    const { event_start_date, event_end_date, event_type } = event;
                    const startDate = new Date(event_start_date);
                    const endDate = new Date(event_end_date);
                    
                    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                        const dayString = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
                        
                        // Prioritize event types if multiple events occur on the same day
                        if (!calendarColors[dayString]) {
                            calendarColors[dayString] = event_type;
                        } else {
                            const currentPriority = priority[calendarColors[dayString]];
                            const newPriority = priority[event_type];

                            // If new event has higher priority, update color
                            if (newPriority < currentPriority) {
                                calendarColors[dayString] = event_type;
                            }
                        }
                    }
                });

                // Now apply the colors to the calendar days
                const allCalendarDays = document.querySelectorAll('.day.current');
                allCalendarDays.forEach(dayElem => {
                    const day = dayElem.textContent;
                    const date = new Date(currentYear, currentMonthIndex, day);
                    const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                    
                    if (calendarColors[dateString]) {
                        const eventType = calendarColors[dateString];
                        dayElem.style.backgroundColor = colorMapping[eventType];
                    }
                });

            } else {
                console.error("Error: " + response.status + " - " + response.statusText);
            }
        } catch (error) {
            console.error("Fetch Error: " + error.message);
        }
    }

    // Trigger fetchData after modal and elements are fully ready
    modalButton.addEventListener('click', () => {
        modal.style.display = 'flex';
        fetchData(); // Now fetch data once the modal is opened
    });

    // END JSON DISPLAY SECTION

}

// Call the function directly
initializeCalendarTool();
