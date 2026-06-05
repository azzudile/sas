/* ============================================
   To-Do List Application - JavaScript
   Local Storage Functionality
   ============================================ */

class TodoApp {
  constructor() {
    this.todos = [];
    this.currentFilter = 'all';
    this.editingId = null;
    this.storageKey = 'todos_app';
    
    this.initElements();
    this.loadTodos();
    this.attachEventListeners();
    this.render();
  }

  /* ============================================
     Initialize DOM Elements
     ============================================ */

  initElements() {
    this.form = document.getElementById('todoForm');
    this.input = document.getElementById('todoInput');
    this.todoList = document.getElementById('todoList');
    this.emptyState = document.getElementById('emptyState');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
    this.clearAllBtn = document.getElementById('clearAllBtn');
    this.totalCount = document.getElementById('totalCount');
    this.progressPercent = document.getElementById('progressPercent');
  }

  /* ============================================
     Event Listeners
     ============================================ */

  attachEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleAddTodo(e));

    // Filter buttons
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilter(e));
    });

    // Action buttons
    this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    this.clearAllBtn.addEventListener('click', () => this.clearAll());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.cancelEdit();
      }
    });
  }

  /* ============================================
     Local Storage Management
     ============================================ */

  saveTodos() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
  }

  loadTodos() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.todos = JSON.parse(stored);
      } catch (e) {
        console.error('Error loading todos:', e);
        this.todos = [];
      }
    }
  }

  /* ============================================
     Todo Management
     ============================================ */

  handleAddTodo(e) {
    e.preventDefault();
    
    const text = this.input.value.trim();
    if (!text) {
      this.input.focus();
      return;
    }

    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.unshift(todo);
    this.saveTodos();
    this.input.value = '';
    this.input.focus();
    this.render();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveTodos();
    this.render();
  }

  startEdit(id) {
    this.editingId = id;
    this.render();
    const input = document.getElementById(`edit-input-${id}`);
    if (input) {
      input.focus();
      input.select();
    }
  }

  saveEdit(id, newText) {
    const text = newText.trim();
    if (!text) {
      this.cancelEdit();
      return;
    }

    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.text = text;
      this.editingId = null;
      this.saveTodos();
      this.render();
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.render();
  }

  clearCompleted() {
    if (confirm('Are you sure you want to clear all completed tasks?')) {
      this.todos = this.todos.filter(t => !t.completed);
      this.saveTodos();
      this.render();
    }
  }

  clearAll() {
    if (confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
      this.todos = [];
      this.saveTodos();
      this.render();
    }
  }

  /* ============================================
     Filtering
     ============================================ */

  handleFilter(e) {
    this.filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.closest('.filter-btn').classList.add('active');
    this.currentFilter = e.target.closest('.filter-btn').dataset.filter;
    this.render();
  }

  getFilteredTodos() {
    switch (this.currentFilter) {
      case 'active':
        return this.todos.filter(t => !t.completed);
      case 'completed':
        return this.todos.filter(t => t.completed);
      case 'all':
      default:
        return this.todos;
    }
  }

  /* ============================================
     Statistics
     ============================================ */

  updateStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    this.totalCount.textContent = total;
    this.progressPercent.textContent = percentage + '%';

    // Update filter counts
    const allCount = this.todos.length;
    const activeCount = this.todos.filter(t => !t.completed).length;
    const completedCount = this.todos.filter(t => t.completed).length;

    document.querySelectorAll('.filter-btn').forEach(btn => {
      const filter = btn.dataset.filter;
      const countEl = btn.querySelector('.count');
      
      if (filter === 'all') countEl.textContent = allCount;
      else if (filter === 'active') countEl.textContent = activeCount;
      else if (filter === 'completed') countEl.textContent = completedCount;
    });
  }

  /* ============================================
     Rendering
     ============================================ */

  render() {
    this.renderTodos();
    this.updateStats();
    this.updateEmptyState();
    this.updateActionButtons();
  }

  renderTodos() {
    const filtered = this.getFilteredTodos();
    this.todoList.innerHTML = '';

    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      
      if (this.editingId === todo.id) {
        // Edit mode
        li.innerHTML = `
          <input 
            type="text" 
            id="edit-input-${todo.id}"
            class="edit-input"
            value="${this.escapeHtml(todo.text)}"
          >
          <div class="edit-actions">
            <button class="save-btn" onclick="app.saveEdit(${todo.id}, document.getElementById('edit-input-${todo.id}').value)">
              Save
            </button>
            <button class="cancel-btn" onclick="app.cancelEdit()">
              Cancel
            </button>
          </div>
        `;
      } else {
        // View mode
        li.innerHTML = `
          <input 
            type="checkbox" 
            class="todo-checkbox"
            ${todo.completed ? 'checked' : ''}
            onchange="app.toggleTodo(${todo.id})"
          >
          <span class="todo-text">${this.escapeHtml(todo.text)}</span>
          <div class="todo-actions">
            <button class="todo-btn edit-btn" onclick="app.startEdit(${todo.id})" title="Edit">
              ✏️
            </button>
            <button class="todo-btn delete-btn" onclick="app.deleteTodo(${todo.id})" title="Delete">
              🗑️
            </button>
          </div>
        `;
      }

      this.todoList.appendChild(li);
    });
  }

  updateEmptyState() {
    const filtered = this.getFilteredTodos();
    if (filtered.length === 0) {
      this.emptyState.classList.remove('hidden');
    } else {
      this.emptyState.classList.add('hidden');
    }
  }

  updateActionButtons() {
    const hasCompleted = this.todos.some(t => t.completed);
    this.clearCompletedBtn.disabled = !hasCompleted;

    const hasAny = this.todos.length > 0;
    this.clearAllBtn.disabled = !hasAny;
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new TodoApp();
});
