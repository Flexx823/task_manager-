
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const priorityInput = document.getElementById("priority");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");

let tasks = [];

try {
    const saved = JSON.parse(
        localStorage.getItem("taskflow-tasks") || "[]"
    );

    if (Array.isArray(saved)) {
        tasks = saved.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            typeof task.completed === "boolean" &&
            ["Low", "Medium", "High"].includes(task.priority)
        );
    }
} catch {
    tasks = [];
}

let currentFilter = "all";

document.getElementById("today").textContent =
    new Date().toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    });

function saveTasks() {
    try {
        localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
    } catch {
        alert("Could not save tasks. Check your browser storage settings.");
    }
}

function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = tasks.filter(task => {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true;
    });

    visibleTasks.forEach(task => {
        const item = document.createElement("li");
        item.className = "task" + (task.completed ? " done" : "");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Complete task");

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const content = document.createElement("div");
        content.className = "task-content";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.title;

        const badge = document.createElement("span");
        badge.className = "priority " + task.priority;
        badge.textContent = task.priority + " priority";

        content.append(title, badge);

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete " + task.title);

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, content, deleteButton);
        taskList.appendChild(item);
    });

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const remaining = total - completed;
    const progress = total ? Math.round(completed / total * 100) : 0;

    document.getElementById("total").textContent = total;
    document.getElementById("completed").textContent = completed;
    document.getElementById("remaining").textContent = remaining;
    document.getElementById("progress-text").textContent = progress + "%";
    document.getElementById("progress-bar").style.width = progress + "%";

    emptyMessage.hidden = visibleTasks.length > 0;
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const title = input.value.trim();
    if (!title) return;

    tasks.unshift({
        id: crypto.randomUUID(),
        title: title,
        priority: priorityInput.value,
        completed: false
    });

    saveTasks();
    currentFilter = "all";

    document.querySelectorAll(".filter").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === "all"
        );
    });

    form.reset();
    input.focus();
    renderTasks();
});

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter").forEach(filter => {
            filter.classList.toggle("active", filter === button);
        });

        renderTasks();
    });
});

document.getElementById("clear-completed").addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
});

renderTasks();
