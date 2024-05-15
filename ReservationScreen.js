import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, serverTimestamp, query, getDoc, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ReservationScreen = ({ navigation, route }) => {
  const { restaurantName, username, email, Uid, restaurantid } = route.params;
  const [date, setDate] = useState(new Date());
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedTableAvailability, setSelectedTableAvailability] = useState(false);
  const [totalGuests, setTotalGuestsLimit] = useState('');
  const [guests, setGuests] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchAvailableTimeSlots();
  }, [date]);

  const fetchAvailableTimeSlots = async () => {
    try {
      const formattedDate = `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
      const availableTimeSlotsQuerySnapshot = await getDocs(query(collection(db, 'availableTimeSlots', restaurantid, formattedDate)));
      const slots = [];

      availableTimeSlotsQuerySnapshot.forEach(doc => {
        const slotData = doc.data();
        // Check if the time slot is available based on your criteria
        slots.push(doc.id); 
      });

      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      // Handle error
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');

    setDate(currentDate);
  };

  const handleTimeSlotSelect = async (selectedSlot) => {
    setSelectedTimeSlot(selectedSlot);

  try {
    const formattedDate = `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
    const tableDocRef = doc(db, 'availableTimeSlots', restaurantid, formattedDate, selectedSlot);
    const tableDocSnapshot = await getDoc(tableDocRef);

    if (tableDocSnapshot.exists()) {
      const tableData = tableDocSnapshot.data();
      const { tablesAvailability, totalGuests } = tableData;

      // Check if the time slot is available
      if (tablesAvailability) {
        setSelectedTableAvailability(true);
        setTotalGuestsLimit(totalGuests); // Set the total guests limit for the selected time slot
      } else {
        setSelectedTableAvailability(false);
        console.log('Time slot is not available');
      }
    } else {
      console.log('Time slot document does not exist');
    }
  } catch (error) {
    console.error('Error fetching tables for the selected time slot:', error);
  }
};


  const handleGuestsChange = (text) => {
    setGuests(text);
  };

  const handleSubmit = async () => {
    try {
      // Check if the selected time slot is still available
      const formattedDate = `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
      const tableDocRef = doc(
        db,
        'availableTimeSlots',
        restaurantid,
        formattedDate,
        selectedTimeSlot
      );
      const tableDocSnapshot = await getDoc(tableDocRef);
      const tableData = tableDocSnapshot.data();
      const isTimeSlotAvailable = tableData.tablesAvailability;
  
      if (!isTimeSlotAvailable) {
        // Time slot is not available
        console.log('Time slot is no longer available');
        Alert.alert('Time slot is no longer available. Please choose another time slot.');
        return;
      }
  
      // Check if the number of guests exceeds the totalGuests limit for the selected time slot
      if (parseInt(guests) > totalGuests) {
        console.log('Number of guests exceeds the limit for the selected time slot');
        Alert.alert(`Number of guests exceeds the limit (${totalGuests}) for the selected time slot.`);
        return;
      }
  
      // Add reservation to the database
      const docRef = await addDoc(collection(db, 'reservations'), {
        date: formattedDate,
        time: selectedTimeSlot,
        guests: guests,
        restaurantName: restaurantName,
        restaurantId: restaurantid,
        userName: username,
        userEmail: email,
        UID: Uid,
        status: 'pending',
        timestamp: serverTimestamp()
      });
  
      // Mark the time slot as unavailable in the database
      await updateDoc(tableDocRef, { tablesAvailability: false });
  
      console.log('Reservation submitted with ID:', docRef.id);
      navigation.navigate('HomePage');
      Alert.alert('Successful Reservation');
    } catch (error) {
      console.error('Error submitting reservation:', error);
      Alert.alert('Failed to submit reservation. Please try again later.');
    }
  };

  const renderTimeSlots = () => {
    return availableTimeSlots.map(slot => (
      <TouchableOpacity key={slot} onPress={() => handleTimeSlotSelect(slot)}
      style={[styles.timeSlotButton, selectedTimeSlot === slot ? styles.selectedTimeSlot : null]}
      >
        <Text>{slot}</Text>
      </TouchableOpacity>
    ));
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
        <Text style={styles.label}>Select Time Slot:</Text>
        {renderTimeSlots()}
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
        <Button title="Cancel" onPress={() => navigation.goBack()} color="#888" />
      </View>
    </View>
  );
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
  timeSlotButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  selectedTimeSlot: {
    backgroundColor: '#ffcc00', // Change the background color for selected time slot
  },
});
