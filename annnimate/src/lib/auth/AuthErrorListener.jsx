import { useEffect } from 'react';
import { useTransitionRouter } from '../hooks/useTransitionRouter'; 
import { toast } from 'sonner';

export function AuthErrorListener() {
  const router = useTransitionRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes('error=')) return;

    const params = new URLSearchParams(hash.substring(1));
    const error = params.get('error');
    const errorCode = params.get('error_code');
    const errorDescription = params.get('error_description');

    if (error || errorCode) {
      window.history.replaceState(null, '', window.location.pathname);

      if (errorCode === 'otp_expired' || error === 'access_denied') {
        toast.error('Your login link has expired or was already used. Please request a new one.', {
          duration: 5000,
          action: {
            label: 'Login',
            onClick: () => router.push('/login')
          }
        });
      } else {
        toast.error(
          errorDescription?.replace(/\+/g, ' ') || 'Authentication failed. Please try again.',
          {
            duration: 5000,
            action: {
              label: 'Login',
              onClick: () => router.push('/login')
            }
          }
        );
      }

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  }, [router]);

  return null;
}

export default AuthErrorListener;
