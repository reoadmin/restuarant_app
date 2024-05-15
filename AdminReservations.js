import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, onSnapshot} from 'firebase/firestore';
import { db, auth } from '../firebase';

const AdminReservations = ({ navigation }) => {
    const [restaurant, setRestaurant] = useState(null);
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        // Fetch restaurant data and reservations on component mount
        fetchRestaurantData();

        
    }, []);

    useEffect(() => {
    // Fetch reservations only when restaurant data is available
    if (restaurant) {
        fetchReservations();

        const unsubscribe = onSnapshot(
            query(collection(db, 'reservations'), where('restaurantName', '==', restaurant?.name)),
            (snapshot) => {
                const updatedReservations = [];
                snapshot.forEach((doc) => {
                    updatedReservations.push({ id: doc.id, ...doc.data() });
                });
                setReservations(updatedReservations);
            }
        );
        // Cleanup the listener when component unmounts
        return () => unsubscribe();

    }
    }, [restaurant]);


    const fetchRestaurantData = async () => {
        try {
            // Retrieve admin user document
            const uid = auth.currentUser.uid;
            const userDocSnapshot = await getDoc(doc(db, 'users', uid));
            

            if (userDocSnapshot.exists() && userDocSnapshot.data().role === 'admin') {
                const restaurantId = userDocSnapshot.data().restaurantId;
                // Retrieve restaurant data based on restaurantId
                const restaurantDocSnapshot = await getDoc(doc(db, 'restaurants', restaurantId));

                if (restaurantDocSnapshot.exists()) {
                    setRestaurant(restaurantDocSnapshot.data());
                } else {
                    console.log('Restaurant not found');
                }
            } else {
                console.log('Admin user not found');
            }
        } catch (error) {
            console.error('Error retrieving admin user data:', error);
        }
    };

    const fetchReservations = async () => {
        try {

            if (!restaurant) {
                  console.error('Restaurant data is not available');
            return;
        
            }
            // Fetch reservations data
            const reservationsQuerySnapshot = await getDocs(query(collection(db, 'reservations'),
                where('restaurantName', '==', restaurant?.name)
                //orderBy('timestamp', 'desc')
                ));

            const reservationsData = [];
            reservationsQuerySnapshot.forEach((doc) => {
                reservationsData.push({ id: doc.id, ...doc.data() });
            });
            setReservations(reservationsData);
        } catch (error) {
            console.error('Error fetching reservations:', error);
        }
    };

    

    const handleConfirmReservation = async (reservationId) => {
        try {
            // Update reservation status to confirmed in the database
            await updateDoc(doc(db, 'reservations', reservationId), {
                status: 'confirmed'
            });
          
        } catch (error) {
            console.error('Error confirming reservation:', error);
        }
    };

    const handleCancelReservation = async (reservationId) => {
        try {
            // Update reservation status to canceled in the database
            await updateDoc(doc(db, 'reservations', reservationId), {
                status: 'canceled'
            });
        
        } catch (error) {
            console.error('Error canceling reservation:', error);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.reservationItem}>
            <Text style={styles.reservationText}>Name: {item.userName}</Text>
            <Text style={styles.reservationText}>Email: {item.userEmail}</Text>
            <Text style={styles.reservationText}>Reserve Date: {item.date}</Text>
            <Text style={styles.reservationText}>Reserve Time: {item.time}</Text>
            <Text style={styles.reservationText}>Number of Guests: {item.guests}</Text>
            <Text style={styles.reservationText}>Status: {item.status}</Text>
            <View style={styles.buttonContainer}>
                <Button
                    title="Confirm"
                    onPress={() => handleConfirmReservation(item.id)}
                    color="#28a745"
                />
                <Button
                    title="Cancel"
                    onPress={() => handleCancelReservation(item.id)}
                    color="#dc3545" 
                />
            </View>
       
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reservations Made</Text>
            <FlatList
                data={reservations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={styles.reservationsList}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    restaurantInfo: {
        marginBottom: 20,
    },
    restaurantName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    reservationsList: {
        marginBottom: 20,
    },
    reservationItem: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    reservationText: {
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
});

export default AdminReservations;

