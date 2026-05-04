const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");
const clearAllBtn = document.getElementById("clearAllBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateCounter() {
    taskCounter.textContent = `${tasks.length} task(s) total`;
}

function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");

        li.setAttribute("draggable", true);
        li.setAttribute("data-index", index);

        if (task.completed) {
            li.classList.add("completed");
        }

        li.innerHTML = `
        
            <span onclick="editTask(${index})">${task.text}</span>
            <div class="task-buttons">
                <button class="complete-btn" onclick="toggleTask(${index})">✓</button>
                <button class="delete-btn" onclick="deleteTask(${index})">✗</button>
            </div>
        `;

        taskList.appendChild(li);
    });

    updateCounter();
}

function editTask(index) {
    const newText = prompt("Edit your task:", tasks[index].text);

    if (newText !== null && newText.trim() !== "") {
        tasks[index].text = newText.trim();
        saveTasks();
        renderTasks();
    }
}

addTaskBtn.addEventListener("click", () => {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    tasks.push({
        text: taskText,
        completed: false
    });

    taskInput.value = "";
    saveTasks();
    renderTasks();
});

taskInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        addTaskBtn.click();
    }
});

clearAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all tasks?")) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
});

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

let undoStack = [];

function deleteTask(index) {
    const deleted = {
        task: tasks[index],
        index: index
    };

    undoStack.push(deleted);

    tasks.splice(index, 1);
    saveTasks();
    renderTasks();

    showUndo();
}

function showUndo() {
    const undoBar = document.createElement("div");
    undoBar.id = "undoBar";
    undoBar.innerHTML = `
        Task deleted.
        <button onclick="undoDelete()">Undo</button>
    `;

    document.body.appendChild(undoBar);

    setTimeout(() => {
        undoBar.remove();
        undoStack.pop(); // discard undo if expired
    }, 5000);
}

function undoDelete() {
    const lastAction = undoStack.pop();

    if (!lastAction) return;

    tasks.splice(lastAction.index, 0, lastAction.task);

    saveTasks();
    renderTasks();

    document.getElementById("undoBar")?.remove();
}

let draggedIndex = null;

new Sortable(taskList, {
    animation: 150,

    onEnd: function (evt) {
        const movedItem = tasks.splice(evt.oldIndex, 1)[0];
        tasks.splice(evt.newIndex, 0, movedItem);

        saveTasks();
        renderTasks();
    }
});

new Sortable(taskList, {
    animation: 150,
    delay: 150,
    delayOnTouchOnly: true,
    onEnd: function (evt) {
        const movedItem = tasks.splice(evt.oldIndex, 1)[0];
        tasks.splice(evt.newIndex, 0, movedItem);

        saveTasks();
        renderTasks();
    }
});

renderTasks();
