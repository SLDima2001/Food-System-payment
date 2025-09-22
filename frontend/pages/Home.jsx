import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [hoveredButton, setHoveredButton] = useState(null);
  const navigate = useNavigate();

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#ffffff',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    },
    
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `
        radial-gradient(circle at 20% 50%, rgba(0, 123, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 0, 150, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(0, 255, 150, 0.1) 0%, transparent 50%)
      `,
      zIndex: -1,
    },

    content: {
      textAlign: 'center',
      maxWidth: '600px',
      zIndex: 2,
    },

    title: {
      fontSize: '3.5rem',
      fontWeight: '700',
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, #ffffff 0%, #007bff 50%, #00d4ff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      lineHeight: '1.2',
    },

    subtitle: {
      fontSize: '1.25rem',
      color: '#b0b0b0',
      marginBottom: '3rem',
      fontWeight: '300',
      lineHeight: '1.6',
    },

    buttonContainer: {
      display: 'flex',
      gap: '1.5rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },

    primaryButton: {
      background: hoveredButton === 'primary' 
        ? 'linear-gradient(135deg, #0056b3 0%, #003d82 100%)'
        : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
      color: '#ffffff',
      border: 'none',
      padding: '1rem 2rem',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      transform: hoveredButton === 'primary' ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: hoveredButton === 'primary' 
        ? '0 12px 40px rgba(0, 123, 255, 0.4)' 
        : '0 8px 32px rgba(0, 123, 255, 0.3)',
    },

    secondaryButton: {
      background: hoveredButton === 'secondary' 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '1rem 2rem',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      transform: hoveredButton === 'secondary' ? 'translateY(-2px)' : 'translateY(0)',
    },
  };

  const handleButtonClick = (buttonType) => {
    // Navigate to the Subscription_payment page
    navigate('/Subscription_payment');
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern}></div>
      
      <div style={styles.content}>
        <h1 style={styles.title}>
          Welcome to<br />
          Your Website
        </h1>
        <p style={styles.subtitle}>
          Discover amazing content and get in touch with us
        </p>
        
        <div style={styles.buttonContainer}>
          <button 
            style={styles.primaryButton}
            onMouseEnter={() => setHoveredButton('primary')}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => handleButtonClick('primary')}
          >
            View My Work
          </button>
          <button 
            style={styles.secondaryButton}
            onMouseEnter={() => setHoveredButton('secondary')}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => handleButtonClick('secondary')}
          >
            Get In Touch
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;