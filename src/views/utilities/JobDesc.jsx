import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Box, Paper, Button, TextField, Snackbar, Alert, Grid } from '@mui/material';
import supabase from '../../../supabase';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

// Utility function to clean and format text into bullet points
const formatTextToBulletPoints = (text) => {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
};

// ===============================|| JOB DESCRIPTION ||=============================== //

const JobDesc = () => {
  const { jobId } = useParams(); // Get jobId from URL parameters
  const navigate = useNavigate(); // Hook for navigation
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    job_name: '',
    job_desc: '',
    job_req: '',
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('category')
          .select('id, job_name, job_desc, job_req')
          .eq('id', jobId)
          .single(); // Fetch single job based on jobId

        if (error) throw error;

        setJobData(data);
        setEditData({
          job_name: data.job_name,
          job_desc: data.job_desc,
          job_req: data.job_req,
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleEditClick = () => {
    setIsEditing(true); // Enable editing mode
  };

  const handleCancelEdit = () => {
    setIsEditing(false); // Disable editing mode
    setEditData({
      job_name: jobData.job_name,
      job_desc: jobData.job_desc,
      job_req: jobData.job_req,
    }); // Revert changes
  };

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from('category')
        .update({
          job_name: editData.job_name,
          job_desc: editData.job_desc,
          job_req: editData.job_req,
        })
        .eq('id', jobId);

      if (error) throw error;

      setJobData(editData); // Update local state
      setIsEditing(false); // Disable editing mode
      setSnackbarMessage('Job details updated successfully');
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleDeleteClick = async () => {
    try {
      const { error } = await supabase
        .from('category')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      navigate('/utils/jobs'); // Redirect to jobs page after deletion
      setSnackbarMessage('Job deleted successfully');
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error}</Typography>;

  const formattedJobDesc = formatTextToBulletPoints(jobData?.job_desc || '');
  const formattedJobReq = formatTextToBulletPoints(jobData?.job_req || '');

  return (
    <Grid>
      <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 2 }} onClick={() => window.history.back()}>
        <ArrowBackIosIcon />
        <Typography variant="body1" sx={{ ml: 1 }}>Back</Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        {jobData ? (
          <Paper sx={{ p: 3 }}>
            {isEditing ? (
              <>
                <TextField
                  label="Job Title"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  value={editData.job_name}
                  onChange={(e) => setEditData({ ...editData, job_name: e.target.value })}
                />
                <TextField
                  label="Description"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={4}
                  value={editData.job_desc}
                  onChange={(e) => setEditData({ ...editData, job_desc: e.target.value })}
                />
                <TextField
                  label="Requirements"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={4}
                  value={editData.job_req}
                  onChange={(e) => setEditData({ ...editData, job_req: e.target.value })}
                />
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleSaveChanges} sx={{ mr: 1 }}>
                    Save Changes
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h4">{jobData.job_name}</Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>Description</Typography>
                <ul>
                  {formattedJobDesc.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <Typography variant="h6" sx={{ mt: 2 }}>Requirements</Typography>
                <ul>
                  {formattedJobReq.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleEditClick} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button variant="contained" color="error" onClick={handleDeleteClick}>
                    Delete
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        ) : (
          <Typography>No job details found.</Typography>
        )}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Grid>
  );
};

export default JobDesc;
