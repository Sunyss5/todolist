const dateElement = document.getElementById("date");
const profileName = document.getElementById("profile-name");
const profileRole = document.getElementById("profile-role");
const todoElement = document.getElementById("todo");
const todoName = document.getElementById("todo-name");
const todoPosition = document.getElementById("todo-position");
const todoInput = document.getElementById("todo-input");
const todoSetPriority = document.getElementById("todo-set-priority");
const todoSetDate = document.getElementById("todo-set-date");
const todoSubmit = document.getElementById("btn-submit-task");
const todosContainer = document.getElementById("todos-container");
const filtersContainer = document.querySelector(".filters");
const filterButtons = document.querySelectorAll(".filter-btn");
const itemsLeft = document.getElementById("items-left");
const clearDone = document.getElementById("clear-done");
const emptyState = document.querySelector(".empty-state");

let todos = [];
let currentFilter = "all";

// menampilkan waktu saat ini
const now = new Date();
const tahun = now.getFullYear();
const bulan = String(now.getMonth() + 1).padStart(2, "0");
const tanggal = String(now.getDate()).padStart(2, "0");
const todayISO = `${tahun}-${bulan}-${tanggal}`;

dateElement.textContent = now.toLocaleDateString("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

// menambahkan todo baru
const tugasBaru = () => {
  // Set default input tgl jadi saat ini jika kosong
  if (todoSetDate.value === "") {
    todoSetDate.value = todayISO;
  }

  // Update tampilan Nama & Jabatan di Header jika diisi
  if (todoName.value.trim() !== "") {
    profileName.textContent = todoName.value.trim();
  }
  if (todoPosition.value.trim() !== "") {
    profileRole.textContent = todoPosition.value.trim();
  }

  // simpan todo dalam objek (termasuk name & position)
  const todo = {
    id: Date.now(),
    name: todoName.value.trim(),
    position: todoPosition.value.trim(),
    desc: todoInput.value.trim(),
    priority: todoSetPriority.value,
    deadline: todoSetDate.value,
    completed: false,
  };

  // simpan todo di array todos
  todos.push(todo);

  // simpan di local storage
  saveTodos();

  // render todos dari local storage
  renderTodos()

  // mengosongkan input setelah submit dan di render
  todoName.value = "";
  todoPosition.value = "";
  todoInput.value = "";

};

// simpan di local storage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
  updateItemsCount();
  checkEmptyState();
}

// update otomatis sisa item dalam todos
function updateItemsCount() {
  // filter uncompleted
  const uncompletedTodos = todos.filter((todo) => !todo.completed);
  itemsLeft.textContent = `${uncompletedTodos.length} ToDo Left`;
}

// cek jika empty tampilkan empty state
function checkEmptyState() {
  const filteredTodos = filterTodos(currentFilter);
  if (filteredTodos.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }
}

// logika filter todo
function filterTodos(filter) {
  switch (filter) {
    case "active":
      return todos.filter(
        (todo) => !todo.completed && todo.deadline >= todayISO,
      );
    case "done":
      return todos.filter((todo) => todo.completed);
    case "overdue":
      return todos.filter(
        (todo) => !todo.completed && todo.deadline < todayISO,
      );
    default:
      return todos;
  }
}

// render todos ke todos container
function renderTodos() {
  todosContainer.innerHTML = "";

  // stop jika kosong
  const filteredTodos = filterTodos(currentFilter);
  if (filteredTodos.length === 0) return

  // Langsung manfaatkan fungsi filterTodos() milikmu di sini:
  const groups = [
    {
      key: "active",
      title: "To Do (Harus Dikerjakan)",
      titleClass: "",
      items: filterTodos("active"),
    },
    {
      key: "overdue",
      title: "Overdue (Terlambat)",
      titleClass: "title-overdue",
      items: filterTodos("overdue"),
    },
    {
      key: "done",
      title: "Done (Selesai)",
      titleClass: "title-done",
      items: filterTodos("done"),
    },
  ];

  groups.forEach((group) => {
    if ((currentFilter === "all" || currentFilter === group.key) && group.items.length > 0) {
      const todoGroup = document.createElement("div");
      todoGroup.classList.add("todo-group");

      const groupTitle = document.createElement("h3");
      groupTitle.classList.add("todo-group-title");

      if (group.titleClass !== "") {
        groupTitle.classList.add(group.titleClass);
      }
      groupTitle.textContent = `${group.title} (${group.items.length})`;
      const todoListItems = document.createElement("ul");
      todoListItems.classList.add("todo-list-items");

      group.items.forEach((todo) => {
        const isOverdue = !todo.completed && todo.deadline < todayISO;
        const todoItem = document.createElement("li");
        todoItem.classList.add("todo-item");
        if (todo.completed) {
          todoItem.classList.add("is-done");
        }
        todoItem.innerHTML = `
          <label class="todo-label">
            <input type="checkbox" class="todo-checkbox" data-id="${todo.id}" ${todo.completed ? "checked" : ""} />
            <div class="todo-content">
              <p class="todo-text">${todo.desc}</p>
              <div class="todo-meta">
                <span class="todo-author">👤 ${todo.name} (${todo.position})</span>
                <span class="badge badge-${todo.priority}">${todo.priority}</span>
                <span class="todo-date">📅 ${todo.deadline}</span>
                ${isOverdue ? '<span class="badge badge-overdue">⚠️ Overdue</span>' : ""}
                ${todo.completed ? '<span class="badge badge-done">✓ Done</span>' : ""}
              </div>
            </div>
          </label>
          <button type="button" class="btn-delete-item" data-id="${todo.id}">✕</button>
        `;
        // Ambil tombol yang ada di dalam todoItem ini, lalu pasang event click:
        const deleteBtn = todoItem.querySelector(".btn-delete-item");
        deleteBtn.addEventListener("click", () => deleteTodo(todo.id));
        const checkbox = todoItem.querySelector(".todo-checkbox");
        checkbox.addEventListener("change", () => toggleTodo(todo.id));

        todoListItems.appendChild(todoItem);
      });
      todoGroup.appendChild(groupTitle);
      todoGroup.appendChild(todoListItems);
      todosContainer.appendChild(todoGroup);
      
    }
  });
}

// simpan local storage walaupun di refresh
function loadTodos() {
  const storedTodos = localStorage.getItem("todos");
  if (storedTodos) {
    todos = JSON.parse(storedTodos);
    renderTodos()
    updateItemsCount()
    checkEmptyState()
  }
}
window.addEventListener("DOMContentLoaded", () => {
  loadTodos()
})

// delete todo x
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos()
  renderTodos() 
}

// toggle todo ke done
function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  saveTodos();
  renderTodos();
}

// hapus semua todo yang done
function clearAllDone() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
}
clearDone.addEventListener("click", () => {
  clearAllDone()
})

// pindah antara filter
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveFilter(button.getAttribute("data-filter"));
  });
});

function setActiveFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((item) => {
    if (item.getAttribute("data-filter") === filter) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  renderTodos();
  checkEmptyState();
}

// submit todo baru
todoSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  tugasBaru();
});

todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    tugasBaru();
  }
});
