let tasks = [];
        let currentFilter = 'all';

        // Add task functionality
        function addTask() {
            const taskInput = document.getElementById('taskInput');
            const prioritySelect = document.getElementById('prioritySelect');
            
            const taskText = taskInput.value.trim();
            if (!taskText) {
                taskInput.style.borderColor = '#ff6b6b';
                setTimeout(() => taskInput.style.borderColor = '#e1e8ed', 1500);
                return;
            }

            const task = {
                id: Date.now(),
                text: taskText,
                priority: prioritySelect.value,
                completed: false,
                createdAt: new Date().toLocaleDateString()
            };

            tasks.unshift(task);
            taskInput.value = '';
            
            updateTaskDisplay();
            updateStats();
            
            // Add success animation
            taskInput.style.borderColor = '#4ecdc4';
            setTimeout(() => taskInput.style.borderColor = '#e1e8ed', 1000);
        }

        // Toggle task completion
        function toggleTask(id) {
            tasks = tasks.map(task => 
                task.id === id ? { ...task, completed: !task.completed } : task
            );
            updateTaskDisplay();
            updateStats();
        }

        // Delete task
        function deleteTask(id) {
            tasks = tasks.filter(task => task.id !== id);
            updateTaskDisplay();
            updateStats();
        }

        // Filter tasks
        function filterTasks(filter) {
            currentFilter = filter;
            
            // Update filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            updateTaskDisplay();
        }

        // Update task display based on current filter
        function updateTaskDisplay() {
            const tasksList = document.getElementById('tasksList');
            let filteredTasks = tasks;

            switch(currentFilter) {
                case 'pending':
                    filteredTasks = tasks.filter(task => !task.completed);
                    break;
                case 'completed':
                    filteredTasks = tasks.filter(task => task.completed);
                    break;
                case 'high':
                    filteredTasks = tasks.filter(task => task.priority === 'high');
                    break;
            }

            if (filteredTasks.length === 0) {
                tasksList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">${getEmptyIcon()}</div>
                        <h3>${getEmptyMessage()}</h3>
                        <p>${getEmptySubMessage()}</p>
                    </div>
                `;
                return;
            }

            tasksList.innerHTML = filteredTasks.map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''}">
                    <div class="task-header">
                        <div class="task-text">${task.text}</div>
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
        }

        // Update statistics
        function updateStats() {
            const total = tasks.length;
            const completed = tasks.filter(task => task.completed).length;
            const pending = total - completed;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            document.getElementById('totalTasks').textContent = total;
            document.getElementById('pendingTasks').textContent = pending;
            document.getElementById('completedTasks').textContent = completed;
            document.getElementById('progressPercent').textContent = progress + '%';
        }

        // Helper functions for empty states
        function getEmptyIcon() {
            switch(currentFilter) {
                case 'pending': return '⏳';
                case 'completed': return '🎉';
                case 'high': return '🔥';
                default: return '📝';
            }
        }

        function getEmptyMessage() {
            switch(currentFilter) {
                case 'pending': return 'No pending tasks!';
                case 'completed': return 'No completed tasks yet!';
                case 'high': return 'No high priority tasks!';
                default: return 'No tasks yet!';
            }
        }

        function getEmptySubMessage() {
            switch(currentFilter) {
                case 'pending': return 'Great job! All tasks are completed.';
                case 'completed': return 'Complete some tasks to see them here.';
                case 'high': return 'No urgent tasks at the moment.';
                default: return 'Add your first task above to get started.';
            }
        }

        // Allow Enter key to add tasks
        document.getElementById('taskInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        // Initialize
        updateStats();