import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, Alert, Platform} from 'react-native';
import { collection, getDocs, query, where, doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { db, auth } from '../firebase';

const TableAvailability = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [date, setDate] = useState(new Date()); // Default date is today
  const [unavailableTimeSlots, setUnavailableTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch the restaurant ID of the current user
  useEffect(() => {
    const fetchRestaurantId = async () => {
      try {
        //make sure user is logged in
        const user = auth.currentUser;
        if (!user) {
          return;
        }
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.restaurantId) {
            setRestaurantId(data.restaurantId);
          } else {
            Alert.alert('User is not linked to a restaurant');
          }
        } else {
          Alert.alert('User document not found');
        }
      } catch (error) {
        console.error('Error fetching restaurant ID:', error);
        Alert.alert('Error fetching restaurant ID');
      }
    };

    fetchRestaurantId();
  }, []);

  // Fetch the table IDs when the restaurant ID changes
  useEffect(() => {
    const fetchUnavailableTimeSlots = async () => {
      try {
        if (!restaurantId) return;

        const formattedDate = `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
        const unavailableTimeSlotsQuery = query(collection(db, 'availableTimeSlots', restaurantId, formattedDate), where('tablesAvailability', '==', false));
        const snapshot = await getDocs(unavailableTimeSlotsQuery);
        const slots = snapshot.docs.map(doc => doc.id);
        setUnavailableTimeSlots(slots);
      } catch (error) {
        console.error('Error fetching unavailable time slots:', error);
      }
    };

    fetchUnavailableTimeSlots();
  }, [restaurantId, date]);

  const handleUpdateTimeSlotAvailability = async () => {
    try {
      if (!restaurantId || !selectedTimeSlot) {
        Alert.alert('Please select a time slot and ensure you are linked to a restaurant');
        return;
      }
      
      // Update the time slot document to mark it as available
      const formattedDate = `${('0' + date.getDate()).slice(-2)}-${('0' + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
      const timeSlotRef = doc(db, 'availableTimeSlots', restaurantId, formattedDate, selectedTimeSlot);
      await updateDoc(timeSlotRef, { tablesAvailability: true });

      // Remove the time slot from the unavailable list
      setUnavailableTimeSlots(prevSlots => prevSlots.filter(slot => slot !== selectedTimeSlot));

      Alert.alert('Time slot availability updated successfully');
      setSelectedTimeSlot('');
    } catch (error) {
      console.error('Error updating time slot availability:', error);
      Alert.alert('Error updating time slot availability');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Date:</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.buttonText}>Select Date</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const currentDate = selectedDate || date;
            setShowDatePicker(Platform.OS === 'ios');
            setDate(currentDate);
          }}
          minimumDate={new Date()}
        />
      )}
      <Text style={styles.title}>Select Time Slot:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedTimeSlot}
          style={styles.picker}
          onValueChange={(value) => setSelectedTimeSlot(value)}
        >
          {unavailableTimeSlots.map((timeSlot) => (
            <Picker.Item key={timeSlot} label={timeSlot} value={timeSlot} />
          ))}
        </Picker>
      </View>
      <TouchableOpacity
      style={[styles.button, styles.updateButton]}
      onPress={handleUpdateTimeSlotAvailability} 
      disabled={!selectedTimeSlot}
    >
      <Text style={styles.buttonText}>Update Availability</Text>
    </TouchableOpacity>
    </View>
  );
};

export default TableAvailability;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: 'black',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },

});
