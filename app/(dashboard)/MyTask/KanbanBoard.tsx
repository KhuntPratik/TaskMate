'use client';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import styles from './mytask.module.css';
import ProtectedRoute from '../../components/ProtectedRoute';

// Define the Task interface here if it's not exported from page.tsx, 
// OR import it if we export it. For now, I'll duplicate it to be safe and autonomous.
export interface Task {
    id: number;
    title: string;
    category: string;
    dueDate: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'To Do' | 'In Progress' | 'Done'; // Changed from completed: boolean
}

interface KanbanBoardProps {
    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
}

const COLUMNS = [
    { id: 'To Do', title: 'To Do' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'Done', title: 'Done' },
];

export default function KanbanBoard({ tasks, setTasks }: KanbanBoardProps) {

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        const movedTaskFn = tasks.find(t => t.id.toString() === draggableId);
        if (!movedTaskFn) return;

        // Create a new array to maintain immutability
        const newTasks = Array.from(tasks);

        // If moving to a different column, update status
        if (source.droppableId !== destination.droppableId) {
            const updatedTask = { ...movedTaskFn, status: destination.droppableId as Task['status'] };
            const updatedTasks = newTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
            setTasks(updatedTasks);
        } else {
            // Reordering within the same column is trickier with a simple list filter.
            // For now, we just support status changes effectively.
            // If we wanted true reordering, we'd need an 'order' field or separate lists per column in state.
            // Given the current data structure (flat list), reordering within a filtered view 
            // doesn't persist order unless we add an index field.
            // For this iteration, we'll just allow status changes.
        }
    };

    return (
        <ProtectedRoute>
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={styles.boardContainer}>
                {COLUMNS.map((column) => {
                    const columnTasks = tasks.filter(task => task.status === column.id);

                    return (
                        <div key={column.id} className={styles.column}>
                            <div className={styles.columnHeader}>
                                <div className={styles.columnTitle}>
                                    {column.title}
                                    <span className={styles.columnCount}>{columnTasks.length}</span>
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
                                                            <div className={styles.cardTitle}>{task.title}</div>
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
