import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, TextField, Button, Typography, Snackbar, Alert, Modal, MenuItem, Select, InputLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import the calendar styles
import supabase from '../../../supabase'; // Ensure this imports your Supabase client

// Utility function to send emails (you need to implement this with your email service)
const sendEmailNotification = async (email, eventDetails) => {
  // Implement your email sending logic here
  // Example:
  // await emailService.send({
  //   to: email,
  //   subject: `New Event Scheduled: ${eventDetails.title}`,
  //   text: `You have been invited to the following event: ${eventDetails.description}`
  // });
};

const CalendarComponent = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from('auth').select('email');
        if (error) throw error;
        setUsers(data);
        // Initialize selectedEmail with the first user's email
        if (data.length > 0) {
          setSelectedEmail(data[0].email);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();

    // Fetch existing events
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase.from('events').select('*');
        if (error) throw error;
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleCreateEvent = async () => {
    try {
      // Save the event to the database
      const { error } = await supabase.from('events').insert([
        {
          title: eventTitle,
          description: eventDescription,
          date: date.toISOString(),
          email: selectedEmail, // Include the selected email in the event
        },
      ]);
      if (error) throw error;

      // Send email notifications to the selected user
      await sendEmailNotification(selectedEmail, {
        title: eventTitle,
        description: eventDescription,
      });

      setSnackbarMessage('Event created and notification sent successfully.');
      setSnackbarSeverity('success');
      setModalOpen(false); // Close the modal
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

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Event Calendar</Typography>
        <Calendar
          onChange={handleDateChange}
          value={date}
          tileClassName={({ date, view }) => {
            // Mark dates with events
            if (events.some(event => new Date(event.date).toDateString() === date.toDateString())) {
              return 'event-date';
            }
          }}
        />
        <Button variant="contained" color="primary" onClick={() => setModalOpen(true)} sx={{ mt: 2 }}>
          Create Event
        </Button>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 5, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Create New Event</Typography>
          <TextField
            label="Event Title"
            fullWidth
            variant="outlined"
            margin="normal"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
          <TextField
            label="Event Description"
            fullWidth
            variant="outlined"
            margin="normal"
            multiline
            rows={4}
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
          />
          <InputLabel sx={{ mt: 2 }}>Select User</InputLabel>
          <Select
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          >
            {users.map((user) => (
              <MenuItem key={user.email} value={user.email}>
                {user.email}
              </MenuItem>
            ))}
          </Select>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleCreateEvent}>
              Create Event
            </Button>
          </Box>
        </Box>
      </Modal>

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
  );
};

export default CalendarComponent;
