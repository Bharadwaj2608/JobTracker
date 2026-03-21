import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import JobForm from '../components/JobForm';
import toast from 'react-hot-toast';

export default function AddJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/jobs', data);
      toast.success('Application added successfully 🎉');
      navigate('/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/jobs" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Add Application</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track a new job application</p>
        </div>
      </div>
      <JobForm onSubmit={handleSubmit} loading={loading} submitLabel="Add Application" />
    </div>
  );
}
