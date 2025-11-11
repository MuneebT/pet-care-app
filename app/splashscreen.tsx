import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

const SplashScreen = () => {
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(()=>{
    const timer=setTimeout(()=>{
      router.push("/signup")
    },3000)
  },[])
  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/images/paw.jpg')}
          style={styles.image}
        />
      </View>

      <Text style={styles.title}>PET SCAN</Text>

      <Animated.View style={[styles.dotsContainer, { transform: [{ rotate }] }]}>
        <View style={[styles.dot, { top: 0 }]} />
        <View style={[styles.dot, { bottom: 0 }]} />
        <View style={[styles.dot, { right: 0 }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    marginTop: 40,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    borderColor: 'orange',
  },
  title: {
    fontSize: 30,
    marginTop: 25,
    fontWeight: 'bold',
    color: 'white',
  },
  dotsContainer: {
    marginTop: 80,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
});

export default SplashScreen;