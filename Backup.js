import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, serverTimestamp, query, where, updateDoc, getDocs, doc, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';


const ReservationScreen = ({ navigation, route }) => {
  const  { restaurantName, username, email, Uid, restaurantid } = route.params;
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [guests, setGuests] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    // Schedule periodic check for upcoming reservations
    const interval = setInterval(checkUpcomingReservations, 3600000); // Check every hour

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  const checkUpcomingReservations = async () => {
    try {
      const currentDate = new Date();
      const reservationsQuerySnapshot = await getDocs(query(collection(db, 'reservations'), where('date', '>=', currentDate.toLocaleDateString())));

      // Iterate through upcoming reservations
      reservationsQuerySnapshot.forEach(async (doc) => {
        const reservationData = doc.data();
        const reservationDateTime = new Date(reservationData.date);
        reservationDateTime.setHours(reservationData.time.getHours(), reservationData.time.getMinutes());

        // Check if the reservation date and time match the current date and time
        if (reservationDateTime.getTime() === currentDate.getTime()) {
          // Update the corresponding table document to mark it as unavailable
          await updateDoc(doc(db, 'restaurants', reservationData.restaurantId, 'tables', reservationData.tableId), { available: false });
        }
      });
    } catch (error) {
      console.error('Error checking upcoming reservations:', error);
    }
  };
  // Function to handle date selection
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  // Function to handle time selection
  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };

  // Function to handle changes in number of guests
  const handleGuestsChange = (text) => {
    setGuests(text);
  };
 

  // Function to handle reservation submission
  const handleSubmit = async () => {
    try {
    const expectedDurationInMinutes = 120;
    const tablesQuery = query(collection(db, 'restaurants', restaurantid, 'tables'), where('available', '==', true));
    const tablesSnapshot = await getDocs(tablesQuery);

    // Find a suitable table for the reservation
    let suitableTable;
    tablesSnapshot.forEach(doc => {
      const tableData = doc.data();
      if (parseInt(tableData.capacity) >= parseInt(guests)) {
        suitableTable = { id: doc.id, ...tableData };
      }
    });

    if (!suitableTable) {
      // No available tables matching the capacity
      Alert.alert('No available tables with sufficient capacity for the specified number of guests.');
      return;
    }

    const existingReservationsQuerySnapshot = await getDocs(query(collection(db, 'reservations'), 
      where('tableId', '==', suitableTable.id),
      where('date', '==', date.toLocaleDateString()),
      where('time', '==', time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    ));

    if (!existingReservationsQuerySnapshot.empty) {
      // There is already a reservation for the same table at the same date and time
      Alert.alert('This table is already reserved for the specified date and time. Please choose a different date or time.');
      return;
    }

      const reservationData = {
        date: date.toLocaleDateString(),
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        guests: guests,
        restaurantName: restaurantName,
        restaurantId: restaurantid,
        tableId: suitableTable.id,
        // Include user name and email in reservation data
        userName: username,
        userEmail: email,
        UID: Uid,
        status: 'pending'
      };

      const reservationStartTime = new Date(date);
      reservationStartTime.setHours(time.getHours(), time.getMinutes());
      const bookingEndTime = new Date(reservationStartTime.getTime() + (expectedDurationInMinutes * 60000));

    // Add reservation to the database
    const docRef = await addDoc(collection(db, 'reservations'), {
      ...reservationData,
      timestamp: serverTimestamp(),
      bookingEndTime: bookingEndTime // Save the booking end time in the reservation data
    });

    // Mark the table as unavailable only for the duration of the reservation
    const currentDate = new Date();
    if (date.toLocaleDateString() === currentDate.toLocaleDateString()) {
      await updateDoc(doc(db, 'restaurants', restaurantid, 'tables', suitableTable.id), {
        available: false,
        bookingEndTime: bookingEndTime // Save the booking end time in the table data
      });
    }

       
      console.log('Reservation submitted with ID: ', docRef.id);

      navigation.navigate('HomePage');
      Alert.alert('Succesfull Reservation'); 
    } catch (error) {
      console.error('Error submitting reservation: ', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputTouchable}>
          <Text>{date.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Time:</Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.inputTouchable}>
          <Text>{time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={handleTimeChange}
            
          />
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Number of Guests:</Text>
        <TextInput
          style={styles.input}
          onChangeText={handleGuestsChange}
          value={guests}
          keyboardType="numeric"
          placeholder="Enter number of guests"
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Submit" onPress={handleSubmit} />
        <Button title="Cancel" onPress={() => console.log('Reservation canceled')} color="#888" />
       
      </View>
    </View>
  )
};

export default ReservationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  inputTouchable: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});