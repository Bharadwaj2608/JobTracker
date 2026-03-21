import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import JobForm from '../components/JobForm';
import toast from 'react-hot-toast';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then(res => setJob(res.data.job))
      .catch(() => { toast.error('Application not found'); navigate('/jobs'); })
      .finally(() => setFetching(false));
  }, [id, navigate]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await api.put(`/jobs/${id}`, data);
      toast.success('Application updated successfully');
      navigate('/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update application');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/jobs" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Edit Application</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {job?.position} at {job?.company}
          </p>
        </div>
      </div>
      {job && <JobForm initialData={job} onSubmit={handleSubmit} loading={loading} submitLabel="Save Changes" />}
    </div>
  );
}
