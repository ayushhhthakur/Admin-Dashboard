import { useState } from 'react';
import { Box, Button, TextField, Typography, Modal, Snackbar, Alert } from '@mui/material';
import supabase from '../../../supabase';

const JobModal = ({ open, onClose, setSuccessMessage }) => {
  const [jobName, setJobName] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReq, setJobReq] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!jobName || !jobDesc || !jobReq) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('category')
        .insert([{ job_name: jobName, job_desc: jobDesc, job_req: jobReq }]);

      if (error) throw error;

      setSuccessMessage('Job successfully added!'); // Set success message
      onClose(); // Close the modal after adding the job
      setJobName(''); // Clear the job name field
      setJobDesc(''); // Clear the job description field
      setJobReq(''); // Clear the job requirements field
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2">
            Add New Job
          </Typography>
          <TextField
            fullWidth
            label="Job Title"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Job Description"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Job Requirements"
            value={jobReq}
            onChange={(e) => setJobReq(e.target.value)}
            sx={{ mb: 2 }}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            {loading ? 'Adding...' : 'Add Job'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default JobModal;
