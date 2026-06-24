import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');

  // Fetch all open jobs
  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch my applications
  const fetchMyApplications = async () => {
    try {
      const res = await API.get('/applications/my');
      setMyApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  // Apply to job
  const handleApply = async (job_id) => {
    try {
      await API.post('/applications', { job_id });
      setMessage('Application submitted successfully!');
      fetchMyApplications();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error applying');
    }
  };

  // Check if already applied
  const hasApplied = (job_id) => {
    return myApplications.some(app => app.job_id === job_id);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Welcome, {user?.name} — Applicant Dashboard</h2>

      {message && <p style={{ color: 'green', marginBottom: '15px' }}>{message}</p>}

      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('jobs')}
          style={{ padding: '8px 20px', background: activeTab === 'jobs' ? '#333' : '#ddd', color: activeTab === 'jobs' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Browse Jobs
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          style={{ padding: '8px 20px', background: activeTab === 'applications' ? '#333' : '#ddd', color: activeTab === 'applications' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          My Applications
        </button>
      </div>

      {/* BROWSE JOBS */}
      {activeTab === 'jobs' && (
        <div>
          <h3>Available Jobs</h3>
          {jobs.length === 0 && <p>No jobs available.</p>}
          {jobs.map(job => (
            <div key={job.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <h4>{job.title}</h4>
              <p>{job.description}</p>
              <p style={{ color: '#666' }}>Posted by: {job.employer?.name}</p>
              <button
                onClick={() => handleApply(job.id)}
                disabled={hasApplied(job.id)}
                style={{ padding: '6px 16px', background: hasApplied(job.id) ? '#aaa' : '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: hasApplied(job.id) ? 'not-allowed' : 'pointer' }}
              >
                {hasApplied(job.id) ? 'Applied' : 'Apply'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div>
          <h3>My Applications</h3>
          {myApplications.length === 0 && <p>No applications yet.</p>}
          {myApplications.map(app => (
            <div key={app.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <h4>{app.job?.title}</h4>
              <p>{app.job?.description}</p>
              <p>Posted by: {app.job?.employer?.name}</p>
              <p>Status: <strong style={{ color: app.status === 'shortlisted' ? 'green' : app.status === 'rejected' ? 'red' : 'orange' }}>{app.status}</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicantDashboard;