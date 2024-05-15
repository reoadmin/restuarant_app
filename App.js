import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ImageBackground } from 'react-native';
import 'react-native-gesture-handler';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ViewDetails from './screens/ViewDetails';
import ReservationScreen from './screens/ReservationScreen';
import Reservations from './screens/Reservations';
import AdminDashboard from './screens/AdminDashboard';
import AdminReservations from './screens/AdminReservations';
import RestaurantManagement from './screens/RestaurantManagement';
import TableAvailability from './screens/TableAvailability';
import MenuItems from './screens/MenuItems';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const AdminDrawer = createDrawerNavigator();

const App = () => {
  return (
    <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Welcome to Book 'n' Dine" component={LandingScreen} options={{ headerShown: true}} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Details" component={ViewDetails}  />
      <Stack.Screen name="Reserve" component={ReservationScreen}  />
      <Stack.Screen name="HomePage" component={DrawerNavigator} options={{ headerShown: false}} />
      <Stack.Screen name="AdminDashPage" component={AdminDrawerNaviagtor} options={{ headerShown: false}} ></Stack.Screen>


    </Stack.Navigator>
  </NavigationContainer>

    
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator drawerContent={CustomDrawerContent}>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Reservations" component={Reservations} />
    </Drawer.Navigator>
  );
};

const CustomDrawerContent = (props) => {
  const navigation = useNavigation();

  const handleLogout = () => {
      // logout logic 
      navigation.navigate('Login');
  };

  return (
      <DrawerContentScrollView {...props}>
          <DrawerItemList {...props} />
          <DrawerItem
              label="Logout"
              onPress={handleLogout}
              inactiveTintColor="red"
              inactiveBackgroundColor="transparent" 
          />
      </DrawerContentScrollView>
  );
};

const AdminDrawerNaviagtor = () => {

  return (
    <AdminDrawer.Navigator drawerContent={CustomDrawerContent}>
      <AdminDrawer.Screen name="Admin Home" component={AdminDashboard} />
      <AdminDrawer.Screen name="Restaurant Management" component={RestaurantManagement} />
      <AdminDrawer.Screen name="Admin Reservations" component={AdminReservations} />
      <AdminDrawer.Screen name="Table Availability" component={TableAvailability} />
      <AdminDrawer.Screen name="Update MenuItems" component={MenuItems} />
    </AdminDrawer.Navigator>
  );
};






export default App;
