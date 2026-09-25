import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');
  const [uploadingId, setUploadingId] = useState(null);
  const prevPendingCountRef = useRef(0);

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

  // Poll while any application has a resume that's still being scored —
  // scoring runs in the background on the server, so the frontend needs to
  // check back until status flips from pending/processing to done/failed.
  useEffect(() => {
    const pendingCount = myApplications.filter(
      (app) => app.resume && (!app.score || ['pending', 'processing'].includes(app.score.status))
    ).length;

    // Transitioned from "something pending" to "nothing pending" — update
    // the banner so it doesn't sit frozen on "scoring in progress" forever.
    if (prevPendingCountRef.current > 0 && pendingCount === 0) {
      setMessage('Scoring complete!');
    }
    prevPendingCountRef.current = pendingCount;

    if (pendingCount === 0) return;

    const interval = setInterval(() => {
      fetchMyApplications();
    }, 4000);

    return () => clearInterval(interval);
  }, [myApplications]);

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

  // Upload resume: get presigned URL -> PUT directly to S3 -> confirm with backend
  const handleResumeUpload = async (applicationId, file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setMessage('Only PDF resumes are supported');
      return;
    }

    setUploadingId(applicationId);
    setMessage('');

    try {
      const { data: urlData } = await API.post(
        `/applications/${applicationId}/resume-upload-url`,
        { fileName: file.name, contentType: file.type }
      );

      // Direct-to-S3 upload — bypasses our backend entirely, no auth header needed
      // since the signature is baked into the URL itself.
      const uploadRes = await fetch(urlData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      if (!uploadRes.ok) throw new Error('Upload to storage failed');

      await API.post(`/applications/${applicationId}/resume-confirm`, {
        s3Key: urlData.s3Key,
        originalFileName: file.name
      });

      setMessage('Resume uploaded — scoring in progress...');
      fetchMyApplications();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Error uploading resume');
    } finally {
      setUploadingId(null);
    }
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

              {/* RESUME + AI SCORE SECTION */}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                {!app.resume ? (
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#666' }}>
                      Upload resume for AI fit scoring:
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={uploadingId === app.id}
                      onChange={(e) => handleResumeUpload(app.id, e.target.files[0])}
                    />
                    {uploadingId === app.id && <span style={{ marginLeft: '10px', color: '#666' }}>Uploading...</span>}
                  </div>
                ) : app.score?.status === 'done' ? (
                  <div>
                    <p style={{ margin: '0 0 6px 0' }}>
                      <strong>AI Fit Score: </strong>
                      <span style={{
                        color: app.score.fit_score >= 70 ? 'green' : app.score.fit_score >= 40 ? 'orange' : 'red',
                        fontWeight: 'bold'
                      }}>
                        {app.score.fit_score}%
                      </span>
                    </p>
                    {app.score.matched_skills?.length > 0 && (
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        Matched skills: {app.score.matched_skills.join(', ')}
                      </p>
                    )}
                  </div>
                ) : app.score?.status === 'failed' ? (
                  <p style={{ color: 'red', margin: 0 }}>
                    Scoring failed: {app.score.error_message || 'Unknown error'}
                  </p>
                ) : (
                  <p style={{ color: '#888', margin: 0 }}>Scoring in progress...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicantDashboard;