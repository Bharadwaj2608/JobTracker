import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUserFromGoogle } = useAuth();

  useEffect(() => {
    const token = params.get('token');
    const user = params.get('user');
    const error = params.get('error');

    if (error) {
      toast.error('Google login failed. Please try again.');
      navigate('/login');
      return;
    }

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('jt_token', token);
        localStorage.setItem('jt_user', JSON.stringify(parsedUser));
        setUserFromGoogle(parsedUser);
        toast.success(`Welcome, ${parsedUser.name.split(' ')[0]}! 🎉`);
        navigate('/dashboard');
      } catch {
        toast.error('Something went wrong. Please try again.');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Signing you in with Google...</p>
      </div>
    </div>
  );
}