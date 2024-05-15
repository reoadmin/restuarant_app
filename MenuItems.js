import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { collection, getDocs, query, where, doc, updateDoc, getDoc, deleteDoc, addDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

const MenuItems = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  // Fetch the restaurant ID of the current user
  useEffect(() => {
    const fetchRestaurantId = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          // Handle the case where the user is not logged in
          return;
        }

        // determine the link between admin and restaurant
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

  // Fetch the menu items when the restaurant ID changes
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        if (!restaurantId) return;
        
        const menuQuery = query(collection(db, 'restaurants', restaurantId, 'menu'));
        const unsubscribe = onSnapshot(menuQuery, (snapshot) => {
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMenuItems(items);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, [restaurantId]);

  // Filter menu items based on search term
  useEffect(() => {
    const filteredItems = menuItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMenuItems(filteredItems);
  }, [menuItems, searchTerm]);

  // Function to update the selected menu item
  const handleUpdateMenuItem = async (itemId) => {
    try {
      // Update the menu item with the new data
      const itemRef = doc(db, 'restaurants', restaurantId, 'menu', itemId);
      await updateDoc(itemRef, {
        name: itemName,
        description: itemDescription,
        price: itemPrice
      });

      Alert.alert('Menu item updated successfully');
    } catch (error) {
      console.error('Error updating menu item:', error);
      Alert.alert('Error updating menu item');
    }
  };
// function to add a menu item
  const handleAddMenuItem = async () => {
    try {
      const newItem = {
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice)
      };

      // Add the new menu item to the database
      await addDoc(collection(db, 'restaurants', restaurantId, 'menu'), newItem);

      // Clear the input fields
      setItemName('');
      setItemDescription('');
      setItemPrice('');

      Alert.alert('Menu item added successfully');
    } catch (error) {
      console.error('Error adding menu item:', error);
      Alert.alert('Error adding menu item');
    }
  };

  // Function to delete a menu item
  const handleDeleteMenuItem = async (itemId) => {
    try {
      // Delete the menu item from the database
      await deleteDoc(doc(db, 'restaurants', restaurantId, 'menu', itemId));

      Alert.alert('Menu item deleted successfully');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      Alert.alert('Error deleting menu item');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
  <Text style={styles.title}>Menu Items</Text>
  <TextInput
    style={styles.searchInput}
    value={searchTerm}
    onChangeText={setSearchTerm}
    placeholder="Search menu item"
  />
  {/* Conditionally render the list of menu items based on the search term */}
  {searchTerm === '' ? (
    // Display the add new item form if no search term is entered
    <View style={styles.menuItem}>
      <Text style={styles.label}>New Item Name:</Text>
      <TextInput
        style={styles.input}
        value={itemName}
        onChangeText={setItemName}
        placeholder="Enter item name"
      />
      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={styles.input}
        value={itemDescription}
        onChangeText={setItemDescription}
        placeholder="Enter item description"
      />
      <Text style={styles.label}>Price:</Text>
      <TextInput
        style={styles.input}
        value={itemPrice}
        onChangeText={setItemPrice}
        placeholder="Enter item price"
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddMenuItem}>
        <Text style={styles.buttonText}>Add Item</Text>
      </TouchableOpacity>
    </View>
  ) : (
    // Display the filtered menu items if a search term is entered
    filteredMenuItems.map(item => (
      <View key={item.id} style={styles.menuItem}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={itemName}
          onChangeText={setItemName}
          placeholder={item.name}
        />
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={styles.input}
          value={itemDescription}
          onChangeText={setItemDescription}
          placeholder={item.description}
        />
        <Text style={styles.label}>Price:</Text>
        <TextInput
          style={styles.input}
          value={itemPrice}
          onChangeText={setItemPrice}
          placeholder={String(item.price)}
          keyboardType="numeric"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.updateButton} onPress={() => handleUpdateMenuItem(item.id)}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteMenuItem(item.id)}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    ))
  )}
</ScrollView>
    </View>
  )
};

export default MenuItems;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  menuItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
  },
  addButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 5,
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});
