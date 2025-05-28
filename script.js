// Task Tracker with localStorage - Complete JavaScript File
// Save this as 'script.js' and include it in your HTML

// Global variables
let tasks = [];
let currentFilter = 'all';
const STORAGE_KEY = 'taskflow_tasks';
const FILTER_KEY = 'taskflow_filter';

// ===== LOCALSTORAGE FUNCTIONS =====

function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        localStorage.setItem(FILTER_KEY, currentFilter);
        console.log('💾 Saved:', tasks.length, 'tasks to localStorage');
        return true;
    } catch (error) {
        console.error('❌ Save failed:', error);
        return false;
    }
}

function loadFromLocalStorage() {
    try {
        // Load tasks
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);
            if (Array.isArray(parsedTasks)) {
                tasks = parsedTasks;
                console.log('📂 Loaded:', tasks.length, 'tasks from localStorage');
            }
        }

        // Load filter
        const savedFilter = localStorage.getItem(FILTER_KEY);
        if (savedFilter) {
            currentFilter = savedFilter;
        }

        return true;
    } catch (error) {
        console.error('❌ Load failed:', error);
        tasks = [];
        currentFilter = 'all';
        return false;
    }
}

function clearLocalStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(FILTER_KEY);
        console.log('🗑️ localStorage cleared');
        return true;
    } catch (error) {
        console.error('❌ Clear failed:', error);
        return false;
    }
}

// ===== TASK MANAGEMENT FUNCTIONS =====

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    
    if (!taskInput || !prioritySelect) {
        console.error('❌ Input elements not found');
        return false;
    }

    const taskText = taskInput.value.trim();
    if (!taskText) {
        // Visual feedback for empty input
        taskInput.style.borderColor = '#ff6b6b';
        taskInput.focus();
        setTimeout(() => {
            taskInput.style.borderColor = '#e1e8ed';
        }, 1500);
        return false;
    }

    // Create new task
    const newTask = {
        id: Date.now() + Math.random(), // Ensure unique ID
        text: taskText,
        priority: prioritySelect.value,
        completed: false,
        createdAt: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString()
    };

    // Add to beginning of array
    tasks.unshift(newTask);
    
    // Clear input
    taskInput.value = '';
    
    // Save and update
    saveToLocalStorage();
    updateDisplay();
    
    // Success feedback
    taskInput.style.borderColor = '#4ecdc4';
    setTimeout(() => {
        taskInput.style.borderColor = '#e1e8ed';
    }, 1000);

    console.log('✅ Task added:', newTask.text);
    return true;
}

function toggleTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
        console.error('❌ Task not found:', taskId);
        return false;
    }

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveToLocalStorage();
    updateDisplay();
    
    console.log('🔄 Task toggled:', tasks[taskIndex].text, '- Completed:', tasks[taskIndex].completed);
    return true;
}

function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
        console.error('❌ Task not found:', taskId);
        return false;
    }

    const deletedTask = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    saveToLocalStorage();
    updateDisplay();
    
    console.log('🗑️ Task deleted:', deletedTask.text);
    return true;
}

// ===== FILTER FUNCTIONS =====

function setFilter(filter) {
    currentFilter = filter;
    saveToLocalStorage();
    updateFilterButtons();
    updateTaskDisplay();
    console.log('🔍 Filter changed to:', filter);
}

function updateFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        
        const btnText = btn.textContent.toLowerCase();
        let isActive = false;

        switch (currentFilter) {
            case 'all':
                isActive = btnText.includes('all');
                break;
            case 'pending':
                isActive = btnText.includes('pending');
                break;
            case 'completed':
                isActive = btnText.includes('completed');
                break;
            case 'high':
                isActive = btnText.includes('high');
                break;
        }

        if (isActive) {
            btn.classList.add('active');
        }
    });
}

// ===== DISPLAY FUNCTIONS =====

function getFilteredTasks() {
    switch (currentFilter) {
        case 'pending':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        case 'high':
            return tasks.filter(task => task.priority === 'high');
        case 'all':
        default:
            return tasks;
    }
}

function updateTaskDisplay() {
    const tasksList = document.getElementById('tasksList');
    if (!tasksList) {
        console.error('❌ Tasks list element not found');
        return;
    }

    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = getEmptyStateHTML();
        return;
    }

    const tasksHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-header">
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="priority-badge priority-${task.priority}">${task.priority}</div>
            </div>
            <div class="task-date">Added: ${task.createdAt}</div>
            <div class="task-actions">
                <button class="btn btn-complete" onclick="toggleTask(${task.id})">
                    ${task.completed ? '↩️ Undo' : '✅ Complete'}
                </button>
                <button class="btn btn-delete" onclick="deleteTask(${task.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');

    tasksList.innerHTML = tasksHTML;
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update stat elements
    const elements = {
        totalTasks: total,
        pendingTasks: pending,
        completedTasks: completed,
        progressPercent: progress + '%'
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

function updateDisplay() {
    updateTaskDisplay();
    updateStats();
    updateFilterButtons();
}

// ===== UTILITY FUNCTIONS =====

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getEmptyStateHTML() {
    const messages = {
        all: { icon: '📝', title: 'No tasks yet!', subtitle: 'Add your first task above to get started.' },
        pending: { icon: '⏳', title: 'No pending tasks!', subtitle: 'Great job! All tasks are completed.' },
        completed: { icon: '🎉', title: 'No completed tasks yet!', subtitle: 'Complete some tasks to see them here.' },
        high: { icon: '🔥', title: 'No high priority tasks!', subtitle: 'No urgent tasks at the moment.' }
    };

    const message = messages[currentFilter] || messages.all;

    return `
        <div class="empty-state">
            <div class="empty-icon">${message.icon}</div>
            <h3>${message.title}</h3>
            <p>${message.subtitle}</p>
        </div>
    `;
}

// ===== EVENT HANDLERS =====

function setupEventListeners() {
    // Enter key handler for task input
    const taskInput = document.getElementById('taskInput');
    if (taskInput) {
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }

    // Filter button handlers
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const filters = ['all', 'pending', 'completed', 'high'];
            setFilter(filters[index] || 'all');
        });
    });

    console.log('🎯 Event listeners set up');
}

// ===== INITIALIZATION =====

function initializeApp() {
    console.log('🚀 Initializing Task Tracker...');

    // Load data from localStorage
    loadFromLocalStorage();

    // Set up event listeners
    setupEventListeners();

    // Update display
    updateDisplay();

    console.log('✅ Task Tracker initialized successfully!');
    console.log('📊 Current state:', {
        totalTasks: tasks.length,
        currentFilter: currentFilter,
        localStorageSupported: typeof(Storage) !== "undefined"
    });
}

// ===== GLOBAL FUNCTIONS FOR HTML ONCLICK EVENTS =====

// Make functions available globally for HTML onclick events
window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.filterTasks = setFilter;

// ===== START THE APP =====

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Debug functions (available in console)
window.taskDebug = {
    showTasks: () => console.table(tasks),
    clearAll: () => {
        tasks = [];
        saveToLocalStorage();
        updateDisplay();
        console.log('🗑️ All tasks cleared');
    },
    exportTasks: () => JSON.stringify(tasks, null, 2),
    importTasks: (jsonData) => {
        try {
            tasks = JSON.parse(jsonData);
            saveToLocalStorage();
            updateDisplay();
            console.log('📥 Tasks imported successfully');
        } catch (error) {
            console.error('❌ Import failed:', error);
        }
    }
};