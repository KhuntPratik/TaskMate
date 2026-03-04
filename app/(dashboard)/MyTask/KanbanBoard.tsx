'use client';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import styles from './mytask.module.css';
import ProtectedRoute from '../../components/ProtectedRoute';

export interface Task {
    id: number;
    title: string;
    category: string;
    dueDate: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
    projectId?: number;
    projectName?: string;
}

interface KanbanBoardProps {
    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
}

const COLUMNS = [
    { id: 'Pending', title: 'Pending' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'Completed', title: 'Completed' },
];

export default function KanbanBoard({ tasks, setTasks }: KanbanBoardProps) {
    const router = useRouter();
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        // Create a new array to maintain immutability
        const newTasks = Array.from(tasks);
        const movedTaskFn = newTasks.find(t => t.id.toString() === draggableId);

        if (!movedTaskFn) return;

        // If moving to a different column
        if (source.droppableId !== destination.droppableId) {
            const newStatus = destination.droppableId as Task['status'];

            // Update the local state immediately (Optimistic UI)
            const updatedTasks = newTasks.map(t =>
                t.id.toString() === draggableId ? { ...t, status: newStatus } : t
            );

            setTasks(updatedTasks);

            // Persist to backend
            const dbStatus = newStatus === 'Pending' ? 'To Do' : newStatus;

            fetch(`/api/task/${draggableId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: dbStatus })
            }).catch(err => {
                console.error("Failed to update task status:", err);
                // Revert changes if API fails
                setTasks(tasks);
                alert("Failed to update task status");
            });
        }
    };

    if (!enabled) {
        return null;
    }

    const handleDelete = async (e: React.MouseEvent, taskId: number) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const res = await fetch(`/api/task/${taskId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error("Failed to delete task");

            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete task");
        }
    };

    return (
        <ProtectedRoute>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className={styles.boardContainer}>
                    {COLUMNS.map((column) => {
                        const columnTasks = tasks.filter(task => task.status === column.id);

                        return (
                            <div key={column.id} className={styles.column}
                                style={{
                                    borderColor: column.id === 'Pending' ? 'rgba(251, 191, 36, 0.2)' :
                                        column.id === 'In Progress' ? 'rgba(59, 130, 246, 0.2)' :
                                            'rgba(16, 185, 129, 0.2)'
                                }}>
                                <div className={styles.columnHeader}>
                                    <div className={styles.columnTitle} style={{
                                        color: column.id === 'Pending' ? '#fbbf24' :
                                            column.id === 'In Progress' ? '#60a5fa' :
                                                '#34d399'
                                    }}>
                                        {column.title}
                                        <span className={styles.columnCount} style={{
                                            background: column.id === 'Pending' ? 'rgba(251, 191, 36, 0.1)' :
                                                column.id === 'In Progress' ? 'rgba(59, 130, 246, 0.1)' :
                                                    'rgba(16, 185, 129, 0.1)',
                                            color: 'inherit'
                                        }}>{columnTasks.length}</span>
                                    </div>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided) => (
                                        <div
                                            className={styles.taskList}
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {columnTasks.map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            className={`${styles.taskCard} ${snapshot.isDragging ? styles.draggingCard : ''}`}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <div className={styles.cardHeader}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                                    <div className={styles.cardTitle}>{task.title}</div>
                                                                    <span className={styles.idBadge}>#{task.id}</span>
                                                                </div>
                                                                <div className={styles.cardActions}>
                                                                    <button
                                                                        className={styles.editBtn}
                                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 0 }}
                                                                        onClick={() => router.push(`/MyTask/${task.id}/edit`)}
                                                                        title="Edit"
                                                                    >
                                                                        <Edit size={15} />
                                                                    </button>
                                                                    <button
                                                                        className={styles.deleteBtn}
                                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239, 68, 68, 0.7)', padding: 0 }}
                                                                        onClick={(e) => handleDelete(e, task.id)}
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={15} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className={styles.cardFooter}>
                                                                <div className={styles.cardMeta}>
                                                                    <span className={`${styles.badge} ${task.priority === 'High' ? styles.badgeHigh :
                                                                        task.priority === 'Medium' ? styles.badgeMedium :
                                                                            styles.badgeLow
                                                                        }`}>
                                                                        {task.priority}
                                                                    </span>
                                                                </div>
                                                                <div className={styles.cardMeta} style={{ opacity: 0.7 }}>
                                                                    {task.dueDate}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>
        </ProtectedRoute>
    );
}
