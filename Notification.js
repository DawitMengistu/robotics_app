// import React, { useEffect, useState } from 'react';
// import * as Notifications from 'expo-notifications';

// export default function App() {
//     const [expoPushToken, setExpoPushToken] = useState('');
//     const [notification, setNotification] = useState(false);
//     const [notificationListener, setNotificationListener] = useState(null);
//     const [responseListener, setResponseListener] = useState(null);


//     async function pushNotification(message) {
//         await Notifications.scheduleNotificationAsync({
//             content: {
//                 title: "Alert ⚠️",
//                 body: message,
//             },
//             trigger: { seconds: 1 },
//         });
//     }
//     useEffect(() => {
//         registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

//         const subscription = Notifications.addNotificationReceivedListener(notification => {
//             setNotification(notification);
//         });

//         setNotificationListener(subscription);

//         const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
//             console.log(response);
//         });

//         setResponseListener(responseSubscription);

//         return () => {
//             Notifications.removeNotificationSubscription(subscription);
//             Notifications.removeNotificationSubscription(responseSubscription);
//         };
//     }, []);

//     return (
//         <View style={{ marginTop: 200 }}>
//             <Button title="Press to schedule a notification" onPress={() => pushNotification("Here is the notification body")} />
//         </View>
//     );
// }

// async function registerForPushNotificationsAsync() {
//     let token;
//     if (Platform.OS === 'android') {
//         await Notifications.setNotificationChannelAsync('default', {
//             name: 'default',
//             importance: Notifications.AndroidImportance.MAX,
//             vibrationPattern: [0, 250, 250, 250],
//             lightColor: '#FF231F7C',
//         });
//     }
//     const { status } = await Notifications.getPermissionsAsync();
//     if (status !== 'granted') {
//         const { status } = await Notifications.requestPermissionsAsync();
//         if (status !== 'granted') {
//             alert('Failed to get push token for push notification!');
//             return;
//         }
//     }
//     token = (await Notifications.getExpoPushTokenAsync({ projectId: '1c8a1b98-6386-43ff-9ac2-dfc886a3fa7e' })).data;
//     console.log(token);
//     return token;
// }
