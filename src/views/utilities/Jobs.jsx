import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Switch, Snackbar, Alert } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import SecondaryAction from 'ui-component/cards/CardSecondaryAction';
import JobModal from './JobModal'; // Import the JobModal component
import supabase from '../../../supabase';

// ===============================|| JOBS PAGE ||=============================== //

const Jobs = () => {
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null); // Track selected job for modal
  const [successMessage, setSuccessMessage] = useState(null); // Track success messages
  const [snackError, setSnackError] = useState(null); // Track errors for Snackbar
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('category')
          .select('id, job_name, job_desc, job_req'); // Ensure id is fetched

        if (error) throw error;

        setJobsData(data);
      } catch (error) {
        setSnackError(error.message); // Set error for Snackbar
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [successMessage]); // Refetch data when a new job is added

  const handleAddJobClick = () => {
    setSelectedJobId(null); // Clear selected job
    setOpenModal(true); // Open the modal
  };

  const handleCloseModal = () => {
    setOpenModal(false); // Close the modal
  };

  const handleViewDetails = (jobId) => {
    navigate(`/jobs/${jobId}`); // Redirect to job details page
  };

  const handleDelete = async (jobId) => {
    try {
      const { error } = await supabase
        .from('category')
        .delete()
        .eq('id', jobId);
      if (error) throw error;
      setSuccessMessage('Job successfully deleted!'); // Set success message
    } catch (error) {
      setSnackError(error.message); // Set error for Snackbar
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('category')
        .update({ is_active: !currentStatus }) // Toggle the status
        .eq('id', jobId);

      if (error) throw error;

      // Update local state to reflect the change
      setJobsData(prevData =>
        prevData.map(job =>
          job.id === jobId ? { ...job, is_active: !currentStatus } : job
        )
      );
    } catch (error) {
      setSnackError(error.message); // Set error for Snackbar
    }
  };

  return (
    <MainCard title="Job Listings" secondary={<SecondaryAction link="/job-listings" />}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Typography variant="h6">Title</Typography></TableCell>
              <TableCell><Typography variant="h6">Action</Typography></TableCell>
              <TableCell><Typography variant="h6">Active</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobsData.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.job_name}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewDetails(job.id)}
                    sx={{ mr: 1 }} // Margin to the right for spacing
                  >
                    View
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(job.id)}
                    sx={{ ml: 1 }} // Margin to the left for spacing
                  >
                    Delete
                  </Button>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={job.is_active} // Assuming 'is_active' field exists
                    onChange={() => handleToggleStatus(job.id, job.is_active)}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddJobClick}
        sx={{ mt: 2 }}
      >
        Add New Job
      </Button>
      <JobModal open={openModal} onClose={handleCloseModal} setSuccessMessage={setSuccessMessage} />
      
      {/* Snackbar for success messages */}
      {successMessage && (
        <Snackbar
          open={Boolean(successMessage)}
          autoHideDuration={6000}
          onClose={() => setSuccessMessage(null)}
        >
          <Alert onClose={() => setSuccessMessage(null)} severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      )}

      {/* Snackbar for errors */}
      {snackError && (
        <Snackbar
          open={Boolean(snackError)}
          autoHideDuration={6000}
          onClose={() => setSnackError(null)}
        >
          <Alert onClose={() => setSnackError(null)} severity="error">
            {snackError}
          </Alert>
        </Snackbar>
      )}
    </MainCard>
  );
};

export default Jobs;
