
import { useEffect } from 'react';
import { auth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Inactivity timeout in milliseconds (10 minutes)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

export function useAutoLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated()) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Only proceed if still authenticated
        if (auth.isAuthenticated()) {
          auth.logout();
          toast.info('You have been logged out due to inactivity');
          navigate('/signin');
        }
      }, INACTIVITY_TIMEOUT);
    };

    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // Initialize the timer
    resetTimer();
    
    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Clean up on unmount
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);
}
