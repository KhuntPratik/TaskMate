import React from 'react';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({
    title = "Good Morning,",
    subtitle = "You have things to do!"
}) => {
    const date = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    return (
        <header className="glass-panel animate-slide-up" style={{
            padding: '2.5rem 2rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(40px)',
                pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem', lineHeight: 1.1 }}>
                        {title}
                    </h1>
                    <p style={{ opacity: 0.8, fontSize: '1.25rem', fontWeight: 300 }}>{subtitle}</p>
                </div>
                <div style={{
                    textAlign: 'right',
                    opacity: 0.6,
                    background: 'var(--surface-hover)',
                    padding: '0.5rem 1rem',
                    borderRadius: '50px',
                    fontSize: '0.9rem',
                    border: '1px solid var(--glass-border)'
                }}>
                    <p>{date}</p>
                </div>
            </div>
        </header>
    );
};

export default Header;
