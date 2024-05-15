import { StyleSheet, Text, View, Button, ImageBackground } from 'react-native';
const tableImg = require("../assets/Table1.jpg")
//Welcome screen
export default function LandingScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <ImageBackground source={tableImg}  style={styles.backImg} >
            </ImageBackground>   
        <View style={styles.container3}>
        <View style={styles.buttonStyle}>
          <Button title='LOG IN'  onPress={() => navigation.navigate("Login")} />
        </View>
        <View style={styles.buttonStyle}>
        <Button title='REGISTER' onPress={() => navigation.navigate("Register")} />
        </View>
       
      </View>
      
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingBottom: 60
    },
    text: {
      textAlign: 'center'
    },
    container2: {
      flex: 1,
      flexDirection: 'column',
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
      width: '50%',
      padding: 16,
      color: 'black'
    },
    backImg: {
      flex: 1,
      width: null,
      height: null
    }
  });