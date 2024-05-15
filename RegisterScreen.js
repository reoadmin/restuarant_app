import { StyleSheet, Text, View, Button, ImageBackground, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import {  auth } from '../firebase';
import { db } from '../firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { useState } from 'react';


export default function RegisterScreen({ navigation }) {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");  
    const [errors, setErrors] = useState("");

    //function to regiister a user
    const handleRegister = async () => {
     try {
      const userCredentials = await createUserWithEmailAndPassword(auth, username, password);
      await sendEmailVerification(userCredentials.user)
      const userData = {
        email: username,
        firstname: firstname,
        lastname: lastname,
        role: 'customer'
      }
      await setDoc(doc(db,'users', userCredentials.user.uid), userData);
      if (validateForm()){
      Alert.alert('Success', 'Please check your email for verification')
      //redirect to login after successful registration
      navigation.navigate('Login')
      }
     } catch (error) {
      Alert.alert('error', error.message)
     }
    };
    //input validation
    const validateForm = () => {
        let errors = {}

        if (!firstname) errors.firstname = "Firstname is required"
        if (!lastname) errors.lastname = "Lastname is required"
        if (!username) errors.username = "Username is required"
        if (!password) errors.password = "Password is required"

        setErrors(errors);

        return Object.keys(errors).length === 0;
    };
  
    return (
      <KeyboardAvoidingView style={styles.container} behavior='padding'>
          <View style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>First Name</Text>
                <TextInput style={styles.input} placeholder='First Name'autoCorrect={false} autoCapitalize='none'
                 value={firstname} onChangeText={setFirstname} />
                  {
                    errors.firstname ? <Text style={styles.errorText}>{errors.firstname}</Text> : null
                 }
                <Text style={styles.label}>Last Name</Text>
                <TextInput style={styles.input} placeholder='Last Name'autoCorrect={false} autoCapitalize='none' 
                 value={lastname} onChangeText={setLastname}/>
                  {
                    errors.lastname ? <Text style={styles.errorText}>{errors.lastname}</Text> : null
                 }
                
                <Text style={styles.label}>Email</Text>
                <TextInput style={styles.input} placeholder='email@example.com'autoCorrect={false} autoCapitalize='none' 
                 value={username} onChangeText={setUsername}/>
                  {
                    errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null
                 }
                <Text style={styles.label}>Password</Text>
                <TextInput style={styles.input} placeholder='password' secureTextEntry 
                value={password} onChangeText={setPassword}/>
                 {
                    errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null
                 }
            </View>
               
            <View style={styles.container3}>
              <View style={styles.buttonStyle}>
               <Button title='Register' onPress={handleRegister}/>
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
    container2: {
      flex: 1,
      flexDirection: 'column',
      borderWidth: 5,
      borderColor: 'red'
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
      padding: 16
    },
    errorText: {
        color: 'red',
        marginBottom: 10
    }
  });