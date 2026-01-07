'use client';
import { useState } from 'react';
import styles from './home.module.css';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Review quarter performance', completed: false },
        { id: 2, text: 'Update client documentation', completed: true },
        { id: 3, text: 'Design system meeting', completed: false },
    ]);
    const [newTask, setNewTask] = useState('');

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
        setNewTask('');
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        pending: tasks.filter(t => !t.completed).length,
    };

    return (
        <div className={styles.container}>
            {/* Sidebar REMOVED - handeled by Layout */}

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Dashboard</h1>
                        <p className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </header>

                {/* Stats Row */}
                <section className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Total Tasks</span>
                        <span className={styles.statValue}>{stats.total}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>In Progress</span>
                        <span className={styles.statValue}>{stats.pending}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Completed</span>
                        <span className={styles.statValue}>{stats.completed}</span>
                    </div>
                </section>

                {/* Tasks */}
                <section className={styles.taskSection}>
                    <div className={styles.sectionTitle}>Quick Add</div>
                    <form className={styles.addTaskWrapper} onSubmit={addTask}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="What needs to be done?"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                        />
                        <button type="submit" className={styles.addButton}>
                            ADD TASK
                        </button>
                    </form>

                    <div className={styles.sectionTitle}>Today's Tasks</div>
                    <div className={styles.taskList}>
                        {tasks.map((task) => (
                            <div key={task.id} className={styles.taskItem}>
                                <div
                                    className={`${styles.checkbox} ${task.completed ? styles.checkboxChecked : ''}`}
                                    onClick={() => toggleTask(task.id)}
                                />
                                <span className={`${styles.taskText} ${task.completed ? styles.taskCompleted : ''}`}>
                                    {task.text}
                                </span>
                                <button className={styles.deleteButton} onClick={() => deleteTask(task.id)}>
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
