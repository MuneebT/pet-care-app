import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';


import { db } from "@/src/config/firebase";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button } from "react-native-paper";
import BottomNavigationBar from "./bottomnavigationbar";
const Bookapointment = () => {
  const {uid}=useLocalSearchParams()
  const [pets, setpets] = useState(["Kato", "Milo", "Rocky"]);
  const [selectedpet, setselectedpet] = useState("");
  const[vets,setvets]=useState([])
  const [selectedvet,setselectedvet]=useState("")
  
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);


  const scheduleappointment=async()=>{
    try{
      await addDoc(collection(db,"appointments"),{
        userId:uid,
        petname:selectedpet,
        vetname:selectedvet,
        date:date.toLocaleDateString(),
        time:date.toLocaleTimeString(),
        stattus:false
      });
      alert("Appointment added")
    }
    catch(err){
      console.log(err)
    }
  }

  const fetchPets = async () => {
    try {
      if (!uid) {
        console.warn("⚠️ No UID found in params!");
        return;
      }

      const petsRef = collection(db, "pets");
      const q = query(petsRef, where("userId", "==", uid));
      const snapshot = await getDocs(q);

      const petNames = snapshot.docs.map((doc) => doc.data().name as string);
      setpets(petNames);
      console.log("✅ Pets fetched:", petNames);
    } catch (error) {
      console.error("🔥 Error fetching pets:", error);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [uid]);


   const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false); // close picker automatically on Android
    }

    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showPicker = (type: 'date' | 'time') => {
    setMode(type);
    setShow(true);
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "orange" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{flex:1}}>
        <ScrollView
          style={{ flex: 1, backgroundColor: "orange" }} // ensures base color fills screen
          contentContainerStyle={{
            flexGrow: 1, // 👈 makes scrollview fill screen height
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              marginTop: 40,
              width: 320,
              marginBottom: 10,
              alignItems: "center",
              borderRadius: 10,
              paddingVertical: 20,
              elevation: 4,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                Book Appointment
              </Text>
              <MaterialCommunityIcons
                name="calendar"
                size={30}
                color="lightblue"
                style={{ paddingLeft: 10 }}
              />
            </View>

            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <MaterialCommunityIcons
                name="paw"
                size={20}
                color="lightblue"
                style={{ marginTop: 10 }}
              />
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  paddingTop: 10,
                  paddingRight: 100,
                  paddingLeft: 5,
                }}
              >
                Select Your Pet
              </Text>
            </View>

            <Picker
              selectedValue={selectedpet}
              onValueChange={setselectedpet}
              style={{
                backgroundColor: "lightgray",
                marginBottom: 15,
                marginTop: 10,
                width: 270,
              }}
            >
              <Picker.Item label="Select Pet" value="" enabled={false} />
              {pets.map((type, index) => (
                <Picker.Item key={index} label={type} value={type} />
              ))}
            </Picker>
            <View style={{flexDirection:"row", marginRight:100}}>
                <MaterialCommunityIcons name="stethoscope" size={20} color="blue"  style={{marginTop:10}}/>
                <Text style={{fontWeight:"bold", fontSize:15,paddingTop:10, marginLeft:5}}>Select Veterinarian</Text>
            </View>
              <View style={{borderRadius:10}} >
                ,<Picker selectedValue={selectedvet} onValueChange={setselectedvet} style={{backgroundColor:"lightgray"
                    ,marginTop:10, marginBottom:15,width:270, borderRadius:10, fontSize:20, fontWeight:"bold"}}>
                <Picker.Item label="Select Veterinarian" value="" enabled={false}/>
                {vets.map((vet,index)=>(
                    <Picker.Item key={index} label={vet} value={vet}/>
                ))}
                </Picker>
              </View>

                <View style={{flexDirection:"column"}}>
                  <View style={{flexDirection:"row", marginRight:150}}>
                  <MaterialCommunityIcons name="calendar" size={20} color="blue" style={{marginTop:10}}/>
                  <Text style={{fontWeight:"bold", fontSize:15,paddingTop:10, marginLeft:5}}>Select Date</Text>
                  
                  </View>
                  <Button onPress={()=>showPicker('date')} style={{width:250, backgroundColor:"lightgray", marginTop:10}}
                   labelStyle={{color:"black", fontWeight:"bold", fontSize:17}}>Pick a Date</Button>
                </View>

                <View style={{flexDirection:"column"}}>
                  <View style={{flexDirection:"row", marginRight:130}}>
                    <MaterialCommunityIcons name="clock" size={20} color="lightgreen" style={{marginTop:10}}/>
                    <Text style={{fontWeight:"bold", fontSize:15,paddingTop:10, marginLeft:5}}>Select Time</Text>
                  </View>
                  <Button onPress={()=>showPicker('time')} style={{backgroundColor:"lightgray", marginTop:10}}
                   labelStyle={{color:"black", fontWeight:"bold", fontSize:17}}>Pick a Time</Button>
                </View>

                <View style={{marginTop:20}}>
                  
                  <Button style={{backgroundColor:"lightblue" } }
                   labelStyle={{fontWeight:"bold", fontSize:17, color:"black"}}
                   onPress={scheduleappointment}>Schedule</Button>
                </View>
                  {show && (
        <DateTimePicker
          value={date}
          mode={mode}
          display="default"
          onChange={onChange}
        />
      )}

          </View>
        </ScrollView>
        <View style={{position:"absolute", bottom:0, left:0, right:0}}>
        <BottomNavigationBar />
        </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Bookapointment;
