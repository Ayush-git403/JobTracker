import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [message, setMessage] = useState('');
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch employer's jobs
  const fetchMyJobs = async () => {
    try {
      const res = await API.get('/jobs/employer/myjobs');
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchMyJobs(); }, []);

  // Post a job
  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await API.post('/jobs', form);
      setMessage('Job posted successfully!');
      setForm({ title: '', description: '' });
      fetchMyJobs();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error posting job');
    }
  };

  // View applications for a job
  const handleViewApplications = async (job_id) => {
    try {
      const res = await API.get(`/applications/job/${job_id}`);
      setApplications(res.data);
      setSelectedJob(job_id);
    } catch (err) {
      console.error(err);
    }
  };

  // Update application status
  const handleStatusUpdate = async (app_id, status) => {
    try {
      await API.patch(`/applications/${app_id}`, { status });
      handleViewApplications(selectedJob);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete a job
  const handleDeleteJob = async (job_id) => {
    try {
      await API.delete(`/jobs/${job_id}`);
      fetchMyJobs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Welcome, {user?.name} — Employer Dashboard</h2>

      {/* POST JOB FORM */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Post a New Job</h3>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        <form onSubmit={handlePostJob}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Job Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <textarea
              placeholder="Job Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <button type="submit" style={{ padding: '8px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Post Job
          </button>
        </form>
      </div>

      {/* MY JOBS */}
      <h3>My Posted Jobs</h3>
      {jobs.length === 0 && <p>No jobs posted yet.</p>}
      {jobs.map(job => (
        <div key={job.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
          <h4>{job.title}</h4>
          <p>{job.description}</p>
          <p>Status: <strong>{job.status}</strong></p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleViewApplications(job.id)} style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              View Applications
            </button>
            <button onClick={() => handleDeleteJob(job.id)} style={{ padding: '6px 12px', background: 'red', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Delete Job
            </button>
          </div>
        </div>
      ))}

      {/* APPLICATIONS */}
      {selectedJob && (
        <div style={{ marginTop: '20px' }}>
          <h3>Applications for Job #{selectedJob}</h3>
          {applications.length === 0 && <p>No applications yet.</p>}
          {applications.map(app => (
            <div key={app.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
              <p><strong>Applicant:</strong> {app.applicant?.name}</p>
              <p><strong>Email:</strong> {app.applicant?.email}</p>
              <p><strong>Status:</strong> {app.status}</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={() => handleStatusUpdate(app.id, 'shortlisted')} style={{ padding: '6px 12px', background: 'green', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Shortlist
                </button>
                <button onClick={() => handleStatusUpdate(app.id, 'rejected')} style={{ padding: '6px 12px', background: 'red', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;