import { StyleSheet, Text, View, Image, ScrollView, KeyboardAvoidingView, Alert, TouchableOpacity, Animated } from 'react-native';
import { db } from '../firebase';
import { collection, query, getDocs, doc, where, getDoc } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';

export default function ViewDetails({ navigation, route }) {
    const { restaurantName, restaurantImage, firstname, UserName, userID } = route.params;
    const [ restaurantID, setRestaurantID ] = useState(null);
    const [ menuItems, setMenuItems ] = useState([]);
    const [restaurantInfo, setRestaurantInfo] = useState(null);


    useEffect(() => {

      const fetchRestaurantInfo = async () => {
        try {
          // Query Firestore to find the restaurant document with the specified name
          const restaurantQuery = query(collection(db, 'restaurants'), where('name', '==', restaurantName));
          const restaurantSnapshot = await getDocs(restaurantQuery);
  
          if (!restaurantSnapshot.empty) {
            // Extract the first restaurant document
            const restaurantDoc = restaurantSnapshot.docs[0];
            // Extract restaurant information
            const data = restaurantDoc.data();
            setRestaurantInfo(data);
          } else {
            console.error('Restaurant not found');
          }
        } catch (error) {
          console.error('Error fetching restaurant information:', error);
        }
      }
  
      fetchRestaurantInfo();
     [restaurantName];

      const fetchMenu = async () => {
        try {
          // Query Firestore to find the restaurant document with the specified name
          const restaurantQuery = query(collection(db, 'restaurants'), where('name', '==', restaurantName));
          const restaurantSnapshot = await getDocs(restaurantQuery);
          
          if (!restaurantSnapshot.empty) {
            // Extract the restaurant ID
            const restaurantId = restaurantSnapshot.docs[0].id;
            setRestaurantID(restaurantId);
      
            
            const menuRef = collection(doc(db, 'restaurants', restaurantId), 'menu');
                    
                    // Query Firestore to retrieve menu items for the restaurant
                    const menuSnapshot = await getDocs(menuRef);

                    // Extract menu items
                    const menuData = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setMenuItems(menuData);
                }
            } catch (error) {
                console.error('Error fetching menu:', error);
            }
        };

        fetchMenu();
    }, [restaurantName]);
  

  const handleReservation = () => {
    // reservation functionality
    navigation.navigate('Reserve', {
      restaurantName: restaurantName,
      username: firstname,
      email: UserName,
      Uid: userID,
      restaurantid: restaurantID
  });
    console.log("Reservation button pressed");
  };
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container}>
        <Image source={{ uri: restaurantImage }} style={styles.image} />
        <Text style={styles.title}>{restaurantName}</Text>
        {restaurantInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Text style={styles.sectionContent}>Description: {restaurantInfo.description}</Text>
            <Text style={styles.sectionContent}>Open Hours: {restaurantInfo.hoursOpen}</Text>
            <Text style={styles.sectionContent}>Contact Us: {restaurantInfo.phone}</Text>
          </View>
        )}
        {/* Menu section */}
        <View style={styles.section}>
  <     Text style={styles.sectionTitle}>Menu</Text>
        {menuItems.map(item => (
          <View key={item.id} style={styles.menuItemContainer}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
            <Text style={styles.itemPrice}>P{item.price}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
       <TouchableOpacity style={styles.reservationButton} onPress={handleReservation}>
       <Text style={styles.buttonText}>Make Reservation</Text>
      </TouchableOpacity>
    </View>
      );
      
    }
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingBottom:30
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    marginBottom: 5,
  },
  menuItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  menuItemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 16,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  reservationButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
},
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});