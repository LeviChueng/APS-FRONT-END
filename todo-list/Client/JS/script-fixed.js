const API_URL = "http://localhost:8000/auth"; 
const API_TASKS = "http://localhost:8000/tasks"; // URL correta para tarefas

// ==================== LOGIN ====================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            console.log("Login response:", data);

            if (res.ok && data.user) {
                localStorage.setItem("token", data.access_token || ''); // Armazenar TOKEN
                localStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "tasks.html";
            } else {
                alert(data.message || "Email ou senha incorretos.");
            }
        } catch (err) {
            console.error(err);
            alert("Erro na conexão com o servidor.");
        }
    });
}

// ==================== REGISTRO ====================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(`${API_URL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            console.log("Status:", res.status);

            const data = await res.json();
            console.log("Registro response:", data);

            if (res.ok) {
                localStorage.setItem("token", data.access_token || ''); // Armazenar TOKEN
                localStorage.setItem("user", JSON.stringify(data.user));
                alert("Usuário registrado com sucesso!");
                window.location.href = "tasks.html";
            } else {
                alert(data.message || "Erro no registro. Email já cadastrado?");
            }
        } catch (err) {
            console.error(err);
            alert("Erro na conexão com o servidor.");
        }
    });
}

// ==================== TAREFAS ====================
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const logoutBtn = document.getElementById("logoutBtn");

const user = JSON.parse(localStorage.getItem("user") || 'null');
const token = localStorage.getItem("token") || '';

if ((!user || !token) && window.location.pathname.includes("tasks.html")) {
    window.location.href = "login.html";
}

// ==================== LOGOUT ====================
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "login.html";
    });
}

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
};

// ==================== FUNÇÕES DE TAREFAS ====================
async function loadTasks() {
    if (!taskList) return;

    try {
        const res = await fetch(API_TASKS, { headers }); // URL corrigida
        const data = await res.json();
        console.log("Tarefas:", data);

        taskList.innerHTML = "";
        (data.tasks || data || []).forEach(task => {
            const li = document.createElement("li");
            li.textContent = task.title;

            const editBtn = document.createElement("button");
            editBtn.textContent = "Editar";
            editBtn.addEventListener("click", () => editTask(task.id, task.title));

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Excluir";
            deleteBtn.addEventListener("click", () => deleteTask(task.id));

            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });

    } catch (err) {
        console.error(err);
        alert("Erro ao carregar tarefas.");
    }
}

// Criar nova tarefa
if (taskForm) {
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("taskInput").value;

        try {
            const res = await fetch(API_TASKS, { // URL corrigida
                method: "POST",
                headers,
                body: JSON.stringify({ title })
            });

            if (res.ok) {
                document.getElementById("taskInput").value = "";
                loadTasks();
            } else {
                const data = await res.json();
                alert(data.message || "Erro ao criar tarefa.");
            }
        } catch (err) {
            console.error(err);
            alert("Erro na conexão com o servidor.");
        }
    });
}

// Editar tarefa
async function editTask(id, oldTitle) {
    const newTitle = prompt("Editar tarefa:", oldTitle);
    if (!newTitle) return;

    try {
        const res = await fetch(`${API_TASKS}/${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ title: newTitle })
        });

        if (res.ok) loadTasks();
        else {
            const data = await res.json();
            alert(data.message || "Erro ao editar tarefa.");
        }
    } catch (err) {
        console.error(err);
        alert("Erro na conexão com o servidor.");
    }
}

// Excluir tarefa
async function deleteTask(id) {
    if (!confirm("Deseja realmente excluir esta tarefa?")) return;

    try {
        const res = await fetch(`${API_TASKS}/${id}`, { 
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) loadTasks();
        else {
            const data = await res.json();
            alert(data.message || "Erro ao excluir tarefa.");
        }
    } catch (err) {
        console.error(err);
        alert("Erro na conexão com o servidor.");
    }
}

// Carregar tarefas ao abrir a página
if (taskList) loadTasks();
