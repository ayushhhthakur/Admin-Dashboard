import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Avatar, Card, CardContent, Divider, Button, Grid } from '@mui/material';
import ReactSpeedometer from 'react-d3-speedometer';
import supabase from '../../../supabase';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const UserProfile = () => {
    const { userId } = useParams();
    const [userProfile, setUserProfile] = useState(null);
    const [authInfo, setAuthInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        console.log('UserId from URL:', userId);

        if (!userId) {
            setError('User ID is not provided.');
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const { data: profileData, error: profileError } = await supabase
                    .from('profile')
                    .select('*')
                    .eq('auth_id', userId)
                    .single();

                if (profileError) {
                    throw profileError;
                }

                const { data: authData, error: authError } = await supabase
                    .from('auth')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (authError) {
                    throw authError;
                }

                // Convert longevity from days to years
                const longevityInYears = profileData?.longevity ? (profileData.longevity / 365).toFixed(0) : null;

                // Update profile data with longevity in years
                setUserProfile({
                    ...profileData,
                    longevityInYears,
                });
                setAuthInfo(authData);

                setScore(profileData?.score || 0);

            } catch (error) {
                setError('Failed to fetch user profile.');
                console.error('Error fetching user data:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    if (loading) {
        return <Typography variant="h6" align="center" sx={{ mt: 5 }}>Loading...</Typography>;
    }

    if (error) {
        return <Typography variant="h6" align="center" color="error" sx={{ mt: 5 }}>Error: {error}</Typography>;
    }

    return (
        <>
            <Grid container spacing={2} sx={{ px: 3 }}>
                <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 2 }} onClick={() => window.history.back()}>
                        <ArrowBackIosIcon />
                        <Typography variant="body1" sx={{ ml: 1 }}>Back</Typography>
                    </Box>
                    <Card sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                    src={userProfile?.profileImage || '/static/default-profile-image.jpg'}
                                    alt="Profile"
                                    sx={{ width: 120, height: 120, borderRadius: '50%', mr: 2 }}
                                />
                                <Box>
                                    <Typography variant="h5">{authInfo?.fname || 'No name available'} {authInfo?.lname || 'No name available'}</Typography>
                                    <Typography variant="subtitle1" color="textSecondary">{authInfo?.email || 'No email available'}</Typography>
                                    <Typography variant="subtitle1" color="textSecondary">{authInfo?.number || 'No phone number available'}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1"><strong>Job Role:</strong> {userProfile?.job_role || 'No role available.'}</Typography>
                            <Typography variant="body1"> <strong>Experience:</strong> {userProfile?.longevityInYears ? `${userProfile.longevityInYears} + Years` : 'No experience information available.'} </Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}><strong>About Me:</strong> {userProfile?.bio || 'No bio available.'}</Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}><strong>Education:</strong> {userProfile?.highest_education || 'No education details available.'}</Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}><strong>Experience:</strong> {userProfile?.exp_new || 'No experience details available.'}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Box sx={{ p: 3, borderRadius: 2, boxShadow: 3, backgroundColor: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Typography variant="h6" align="center" gutterBottom>Fitment Score</Typography>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <ReactSpeedometer
                                value={score}
                                minValue={0}
                                maxValue={100}
                                segments={3}
                                segmentColors={['#FF0000', '#FFFF00', '#00FF00']}
                                needleColor="#000000"
                                startColor="#FF0000"
                                endColor="#00FF00"
                                customSegmentLabels={[
                                    {
                                        position: "INSIDE",
                                        color: "#555",
                                    },
                                    {
                                        position: "INSIDE",
                                        color: "#555",
                                    },
                                    {
                                        position: "INSIDE",
                                        color: "#555",
                                    },
                                ]}
                                ringWidth={47}
                                needleTransitionDuration={4000}
                                needleTransition="easeElastic"
                                currentValueText={`${score}%`}
                                textColor="#000000"
                                width={window.innerWidth < 600 ? 200 : 300}
                                height={window.innerWidth < 600 ? 150 : 200}
                            />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                            <Button variant="contained" color="primary" fullWidth href="/static/sample-resume.pdf" target="_blank">
                                View Resume
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </>
    );
};

export default UserProfile;
