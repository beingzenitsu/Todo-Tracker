import { useEffect, useState } from "react";
import api from "../api/api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./TodoList.css";

export default function TodoList({ token, setToken, username }) {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState("todo");
  const [newCategory, setNewCategory] = useState("General");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // Fetch todos safely
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await api.get("/todos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const todosArray = Array.isArray(res.data) ? res.data : res.data.todos || [];
        setTodos(todosArray);
      } catch (err) {
        console.error("Error fetching todos:", err);
        setTodos([]);
      }
    };
    if (token) fetchTodos();
  }, [token]);

  // Reminders notification
  useEffect(() => {
    const interval = setInterval(() => {
      todos.forEach(todo => {
        if (todo.reminder && todo.dueDate && !todo.completed && !todo.notified) {
          const due = new Date(todo.dueDate);
          const now = new Date();
          if (now >= due) {
            new Notification(`Task due: ${todo.title}`);
            todo.notified = true;
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [todos]);

  const addTodo = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await api.post(
        "/todos",
        {
          title: newTitle,
          description: newDescription,
          status: newStatus,
          category: newCategory,
          priority: newPriority,
          dueDate: newDueDate,
          reminder: !!newDueDate
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos([...todos, res.data]);
      setNewTitle("");
      setNewDescription("");
      setNewStatus("todo");
      setNewCategory("General");
      setNewPriority("medium");
      setNewDueDate("");
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const res = await api.patch(`/todos/${id}/toggle`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(todos.map(todo => (todo._id === id ? res.data : todo)));
    } catch (err) {
      console.error("Error toggling todo:", err);
    }
  };

  const startEditing = (todo) => {
    setEditingId(todo._id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setEditStatus(todo.status);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditStatus("");
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) return;
    try {
      const res = await api.put(
        `/todos/${id}`,
        { title: editTitle, description: editDescription, status: editStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos(todos.map(todo => (todo._id === id ? res.data : todo)));
      cancelEditing();
    } catch (err) {
      console.error("Error editing todo:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // Safe filtering
  const filteredTodos = (todos || [])
    .filter(todo => todo.title.toLowerCase().includes(search.toLowerCase()))
    .filter(todo => !filterStatus || todo.status === filterStatus);

  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setTodos(items);
  };

  return (
    <div className={darkMode ? "todo-container dark" : "todo-container light"}>
      <nav className="todo-nav">
        <h1>Todo Tracker</h1>
        <div>
          <span>Welcome, {username}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
          <button className="mode-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </nav>

      {/* Add Task Section */}
      <div className="todo-add-row">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Task title"
        />
        <input
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Description (optional)"
        />
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
          <option>General</option>
          <option>Work</option>
          <option>Personal</option>
          <option>Urgent</option>
        </select>
        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
        <button onClick={addTodo}>Add</button>
      </div>

      {/* Search & Filter */}
      <div className="todo-search-filter">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Stats */}
      <div className="todo-stats">
        <span>Total: {total}</span>
        <span>Completed: {completed}</span>
        <span>Pending: {pending}</span>
      </div>

      {/* Task List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <div className="todo-list" {...provided.droppableProps} ref={provided.innerRef}>
              {filteredTodos.map((todo, index) => (
                <Draggable key={todo._id} draggableId={todo._id} index={index}>
                  {(provided) => (
                    <div
                      className={`todo-item ${todo.completed ? "completed" : ""}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {editingId === todo._id ? (
                        <div className="todo-editing">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                          />
                          <input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Description"
                          />
                          <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                          <button onClick={() => saveEdit(todo._id)}>Save</button>
                          <button onClick={cancelEditing}>Cancel</button>
                        </div>
                      ) : (
                        <div className="todo-view">
                          <div>
                            <strong>{todo.title}</strong>
                            {todo.description && <p className="desc">{todo.description}</p>}
                            <div className="badges">
                              <span className={`category ${todo.category.toLowerCase()}`}>{todo.category}</span>
                              <span className={`priority ${todo.priority}`}>{todo.priority}</span>
                              <span className={`status ${todo.status.replace("_", " ")}`}>{todo.status.replace("_", " ")}</span>
                              {todo.dueDate && (
                                <span className={`due-date ${new Date(todo.dueDate) < new Date() ? "overdue" : ""}`}>
                                  Due: {new Date(todo.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <button onClick={() => toggleTodo(todo._id)}>Toggle</button>
                            <button onClick={() => startEditing(todo)}>Edit</button>
                            <button onClick={() => deleteTodo(todo._id)}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
