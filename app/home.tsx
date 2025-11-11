import { db } from "@/src/config/firebase";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";

const Home = () => {
  
  const { uid } = useLocalSearchParams();
  const[name,setname]=useState("");
  
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
      pathname:"/bookapointment",
      params:{uid:uid}
    });//temporarily for testing
  }
  const gotoReminders=()=>{
    router.push("/reminders");
  }
  const gotoHealthRecords=()=>{
    router.push("/healthrecords");
  }

  const gotoImageChecker=()=>{
    router.push("/imagechecker");
  }

  useEffect(() => {
    const getUserName = async () => {
      try {
        
        if (!uid || typeof uid !== "string") {
          console.log(" Invalid UID:", uid);
          alert("Invalid user ID");
          return;
        }

        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("👤 User data:", userData);
         setname(userData.name)
        } else {
          console.log("❌ No user document found");
        }
      } catch (error) {
        console.log("🔥 Error fetching user data:", error);
        
      }
    };
    getUserName();
  }, [uid]);

  return (
    <View style={{ flex: 1, backgroundColor:"orange", marginTop:40 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", paddingLeft:20,paddingTop:30  }}>Hi,{name}</Text>
      
      <View style={{flexDirection:"row",padding:30, paddingTop:50}}>
      
      <Button icon="paw" style={{ width:130, height:100, backgroundColor:"lightblue", borderRadius:7}}
      contentStyle={{flexDirection:"column", alignItems:"center", marginTop:20}} 
       onPress={gotomypets}><Text style={{color:"black", textAlign:"center", flexWrap:"wrap"}}> My Pets</Text></Button>
     
      <Button icon={"brain"} style={{ width:130, height:100, backgroundColor:"lightgreen", borderRadius:7, marginLeft:20}}
      contentStyle={{flexDirection:"column", alignItems:"center", marginTop:20}} 
      onPress={gotoSymptomChecker}><Text style={{color:"black", flexWrap:"wrap" ,textAlign:"center",}}> AI Symptom Checker</Text></Button>
        
        </View >
        
        <View style={{flexDirection:"row",padding:30, paddingTop:50}}>

        <Button icon={"calendar"} style={{ width:130, height:100, backgroundColor:"cyan", borderRadius:7}}
      contentStyle={{flexDirection:"column", alignItems:"center", marginTop:20}} 
      onPress={gotoAppointments}><Text style={{color:"black", textAlign:"center", flexWrap:"wrap"}}> Appointments</Text></Button>
     
      <Button icon={"bell"} style={{ width:130, height:100, backgroundColor:"yellow", borderRadius:7, marginLeft:20}}
      contentStyle={{flexDirection:"column", alignItems:"center", marginTop:20}} 
      onPress={gotoReminders}><Text style={{color:"black", flexWrap:"wrap" ,textAlign:"center",}}> Reminders</Text></Button>
       
        </View>

        <View style={{flexDirection:"row",padding:30, paddingTop:50}}>

        <Button icon={"file"} style={{ width:130, height:100, backgroundColor:"lightblue", borderRadius:7}}
      contentStyle={{flexDirection:"column", alignItems:"center", marginTop:20}} 
      onPress={gotoHealthRecords}><Text style={{color:"black", textAlign:"center", flexWrap:"wrap"}}> Health Records</Text></Button>
     
      <Button icon={"camera"} style={{ width:130, height:100, backgroundColor:"purple", borderRadius:7, marginLeft:20}}
      contentStyle={{flexDirection:"column", alignItems:"center", marginTop:20}} 
      onPress={gotoImageChecker}><Text style={{color:"black", flexWrap:"wrap" ,textAlign:"center", }}> Image</Text></Button>
       
        </View>

    </View>
  );
};

export default Home;
