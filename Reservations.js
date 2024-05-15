import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert} from 'react-native';
import { collection, deleteDoc, where, query, onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    // Retrieve current user
    const currentUser = auth.currentUser;

    if (currentUser) {
      // User is signed in, retrieve their reservations
      const userId = currentUser.uid;


      // Query reservations made by the current user
      const userReservationsQuery = query(collection(db, 'reservations'), where('UID', '==', userId));

      // Subscribe to reservations changes and update state
      const unsubscribe = onSnapshot(userReservationsQuery, (snapshot) => {
        const userReservations = [];
        snapshot.forEach((doc) => {
          userReservations.push({ id: doc.id, ...doc.data() });
        });
        setReservations(userReservations);
      });

      return () => unsubscribe(); // Unsubscribe from snapshot listener when component unmounts
    }
  }, []);

  const handleCancelReservation = async (reservationId) => {
    try {
      await deleteDoc(doc(db, 'reservations', reservationId));
     
    } catch (error) {
      console.error('Error canceling reservation:', error);
   
      Alert.alert('Error', 'Failed to cancel reservation. Please try again later.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Reservations</Text>
      <FlatList
        data={reservations}
        renderItem={({ item }) => (
          <View style={styles.reservationItem}>
            <Text>Restaurant: {item.restaurantName}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Time: {item.time}</Text>
            <Text>Number of Guests: {item.guests}</Text>
            <Button
              title="Cancel"
              onPress={() => handleCancelReservation(item.id)}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default Reservations;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reservationItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});


