// ---------------- POMODORO TIMER ----------------
let timer;
let timeLeft = 25 * 60;
let running = false;
function updateTimer() {
    const timerBox =
        document.getElementById("timer");
    if (!timerBox) {
        return;
    }
    let minutes =
        Math.floor(timeLeft / 60);
    let seconds =
        timeLeft % 60;
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    timerBox.innerText =
        minutes + ":" + seconds;
}
function startTimer() {
    if (running) {
        return;
    }
    running = true;
    timer = setInterval(function() {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timer);
            running = false;
            const message =
                document.getElementById(
                    "timerMessage"
                );
            if (message) {
                message.innerText =
                    "Study session completed! Take a short break.";
            }
        }
    }, 1000);
}
function pauseTimer() {
    clearInterval(timer);
    running = false;
    const message =
        document.getElementById("timerMessage");
    if (message) {
        message.innerText = "Timer paused.";
    }
}
function resetTimer() {
    clearInterval(timer);
    running = false;
    timeLeft = 25 * 60;
    updateTimer();
    const message =
        document.getElementById("timerMessage");
    if (message) {
        message.innerText = "";
    }
}
updateTimer();
// ---------------- TASK SEARCH ----------------
function searchTasks() {
    const input =
        document.getElementById("searchTask");
    if (!input) {
        return;
    }
    const searchText =
        input.value.toLowerCase();
    const tasks =
        document.querySelectorAll(".task-item");
    tasks.forEach(function(task) {
        const text =
            task.innerText.toLowerCase();
        if (text.includes(searchText)) {
            task.style.display = "flex";
        } else {
            task.style.display = "none";
        }
    });
}