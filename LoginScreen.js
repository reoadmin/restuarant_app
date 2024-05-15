import { StyleSheet, Text, View, Button, ImageBackground, StatusBar, TextInput, KeyboardAvoidingView, Alert, TouchableOpacity } from 'react-native';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';


export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState("");
  //get credentials from database and verify
    const handleLogin = async () => {
      try {
        const userCredentials = await signInWithEmailAndPassword(auth, username, password);

        const userDocRef = doc(db, 'users', userCredentials.user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const role = userData.role;

          if (role == 'admin') {

            navigation.navigate('AdminDashPage');
          } else {

            navigation.navigate('HomePage', { screen: 'Home', params: {firstName: userData.firstname, Username: username, UID: userCredentials.user.uid }});
          }
          
        

          Alert.alert('Succesfull Login');   
        } else {
          throw new Error('user document  not found');
        }
       
        
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    }
    //forgot password feature
    const handleForgotPassword = async () => {
    try {
    await sendPasswordResetEmail(auth, username);
    Alert.alert('Success', 'Password reset email sent');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    };
    //form validation
    const validateForm = () => {
        let errors = {}

        if (!username) errors.username = "Username is required"
        if (!password) errors.password = "Password is required"

        setErrors(errors);

        return Object.keys(errors).length === 0;
    };
  
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">
         <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} placeholder='email@example.com'autoCorrect={false} autoCapitalize='none'
                 value={username} onChangeText={setUsername} />
                 {
                    errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null
                 }
                <Text style={styles.label}>Password </Text>
                <TextInput style={styles.input} placeholder='password' secureTextEntry value={password} onChangeText={setPassword}/>
                {
                    errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null
                 }
                 <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={{ color: 'blue', textDecorationLine: 'underline', marginTop: 10}}>Forgot Password?</Text>
                 </TouchableOpacity>
            </View>
         <View style={styles.container3}>
           <View style={styles.buttonStyle}>
            <Button title='Login' onPress={handleLogin}/>
           </View>
       
        </View>
      
        </View>
    </KeyboardAvoidingView>
       
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    form: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: 'bold'
    },
    input: {
      height: 40,
      borderColor: 'black',
      marginBottom: 15,
      padding: 10,
      borderWidth: 1,
      borderRadius: 5
    },
    container3: {
      flex: 1,
      flexDirection:'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      bottom: 0,
      position: 'absolute'
    },
    buttonStyle: {
      width: '100%',
      padding: 16,
  
    },
    errorText: {
        color: 'red',
        marginBottom: 10
    }
  });