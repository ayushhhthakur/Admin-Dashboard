import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TableSortLabel from '@mui/material/TableSortLabel';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SecondaryAction from 'ui-component/cards/CardSecondaryAction';
import { gridSpacing } from 'store/constant';
import supabase from '../../../supabase';

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const usersPerPage = 15;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch total user count
        const { count, error: countError } = await supabase
          .from('auth')
          .select('id', { count: 'exact' });
        if (countError) throw countError;
        setTotalUsers(count);

        // Fetch paginated user data with profile score
        const { data: userData, error: userError } = await supabase
          .from('profile') // Fetch from profile table
          .select(`
            auth_id,
            score,
            auth!inner(id, fname, lname, email, role)
          `)
          .range((page - 1) * usersPerPage, page * usersPerPage - 1);

        if (userError) throw userError;

        // Format the users with their profile scores
        const formattedUsers = userData.map(profile => ({
          ...profile.auth, // Extract fields from auth
          score: profile.score || '0',
        }));

        setUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleView = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleDelete = async (userId) => {
    try {
      const { error } = await supabase
        .from('auth')
        .delete()
        .eq('id', userId);
      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
      setSnackbarMessage('User profile deleted successfully!');
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage('Error deleting user profile.');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getScoreColor = (score) => {
    if (score > 80) return 'green';
    if (score >= 60) return '#FFA500';
    return 'red';
  };

  return (
    <MainCard title="User List" secondary={<SecondaryAction link="https://next.material-ui.com/components/tables/" />}>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <TableContainer component={Paper} >
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'name'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'email'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('email')}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === 'score'}
                      direction={sortConfig.direction}
                      onClick={() => handleSort('score')}
                    >
                      Score
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.fname} {user.lname}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell style={{ color: getScoreColor(user.score) }}>
                      {user.score} %
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => handleView(user.id)}
                        style={{ marginRight: '8px' }}
                      >
                        View
                      </Button>
                      <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box display="flex" justifyContent="center" marginTop={2}>
            <Pagination
              count={Math.ceil(totalUsers / usersPerPage)}
              page={page}
              onChange={handlePageChange}
            />
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default UserTable;
