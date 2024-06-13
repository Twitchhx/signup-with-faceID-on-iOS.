import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID',
  });
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        const biometricAuth = await LocalAuthentication.authenticateAsync();
        if (biometricAuth.success) {
          setUserData(parsedUser);
        } else {
          Alert.alert('Authentication failed');
        }
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetch(`https://graph.facebook.com/me?access_token=${authentication.accessToken}&fields=id,name,email`)
        .then(response => response.json())
        .then(data => {
          const user = {
            name: data.name,
            email: data.email,
            language: 'en', // You can update this based on user preferences or other logic
          };
          AsyncStorage.setItem('user', JSON.stringify(user));
          setUserData(user);
        })
        .catch(error => {
          console.error('Error fetching data from Facebook:', error);
        });
    }
  }, [response]);

  return (
    <View style={styles.container}>
      {userData ? (
        <Text>Hello, {userData.name}. Your email is {userData.email} and your interface language has been set to {userData.language}.</Text>
      ) : (
        <Button
          disabled={!request}
          title="Login with Facebook"
          onPress={() => {
            promptAsync();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
