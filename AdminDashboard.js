import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, screenWidth } from 'react-native';
import { collection, getDocs, getDoc,doc, orderBy, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { BarChart, LineChart } from 'react-native-chart-kit';

const AdminDashboard = () => {
    const [totalReservations, setTotalReservations] = useState(0);
    const [averageGuestsPerReservation, setAverageGuestsPerReservation] = useState(0);
    const [mostPopularTimeSlots, setMostPopularTimeSlots] = useState([]);
    const [timeSlotsCount, setTimeSlotsCount] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const uid = auth.currentUser.uid;
            const userDocSnapshot = await getDoc(doc(db, 'users', uid));
    
            if (userDocSnapshot.exists() && userDocSnapshot.data().role === 'admin') {
                const restaurantId = userDocSnapshot.data().restaurantId;
                
                // Fetch total reservations for the current restaurant
                const reservationsSnapshot = await getDocs(query(collection(db, 'reservations'), where('restaurantId', '==', restaurantId)));
                const totalReservationsCount = reservationsSnapshot.size;
                setTotalReservations(totalReservationsCount);
               
    
                // Calculate average guests per reservation for the current restaurant
                let totalGuests = 0;
                reservationsSnapshot.forEach((doc) => {
                    const reservationData = doc.data();
                    totalGuests += parseInt(reservationData.guests) || 0; 
                });
                const averageGuests = totalReservationsCount > 0 ? totalGuests / totalReservationsCount : 0;
                setAverageGuestsPerReservation(averageGuests.toFixed(2));
                
    
                // Fetch most popular reservation time slots for the current restaurant
                const timeSlotsQuerySnapshot = await getDocs(query(
                    collection(db, 'reservations'),
                    where('restaurantId', '==', restaurantId)
                ));
                const timeSlotsData = timeSlotsQuerySnapshot.docs.map((doc) => doc.data().time);
                const slotsCount = timeSlotsData.reduce((acc, timeSlot) => {
                    acc[timeSlot] = (acc[timeSlot] || 0) + 1;
                    return acc;
                }, {});
                setTimeSlotsCount(slotsCount);
                const sortedTimeSlots = Object.keys(slotsCount).sort((a, b) => timeSlotsCount[b] - timeSlotsCount[a]);
                const topTimeSlots = sortedTimeSlots.slice(0, 5); // Display top 5 most popular time slots
                setMostPopularTimeSlots(topTimeSlots);
            } else {
                console.log('Admin user not found or not authorized');
            }
    
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setIsLoading(false);
        }
    };
    

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }
    

return (
    <View style={styles.container}>
        <Text style={styles.title}>Dashboard Overview</Text>
        <View style={styles.metricContainer}>
            <Text style={styles.metricLabel}>Total Reservations</Text>
            <Text style={styles.metricValue}>{totalReservations}</Text>
        </View>
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Reservations Overview</Text>
            <BarChart
                data={{
                    labels: ['Total Reservations'],
                    datasets: [
                        {
                            data: [totalReservations],
                        },
                    ],
                }}
                width={350}
                height={220}
                chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: '#ffa726',
                    },
                }}
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                    
                }}
            />
        </View>
      
        <View style={styles.metricContainer}>
            <Text style={styles.metricLabel}>Average Guests per Reservation</Text>
            <Text style={styles.metricValue}>{averageGuestsPerReservation}</Text>
        </View>
            <Text style={styles.metricLabel}>Most Popular Time Slots</Text>
            <View style={styles.chartContainer}>
                {mostPopularTimeSlots.map((timeSlot, index) => (
                    <Text key={index} style={styles.timeSlot}>{timeSlot}</Text>
                ))}
            </View>
         
        </View>
);
            };
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    metricContainer: {
        marginBottom: 20,
    },
    metricLabel: {
        fontSize: 18,
        marginBottom: 5,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    timeSlot: {
        fontSize: 18,
        marginBottom: 5,
    },
});

export default AdminDashboard;
