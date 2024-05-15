import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, ToastAndroid, TouchableOpacity, Text} from 'react-native';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Assuming you have already configured Firebase

const RestaurantManagement = ({ route, navigation }) => {
  const [name, setName] = useState('');
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [description, setDescription] = useState('');
  const [hoursOpen, setHoursOpen] = useState('');
  const [phone, setPhone] = useState(0);

  useEffect(() => {
    //verify user and get restaurant details
    const fetchRestaurantDetails = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userId = currentUser.uid;
          const userDocSnapshot = await getDoc(doc(db, 'users', userId));
          if (userDocSnapshot.exists()) {
            const restaurantId = userDocSnapshot.data().restaurantId;
            if (restaurantId) {
              const restaurantDocSnapshot = await getDoc(doc(db, 'restaurants', restaurantId));
              if (restaurantDocSnapshot.exists()) {
                const restaurantData = restaurantDocSnapshot.data();
                setName(restaurantData.name || '');
                setLongitude(restaurantData.longitude || 0);
                setLatitude(restaurantData.latitude || 0);
                setDescription(restaurantData.description || '');
                setHoursOpen(restaurantData.hoursOpen || '');
                setPhone(restaurantData.phone || 0);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
      }
    };

    fetchRestaurantDetails();
  }, []);
//function to submit/commit changes
  const handleSubmit = async () => {
    try {
      const currentUser = auth.currentUser;// get current user
      if (currentUser) {
        const userId = currentUser.uid;
        const userDocSnapshot = await getDoc(doc(db, 'users', userId));
        if (userDocSnapshot.exists()) {
          const restaurantId = userDocSnapshot.data().restaurantId;
          if (restaurantId) {
            await setDoc(doc(db, 'restaurants', restaurantId), {
              name,
              longitude,
              latitude,
              description,
              hoursOpen,
              phone
            }, { merge: true });

            ToastAndroid.show('Changes saved successfully!', ToastAndroid.SHORT);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting restaurant details:', error);
    }
  };

  return (

    <View style={styles.container}>
  <Text style={styles.label}>Restaurant Name:</Text>
  <TextInput
    style={styles.input}
    placeholder="Restaurant Name"
    value={name}
    onChangeText={setName}
  />
  <Text style={styles.label}>Longitude:</Text>
  <TextInput
    style={styles.input}
    value={longitude.toString()} 
    onChangeText={value => setLongitude(parseFloat(value) || 0)} 
    keyboardType="numeric"
  />
  <Text style={styles.label}>Latitude:</Text>
  <TextInput
    style={styles.input}
    placeholder="Latitude"
    value={latitude.toString()} 
    onChangeText={value => setLatitude(parseFloat(value) || 0)} 
    keyboardType="numeric"
  />
  <Text style={styles.label}>Description:</Text>
  <TextInput
    style={styles.input}
    placeholder="Description"
    value={description}
    onChangeText={setDescription}
  />
  <Text style={styles.label}>Hours Open:</Text>
  <TextInput
    style={styles.input}
    placeholder="Hours Open"
    value={hoursOpen}
    onChangeText={setHoursOpen}
  />
  <Text style={styles.label}>Phone:</Text>
  <TextInput
    style={styles.input}
    placeholder="Phone"
    value={phone.toString()} 
    onChangeText={value => setPhone(parseInt(value) || 0)} // 
    keyboardType="numeric"
  />
  <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
    <Text style={styles.buttonText}>Save</Text>
  </TouchableOpacity>
</View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'black',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
    right: 0,
    left: 0,
    bottom: 0,
    
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default RestaurantManagement;
