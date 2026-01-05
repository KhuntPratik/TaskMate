import React from 'react';

type FilterType = 'All' | 'Active' | 'Completed';

interface FilterBarProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ currentFilter, onFilterChange }) => {
    const filters: FilterType[] = ['All', 'Active', 'Completed'];

    return (
        <div className="glass-panel" style={{
            padding: '0.5rem',
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            justifyContent: 'center'
        }}>
            {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => onFilterChange(filter)}
                    style={{
                        background: currentFilter === filter ? 'var(--primary)' : 'transparent',
                        color: currentFilter === filter ? 'white' : 'var(--foreground)',
                        border: 'none',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        opacity: currentFilter === filter ? 1 : 0.7,
                        fontWeight: currentFilter === filter ? 600 : 400
                    }}
                >
                    {filter}
                </button>
            ))}
        </div>
    );
};

export default FilterBar;
