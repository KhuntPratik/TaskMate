import React from 'react';

interface Task {
    id: number;
    text: string;
    completed: boolean;
}

interface TaskItemProps {
    task: Task;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
    return (
        <div
            className="glass-panel animate-slide-up"
            style={{
                padding: '1.25rem 1.75rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                background: task.completed ? 'rgba(255,255,255,0.01)' : 'var(--glass-bg)',
                borderLeft: task.completed ? '4px solid var(--success)' : '4px solid var(--primary)',
                opacity: task.completed ? 0.8 : 1
            }}
            onMouseEnter={(e) => {
                const target = e.currentTarget;
                if (!task.completed) {
                    target.style.transform = 'translateY(-2px) scale(1.01)';
                    target.style.background = 'var(--surface-active)';
                }
            }}
            onMouseLeave={(e) => {
                const target = e.currentTarget;
                if (!task.completed) {
                    target.style.transform = 'none';
                    target.style.background = 'var(--glass-bg)';
                }
            }}
        >
            <div
                onClick={() => onToggle(task.id)}
                style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    border: '2px solid ' + (task.completed ? 'var(--success)' : 'rgba(255,255,255,0.2)'),
                    background: task.completed ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    flexShrink: 0
                }}
            >
                {task.completed && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                )}
            </div>

            <span style={{
                flex: 1,
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? 'rgba(255,255,255,0.4)' : 'var(--foreground)',
                fontSize: '1.15rem',
                fontWeight: task.completed ? 400 : 500,
                transition: 'all 0.2s',
                letterSpacing: '0.01em'
            }}>
                {task.text}
            </span>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                }}
                className="delete-btn"
                style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--danger)',
                    cursor: 'pointer',
                    padding: '0.6rem',
                    transition: 'all 0.2s',
                    opacity: 0,
                    transform: 'translateX(10px)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
            <style jsx>{`
                .glass-panel:hover .delete-btn {
                    opacity: 1;
                    transform: translateX(0);
                }
            `}</style>
        </div>
    );
};

export default TaskItem;
