"use client";

import React, { useState } from 'react';
import Header from '../../components/Header';
import TaskItem from '../../components/TaskItem';
import FilterBar from '../../components/FilterBar';

type FilterType = 'All' | 'Active' | 'Completed';

export default function Home() {
    const [tasks, setTasks] = useState([
        { id: 1, text: "Review project requirements", completed: true },
        { id: 2, text: "Design the home page", completed: true },
        { id: 3, text: "Implement React components", completed: false },
        { id: 4, text: "Add animations and polish", completed: false },
    ]);

    const [newTaskText, setNewTaskText] = useState("");
    const [filter, setFilter] = useState<FilterType>('All');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskText.trim()) {
            setTasks([
                { id: Date.now(), text: newTaskText, completed: false },
                ...tasks
            ]);
            setNewTaskText("");
        }
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'Active') return !task.completed;
        if (filter === 'Completed') return task.completed;
        return true;
    });

    const activeTasks = tasks.filter(t => !t.completed).length;

    return (
        <div className="container-custom">
            <Header
                title="Good Afternoon,"
                subtitle={`You have ${activeTasks} tasks remaining.`}
            />

            <div className="animate-slide-up stagger-1">
                <form onSubmit={handleAddTask} style={{ marginBottom: '2.5rem', position: 'relative' }}>
                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <input
                            type="text"
                            placeholder="What needs to be done today?"
                            className="glass-input"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="glass-button"
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '8px',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                            }}
                        >
                            Add Task
                        </button>
                    </div>
                    <div style={{
                        position: 'absolute',
                        inset: -10,
                        background: 'var(--primary)',
                        filter: 'blur(30px)',
                        opacity: 0.15,
                        zIndex: 0,
                        borderRadius: '20px'
                    }} />
                </form>
            </div>

            <div className="animate-slide-up stagger-2">
                <FilterBar currentFilter={filter} onFilterChange={setFilter} />
            </div>

            <div className="animate-slide-up stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {filteredTasks.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', opacity: 0.7, borderStyle: 'dashed' }}>
                        <p style={{ fontSize: '1.1rem', color: 'var(--foreground)' }}>
                            {filter === 'All' ? "No tasks yet. Add one above!" : `No ${filter.toLowerCase()} tasks found.`}
                        </p>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                        />
                    ))
                )}
            </div>

            <div style={{
                marginTop: '3rem',
                opacity: 0.4,
                fontSize: '0.85rem',
                textAlign: 'center',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
            }}>
                <p>{tasks.length} Total Tasks • {tasks.filter(t => t.completed).length} Completed</p>
            </div>
        </div>
    );
}
