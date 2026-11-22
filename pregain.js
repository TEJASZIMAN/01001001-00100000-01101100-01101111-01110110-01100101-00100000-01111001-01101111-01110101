
// Stopwatch variables

let startTime = 0;
let elapsedTime = 0;
let interval = null;

let isRunning = false;
let pendingSession = null;

// Load saved sessions from localStorage

let sessions = JSON.parse(
    localStorage.getItem("focusSessions") || "[]"
);

// HTML elements

const timer = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");

const saveBtn = document.getElementById("saveBtn");
const discardBtn = document.getElementById("discardBtn");

const saveArea = document.getElementById("saveArea");

const sessionName = document.getElementById("sessionName");
const category = document.getElementById("category");

const sessionList = document.getElementById("sessionList");


// Format milliseconds into HH:MM:SS

function formatTime(milliseconds) {

    const totalSeconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    return (
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0")
    );
}


// Update stopwatch display

function updateTimer() {

    const currentElapsed = elapsedTime +
        (isRunning ? Date.now() - startTime : 0);

    timer.textContent = formatTime(currentElapsed);
}


// Start stopwatch

startBtn.addEventListener("click", () => {

    if (isRunning) return;

    startTime = Date.now();

    isRunning = true;

    interval = setInterval(updateTimer, 250);

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;

    saveArea.classList.add("hidden");

});


// Pause and resume stopwatch

pauseBtn.addEventListener("click", () => {

    if (isRunning) {

        elapsedTime += Date.now() - startTime;

        isRunning = false;

        clearInterval(interval);

        pauseBtn.textContent = "▶";

    } else {

        startTime = Date.now();

        isRunning = true;

        interval = setInterval(updateTimer, 250);

        pauseBtn.textContent = "▐▐";

    }

    updateTimer();

});


// Stop stopwatch

stopBtn.addEventListener("click", () => {

    if (!isRunning) return;

    elapsedTime += Date.now() - startTime;

    isRunning = false;

    clearInterval(interval);

    updateTimer();

    // Create a pending session

    pendingSession = {
        name: sessionName.value.trim() || "Untitled Session",
        category: category.value,
        duration: elapsedTime,
        date: new Date().toLocaleString()
    };

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;

    pauseBtn.textContent = "Pause";

    saveArea.classList.remove("hidden");

});


// Save session permanently

saveBtn.addEventListener("click", () => {

    if (!pendingSession) return;

    const newSession = {
        ...pendingSession,
        id: Date.now() + "-" + Math.random()
    };

    sessions.unshift(newSession);

    localStorage.setItem(
        "focusSessions",
        JSON.stringify(sessions)
    );

    pendingSession = null;

    resetStopwatch();

    renderSessions();

});


// Discard unsaved session

discardBtn.addEventListener("click", () => {

    pendingSession = null;

    resetStopwatch();

});


// Reset stopwatch

function resetStopwatch() {

    clearInterval(interval);

    elapsedTime = 0;
    startTime = 0;
    isRunning = false;

    timer.textContent = "00:00:00";

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;

    pauseBtn.textContent = "Pause";

    saveArea.classList.add("hidden");

    sessionName.value = "";

}


// Save sessions to localStorage

function saveSessions() {

    localStorage.setItem(
        "focusSessions",
        JSON.stringify(sessions)
    );

}


// Delete session

function deleteSession(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this session?"
    );

    if (!confirmed) return;

    sessions = sessions.filter(
        session => session.id !== id
    );

    saveSessions();

    renderSessions();

}


// Render all saved sessions

function renderSessions() {

    sessionList.innerHTML = "";

    document.getElementById("totalSessions").textContent =
        sessions.length;

    document.getElementById("sessionCount").textContent =
        sessions.length + (
            sessions.length === 1 ? " session" : " sessions"
        );

    // Calculate total time

    const totalMilliseconds = sessions.reduce(
        (total, session) => total + session.duration,
        0
    );

    const totalMinutes = Math.floor(
        totalMilliseconds / 60000
    );

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    document.getElementById("totalTime").textContent =
        hours + "h " + minutes + "m";


    // Empty state

    if (sessions.length === 0) {

        sessionList.innerHTML = `
            <div class="empty">
                <span>📋</span>
                <p>No sessions yet.</p>
                <small>Start your first session!</small>
            </div>
        `;

        return;
    }


    // Display sessions

    sessions.forEach(session => {

        const sessionElement = document.createElement("div");

        sessionElement.className = "session";

        const info = document.createElement("div");
        info.className = "session-info";

        const title = document.createElement("h3");
        title.textContent = session.name;

        const categoryText = document.createElement("p");
        categoryText.textContent = session.category;

        const dateText = document.createElement("p");
        dateText.textContent = session.date;

        const duration = document.createElement("div");
        duration.className = "session-duration";
        duration.textContent = formatTime(session.duration);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteSession(session.id);
        });

        info.appendChild(title);
        info.appendChild(categoryText);
        info.appendChild(dateText);

        const rightSide = document.createElement("div");

        rightSide.appendChild(duration);
        rightSide.appendChild(deleteButton);

        sessionElement.appendChild(info);
        sessionElement.appendChild(rightSide);

        sessionList.appendChild(sessionElement);

    });

}


// Initial load

renderSessions();



function renderSessions() {

    sessionList.innerHTML = "";

    // Total session count
    document.getElementById("totalSessions").textContent =
        sessions.length;

    document.getElementById("sessionCount").textContent =
        sessions.length + (
            sessions.length === 1 ? " session" : " sessions"
        );

    // Categories
    const categories = [
        "Physics",
        "Chemistry",
        "Maths",
        "Biology",
        "Sanskrit",
        "English"
    ];

    // Calculate time for each category
    const categoryStats = document.getElementById("categoryStats");

    categoryStats.innerHTML = "";

    categories.forEach(categoryName => {

        const totalMilliseconds = sessions
            .filter(session => session.category === categoryName)
            .reduce((total, session) => total + session.duration, 0);

        const totalMinutes = Math.floor(
            totalMilliseconds / 60000
        );

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        const card = document.createElement("div");

        card.className = "category-card";

        const title = document.createElement("span");
        title.textContent = categoryName;

        const time = document.createElement("h3");
        time.textContent = hours + "h " + minutes + "m";

        card.appendChild(title);
        card.appendChild(time);

        categoryStats.appendChild(card);

    });


    // Empty state
    if (sessions.length === 0) {

        sessionList.innerHTML = `
            <div class="empty">
                <span>📋</span>
                <p>No sessions yet.</p>
                <small>Start your first session!</small>
            </div>
        `;

        return;
    }


    // Display saved sessions
    sessions.forEach(session => {

        const sessionElement = document.createElement("div");
        sessionElement.className = "session";

        const info = document.createElement("div");
        info.className = "session-info";

        const title = document.createElement("h3");
        title.textContent = session.name;

        const categoryText = document.createElement("p");
        categoryText.textContent = session.category;

        const dateText = document.createElement("p");
        dateText.textContent = session.date;

        const duration = document.createElement("div");
        duration.className = "session-duration";
        duration.textContent = formatTime(session.duration);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteSession(session.id);
        });

        info.appendChild(title);
        info.appendChild(categoryText);
        info.appendChild(dateText);

        const rightSide = document.createElement("div");

        rightSide.appendChild(duration);
        rightSide.appendChild(deleteButton);

        sessionElement.appendChild(info);
        sessionElement.appendChild(rightSide);

        sessionList.appendChild(sessionElement);

    });

}



// ==================================
// CUSTOMIZABLE TIMETABLE
// ==================================

let timetableActivities = JSON.parse(
    localStorage.getItem("timetableActivities") || "[]"
);

let timetableCompleted = JSON.parse(
    localStorage.getItem("timetableCompleted") || "{}"
);

let selectedTimetableDay = new Date().getDay();
let editingTimetableId = null;

const timetableDays = [
    "Sunday", "Monday", "Tuesday",
    "Wednesday", "Thursday", "Friday", "Saturday"
];

const timetableList = document.getElementById("timetableList");
const activityForm = document.getElementById("activityForm");

function saveTimetable() {
    localStorage.setItem(
        "timetableActivities",
        JSON.stringify(timetableActivities)
    );

    localStorage.setItem(
        "timetableCompleted",
        JSON.stringify(timetableCompleted)
    );
}

// Open form

document.getElementById("addActivityBtn").addEventListener("click", () => {

    editingTimetableId = null;

    document.getElementById("formHeading").textContent =
        "Add New Activity";

    document.getElementById("activityName").value = "";
    document.getElementById("activitySubject").value = "Physics";
    document.getElementById("activityStart").value = "09:00";
    document.getElementById("activityEnd").value = "10:00";

    document.querySelectorAll(
        ".timetable-days input"
    ).forEach(input => input.checked = false);

    activityForm.classList.remove("hidden");

});

// Cancel form

document.getElementById("cancelActivityBtn").addEventListener("click", () => {
    activityForm.classList.add("hidden");
});

// Save activity

document.getElementById("saveActivityBtn").addEventListener("click", () => {

    const name = document.getElementById("activityName").value.trim();

    const subject = document.getElementById("activitySubject").value;

    const start = document.getElementById("activityStart").value;

    const end = document.getElementById("activityEnd").value;

    const days = [...document.querySelectorAll(
        ".timetable-days input:checked"
    )].map(input => Number(input.value));

    if (!name) {
        alert("Please enter an activity name.");
        return;
    }

    if (!start || !end || start >= end) {
        alert("Please enter valid start and end times.");
        return;
    }

    if (days.length === 0) {
        alert("Please select at least one day.");
        return;
    }

    const activityData = {
        name,
        subject,
        start,
        end,
        days
    };

    if (editingTimetableId !== null) {

        const activity = timetableActivities.find(
            item => item.id === editingTimetableId
        );

        if (activity) {
            Object.assign(activity, activityData);
        }

    } else {

        timetableActivities.push({
            id: Date.now() + "-" + Math.random(),
            ...activityData
        });

    }

    saveTimetable();

    activityForm.classList.add("hidden");

    editingTimetableId = null;

    renderTimetable();

});

// Edit activity

function editTimetableActivity(id) {

    const activity = timetableActivities.find(
        item => item.id === id
    );

    if (!activity) return;

    editingTimetableId = id;

    document.getElementById("formHeading").textContent =
        "Edit Activity";

    document.getElementById("activityName").value = activity.name;

    document.getElementById("activitySubject").value = activity.subject;

    document.getElementById("activityStart").value = activity.start;

    document.getElementById("activityEnd").value = activity.end;

    document.querySelectorAll(".timetable-days input").forEach(input => {
        input.checked = activity.days.includes(Number(input.value));
    });

    activityForm.classList.remove("hidden");

    activityForm.scrollIntoView({
        behavior: "smooth"
    });

}

// Delete activity

function deleteTimetableActivity(id) {

    if (!confirm("Delete this activity?")) return;

    timetableActivities = timetableActivities.filter(
        item => item.id !== id
    );

    saveTimetable();

    renderTimetable();

}

// Mark complete

function completeTimetableActivity(id, checked) {

    const today = new Date().toLocaleDateString("en-CA");

    if (!timetableCompleted[today]) {
        timetableCompleted[today] = [];
    }

    if (checked) {

        if (!timetableCompleted[today].includes(id)) {
            timetableCompleted[today].push(id);
        }

    } else {

        timetableCompleted[today] =
            timetableCompleted[today].filter(item => item !== id);

    }

    saveTimetable();

    renderTimetable();

}

// Weekday filters

document.querySelectorAll("#weekdayFilter button").forEach(button => {

    button.addEventListener("click", () => {

        selectedTimetableDay = Number(button.dataset.day);

        renderTimetable();

    });

});

// Render timetable

function renderTimetable() {

    const today = new Date();

    document.getElementById("timetableDate").textContent =
        today.toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    document.querySelectorAll("#weekdayFilter button").forEach(button => {

        button.classList.toggle(
            "active",
            Number(button.dataset.day) === selectedTimetableDay
        );

    });

    timetableList.innerHTML = "";

    const activities = timetableActivities
        .filter(activity =>
            activity.days.includes(selectedTimetableDay)
        )
        .sort((a, b) => a.start.localeCompare(b.start));

    const date = new Date();

    const selectedDate = new Date(date);
    selectedDate.setDate(
        date.getDate() +
        (selectedTimetableDay - date.getDay() + 7) % 7
    );

    const dateKey = selectedDate.toLocaleDateString("en-CA");

    const completed = timetableCompleted[dateKey] || [];

    if (activities.length === 0) {

        timetableList.innerHTML = `
            <div class="timetable-empty">
                📅
                <p>No activities planned for ${timetableDays[selectedTimetableDay]}.</p>
            </div>
        `;

        return;

    }

    activities.forEach(activity => {

        const isCompleted = completed.includes(activity.id);

        const card = document.createElement("div");

        card.className = "timetable-activity";

        if (isCompleted) {
            card.classList.add("completed");
        }

        const info = document.createElement("div");

        const title = document.createElement("h3");
        title.className = "activity-title";
        title.textContent = activity.name;

        const time = document.createElement("p");
        time.className = "activity-time";
        time.textContent = activity.start + " – " + activity.end;

        const subject = document.createElement("p");
        subject.className = "activity-subject";
        subject.textContent = activity.subject;

        info.append(title, time, subject);

        const actions = document.createElement("div");
        actions.className = "activity-actions";

        const completeLabel = document.createElement("label");
        completeLabel.className = "activity-complete";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = isCompleted;

        checkbox.addEventListener("change", () => {
            completeTimetableActivity(
                activity.id,
                checkbox.checked
            );
        });

        completeLabel.append(
            checkbox,
            document.createTextNode("Done")
        );

        const edit = document.createElement("button");
        edit.className = "activity-edit";
        edit.textContent = "Edit";

        edit.addEventListener("click", () => {
            editTimetableActivity(activity.id);
        });

        const remove = document.createElement("button");
        remove.className = "activity-delete";
        remove.textContent = "Delete";

        remove.addEventListener("click", () => {
            deleteTimetableActivity(activity.id);
        });

        actions.append(completeLabel, edit, remove);

        card.append(info, actions);

        timetableList.appendChild(card);

    });

}

// Initial display

renderTimetable();
