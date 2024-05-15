
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, Modal, RefreshControl, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Location from 'expo-location';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';


const HomeScreen = ({ navigation, route }) => {
    const { firstName, Username, UID } = route.params;
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [restaurant, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false); 

    

    useEffect(() => {
        fetchLocation();
        fetchRestaurants();

    }, []);
//get location of user and ask permission to use
    const fetchLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
//set initial location
            setLocation({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        };
   
//get restaurants to display on map
    const fetchRestaurants = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'restaurants'));
                const restaurantData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRestaurants(restaurantData);
            } catch (error) {
                console.error('Error fetching restaurant data:', error);
            } finally {
                setRefreshing(false);
            }
        };

//Press on marker shows modal
    const handleMarkerPress = useMemo(() => {
        return (restaurant) => {
            setSelectedRestaurant(restaurant);
            setModalVisible(true);
        };
    }, []);
//search for restaurants by name
    const handleSearch = (query) => {
        setSearchQuery(query.toLowerCase());
    };
//view additional infromation on restaurant
    const handleViewDetails = useCallback(() => {
        setModalVisible(false);
        navigation.navigate('Details', {
            restaurantName: selectedRestaurant.name,
            restaurantImage: selectedRestaurant.image,
            firstname: firstName,
            UserName: Username,
            userID: UID
        
        });
    }, [navigation, selectedRestaurant]);

    const filteredRestaurants = useMemo(() => {
        return searchQuery ? restaurant.filter(restaurant =>
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) : restaurant;
    }, [restaurant, searchQuery]);

    return (
        <View style={styles.container}>
            <Text style={{ textAlign: 'center' }}>Hi {firstName}, Where Would you like to Eat?</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchBox}
                    placeholder='Search for Restaurants...'
                    onChangeText={handleSearch}
                    value={searchQuery}
                />
            </View>
            {location && (
                <MapView style={styles.map} showsUserLocation={true} initialRegion={location}>
                    {filteredRestaurants.map((restaurant) => (
                        <Marker
                            key={restaurant.id}
                            coordinate={{ latitude: restaurant.latitude, longitude: restaurant.longitude }}
                            onPress={() => handleMarkerPress(restaurant)}
                        />
                    ))}
                </MapView>
            )}
            <Modal
                animationType='slide'
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => { setModalVisible(false); }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedRestaurant?.name}</Text>
                        {selectedRestaurant && (
                            <>
                                <Image source={{ uri: selectedRestaurant?.image }} style={styles.modalImage} />
                                <TouchableOpacity onPress={handleViewDetails} style={styles.button}>
                                    <Text style={styles.buttonText}>View Details</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10, backgroundColor: 'red', marginTop: 20 }}>
                                    <Text style={{ color: 'white' }}>Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    map: {
        width: '100%',
        height: '100%',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    modalImage: {
        width: 200,
        height: 200,
        marginBottom: 10
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    searchContainer: {
        position: 'relative',
        left: 5,
        right: 10,
        zIndex: 1,
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10
    },
    searchBox: {
        height: 40,
        borderColor: 'black',
        borderWidth: 1,
        padding: 10
    }
});
