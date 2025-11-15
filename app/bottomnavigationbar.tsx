import { MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
const BottomNavigationBar = () => {
  const [uid,setuid]=useState("")

   const getUid = async () => {
    try {
      const id = await AsyncStorage.getItem("uid");
      if (id !== null) {
        setuid(id);
      }
    } catch (error) {
      console.error("Error fetching UID:", error);
    }
  };

  useEffect(() => {
    getUid();
  }, []);

const gotomypets=()=>{
    router.push({
      pathname:"/mypets",
      params:{uid:uid}
    });
  }

  const gotoSymptomChecker=()=>{
    router.push("/symptomchecker");
  }
  const gotoAppointments=()=>{
    router.push({
      pathname:"/appointments",
      params:{uid:uid}
    });//temporarily for testing
  }
  
  const gotoHome=()=>{
    router.push({
      pathname:"/home",
      params:{uid:uid}
    })
  }

  const gotoImageChecker=()=>{
    router.push("/imagechecker");
  }


    return (




    <KeyboardAvoidingView  style={{ flex: 1, backgroundColor: "orange" }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScrollView>
        <View style={{backgroundColor:"white",alignItems:'flex-start', marginTop:20,flexDirection:"row"}}>
          
            <TouchableOpacity onPress={gotoHome} activeOpacity={0.7}>
            <View style={{flexDirection:"column", paddingLeft:15}}>
                <MaterialCommunityIcons name='home' size={30} color="blue"/>
                <Text style={{fontWeight:'bold', fontSize:12}}>Home</Text>
            </View>
          </TouchableOpacity>


          <TouchableOpacity onPress={gotomypets} activeOpacity={0.7}>
            <View style={{flexDirection:"column", marginLeft:20}}>
                <MaterialCommunityIcons name='paw' size={30} color="red"/>
                <Text style={{fontWeight:'bold', fontSize:12}}>My Pets</Text>
            </View>
          </TouchableOpacity>

            <TouchableOpacity onPress={gotoSymptomChecker} activeOpacity={0.7}>
            <View style={{flexDirection:"column", marginLeft:20}}>
                <MaterialCommunityIcons name='brain' size={30} color="lightpink" style={{marginLeft:10}}/>
                <Text style={{fontWeight:'bold', fontSize:12}}>AI Checker</Text>
            </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={gotoAppointments} activeOpacity={0.7}>

            <View style={{flexDirection:"column", marginLeft:20}}>
                <MaterialCommunityIcons name='calendar' size={30} color="red" style={{marginLeft:10}}/>
                <Text style={{fontWeight:'bold', fontSize:12}}>Appointments</Text>
            </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={gotoImageChecker} activeOpacity={0.7}>
            <View style={{flexDirection:"column", marginLeft:20}}>
                <MaterialCommunityIcons name='camera' size={30} color="black" style={{marginLeft:10}}/>
                <Text style={{fontWeight:'bold', fontSize:12}}>Detector</Text>
            </View>
            </TouchableOpacity>
        </View>
    </ScrollView>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>

  )
}

export default BottomNavigationBar