import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Switch, SafeAreaView, Image, Button, ScrollView, TextInput, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';

import { BarChart } from "react-native-gifted-charts";


export default function App() {


  const contentInset = { top: 20, bottom: 20, left: 20, right: 20 };
  const [selectedLanguage, setSelectedLanguage] = useState("0");
  const [English, setEnglish] = useState('')
  const [Amharic, setAmharic] = useState('')


  const [inputValue, setInputValue] = useState('');
  const [gasReading, setGasReading] = useState(0);
  const [lightReading, setLightReading] = useState(0);
  const [status, setStatus] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [ipAddress, setIpAddress] = useState("http://192.168.8.119");

  const handleIpInput = (text) => {
    setIpAddress(text); // Update the IP address state
  };


  function languageChange(type) {
    setSelectedLanguage(type);
  }
  // State to hold bar data

  const [barData, setBarData] = useState([]);

  async function getAISupport() {
    setLoadingData(true)
    setLoadingData(true);

    if (barData.length) {

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 20000) // 5 seconds timeout
      );

      try {
        const response = await Promise.race([
          fetch("http://128.140.74.42:3001/support", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: barData,
            }),
          }),
          timeoutPromise,
        ]);

        // Parse the JSON response
        try {
          const jsonData = await response.json(); // Wait for JSON parsing
          setAmharic(jsonData.data.amh)
          setEnglish(jsonData.data.eng)
        } catch (error) {
          console.log("Error parsing JSON:", error);
        }
      } catch (error) {
        console.log("Error fetching data or timed out:", error);
      } finally {
        setLoadingData(false); // Set loading state back to false
      }
    } else {
      setEnglish("No sensor data!")
      setAmharic("የሴንሰር መረጃ የለም")
      setLoadingData(false); // Set loading state back to false
    }
  }


  // Fetch data from the URL
  const fetchData = async () => {
    const controller = new AbortController(); // Create an AbortController to cancel fetch if timeout occurs
    const timeout = 10000; // Set the timeout duration (e.g., 5000ms = 5 seconds)

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => {
        controller.abort(); // Abort the fetch request after the timeout
        reject(new Error('Request timed out')); // Reject with an error message
      }, timeout)
    );

    try {
      console.log(ipAddress + ":5000/data");

      // Use Promise.race to race between fetch and the timeout
      const response = await Promise.race([
        fetch(ipAddress + ":5000/data", { signal: controller.signal }),
        timeoutPromise
      ]);

      // Check if the response is OK
      if (!response.ok) {
        console.log(`HTTP error! status: ${response.status}`);
      }

      const rawText = await response.text(); // Get the raw text

      // Clean the raw text
      const cleanedText = rawText.replace(/[\u0000-\u001F%]/g, ''); // Remove control characters and %

      // Parse the JSON
      try {
        const jsonData = JSON.parse(cleanedText); // Parse the cleaned text as JSON
        if (jsonData.length > 0) {
          const newBarData = []; // Temporary array to hold new bar data

          for (let i = 0; i < jsonData.length; i += 2) {
            if (jsonData[i + 1]) {
              const pValue = parseFloat(jsonData[i].split(" ")[0]); // Ensure it's a number
              const mValue = parseFloat(jsonData[i + 1].split(" ")[2]); // Ensure it's a number

              newBarData.push({ value: mValue + 1, label: 'P' + (i / 2 + 1) + '-M', frontColor: '#F07368' }); // M value
              newBarData.push({ value: pValue, label: 'P' + (i / 2 + 1) + '-T' }); // T value
            }
          }

          // Update the state
          setBarData(newBarData); // Update state with the new bar data
          setStatus(true);
          setEnglish("You can now get support!");

        } else {
          setBarData([]);
          setStatus(false);
        }

      } catch (error) {
        console.log('Error parsing JSON:', error);
        setEnglish("Something went wrong!" + ipAddress + error.message + " " + Date.now());
      }
    } catch (error) {
      // Log the error or timeout
      if (error.message) {
        setEnglish(ipAddress + error.message + " " + Date.now());
      }
      setStatus(false);
    }
  };

  // Call fetchData when the component mounts
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 20000); // Fetch data every 10 seconds (adjust as needed)

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);


  return (
    <SafeAreaView>

      <View style={styles.container}>

        <View style={[styles.status, status === true && styles.statusLive]}></View>

        <View style={styles.topTitleCon}>
          <View style={styles.topGrid}>

            <View style={styles.gifCon}>
              <ImageBackground
                source={require('./assets/robot.gif')}
                style={styles.gif}
                resizeMode="contain" // This ensures the whole image is visible
              />
            </View>

            <Text style={styles.topTitle}>Agri Robot</Text>
          </View>
        </View>

        <ScrollView>
          <Text style={styles.sensor_reading_text}>Sensor Readings</Text>
          <View style={styles.sensorReadingCon}>

            {barData.length === 0 ? (
              <Text>No data available</Text>
            ) : (
              <BarChart
                isAnimated
                barWidth={22}
                noOfSections={3}
                barBorderRadius={4}
                frontColor="#177AD5"
                data={barData}
                yAxisThickness={0}
                xAxisThickness={0}
              />
            )}
          </View>

          <View style={[styles.sensorReadingCon, styles.sensorReadingConTwo]}>
            <Text>Moisture</Text>
            <Text>Temperature</Text>
          </View>
          <View style={styles.aiCon}>
            <View style={styles.topNavCon}>
              <TouchableOpacity style={[styles.lanBtns, selectedLanguage === "0" && styles.activeButton]} onPress={() => languageChange("0")}>
                <Text style={[styles.lanBtnText, selectedLanguage === "0" && styles.activeText]} >English</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.lanBtns, selectedLanguage === "1" && styles.activeButton]} onPress={() => languageChange("1")}>
                <Text style={[styles.lanBtnText, selectedLanguage === "1" && styles.activeText]}>አማርኛ</Text>
              </TouchableOpacity>
            </View>
            <ScrollView nestedScrollEnabled style={styles.textCon}>
              <Text style={[styles.aiResText, selectedLanguage === "1" && styles.activeTextCon]}>
                {English}
              </Text>

              <Text style={[styles.aiResText, selectedLanguage === "0" && styles.activeTextCon]}>
                {Amharic}
              </Text>
            </ScrollView>
          </View>
          <View style={styles.aiBtn}>
            <TouchableOpacity
              style={styles.button}
              onPress={getAISupport}
              disabled={loadingData}
            >
              {loadingData ? (
                <ActivityIndicator size="small" color="#ffff" />
              ) : (
                <Text style={styles.buttonText}>Get AI Support</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.lcdCon}>
          <TextInput
            style={styles.input}
            placeholder="Type something"
            value={ipAddress} // Use the state directly
            onChangeText={handleIpInput} // Update state on input change
          />

        </View>


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },

  topTitleCon: {
    marginTop: 20,
    marginBottom: 10,

  },
  topTitle: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: '600'
  },
  topDiscription: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: '400'
  },
  topGrid: {
    flexDirection: 'row', // Align children in a row
    alignItems: 'center',  // Vertically center the items
    gap: 35,
    marginHorizontal: 20,
  },

  singleControl: {
    width: 'full',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // This will push the switch to the end
    margin: 30,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 2,      // Set the border width
    borderBottomColor: '#c2c2c2' // Set the border color
  },
  buttonContainer: {
    // position: "absolute",
    width: '80%',
    bottom: 0,
    margin: 30,
  },
  sensorReadingCon: {
    flexDirection: 'row',      // Aligns the children side by side
    justifyContent: 'space-evenly',  // Adds spacing between them
    width: 'full',
    marginTop: 20,
    marginHorizontal: 30,
    gap: 50,
  },
  singleSensorReading: {
    width: 80,              // 50% of the parent width, minus small margin
    aspectRatio: 1,            // Makes it a square
    backgroundColor: '#ccc',   // You can change this
    borderRadius: 100,         // To make it circular
    alignItems: 'center',      // Centers text horizontally
    justifyContent: 'center',  // Centers text vertically
    margin: 5,                 // Optional: Adds a small margin between circles
  },
  sensor_reading_text: {
    textAlign: 'left',
    fontSize: 25,
    marginHorizontal: 30,
    marginTop: 30,
  },
  lcdCon: {

  },
  lcd_text: {
    textAlign: 'left',
    fontSize: 25,
    marginVertical: 10
  },
  input: {
    borderWidth: 3,
    borderColor: "white",
    height: 50,
    width: 500,
    marginHorizontal: 15,
  },
  aiCon: {

    backgroundColor: '#ECECEC',
    height: 800,
    margin: 10,
    marginVertical: 30,
  },
  aiBtn: {
    marginHorizontal: 20,
  },
  gifCon: {
    marginTop: 30,
    width: 80,
    height: 80,
  },
  gif: {
    width: "100%",
    height: '100%',
  },

  topNavCon: {
    flexDirection: 'row', // Align children in a row
    alignItems: 'center',
    gap: 10,
    margin: 4,
  },
  lanBtns: {
    flex: 1,
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: "#d9d9d9",
  },
  activeButton: {
    backgroundColor: "#35984F",
  },
  lanBtnText: {
    fontWeight: "600",
  },
  activeText: {
    color: "white",
  },
  aiResText: {
    padding: 15,
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: "#dbdbdb",
    lineHeight: 20,
    letterSpacing: 1,

  },
  activeTextCon: {
    display: "none"
  },
  status: {
    width: 10,
    height: 10,
    backgroundColor: "#F07368",
    position: "absolute",
    top: 40,
    right: 30,
    borderRadius: 20
  },
  statusLive: {
    backgroundColor: "#35984F"
  },
  button: {
    width: "auto",
    backgroundColor: "#2387DC",
    borderRadius: 3,
    height: 40,
    alignItems: "center",
    justifyContent: 'center',
  },
  buttonText: {
    color: "white"
  },

});


