import React, {useEffect} from 'react'
import {StyleSheet, Button, Text, View} from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'

Notifications.setNotificationHandler({
        handleNotification: async () => {
            //ten obiekt musi zawierać iformacje dla systemu operacyjnego, co ma się stać po otrzymaniu
            //powiadomienia podczas gdy aplikacja jest uruchomiona
            //ta funkcja jest po to, żeby system wiedział co zrobić z powiadomieniem zanim zostanie ono
            //wyświetlone
            return {
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true
            }
        }
    }
)

export default function App() {

    useEffect(() => {
        Permissions.getAsync(Permissions.NOTIFICATIONS).then(statusObj => {
            if (statusObj.status !== 'granted') {
                return Permissions.askAsync(Permissions.NOTIFICATIONS)
            }
            return statusObj
        }).then(statusObj => {
            if (statusObj !== 'granted') {
                //rzucam błąd, żeby w razie nie udzlenia pozwolenia w tym kroku nie przeszło do kolejnego
                //then
                throw new Error('Nie udzielono pozwolenia')
            }
        }).then(() => {
            //ten blok jest po to, żeby Expo poprosiło o pozwolenie do oficjalnych serwerów Google i Apple
            //na wysyłanie powiadomień na inne urządzenia posiadające zaintstalowaną aplikację. Serwery
            //udzielają tokenu aplikacji i za jego pomocą można uwierzytelnić aplikację do tego typu operacji.
            //Tak naprawdę to ta metoda zarejestruje apkę tylko na serwerze expo ale dalej, pod maską będzie
            //następowała komunikacja między serwerami
            //ten return zwróci promisa dlatego potrzebny będzie następny then blok
            return Notifications.getExpoPushTokenAsync()
        }).then(data => {
            //w tym obiekcie znajduje się token który będzie odpowiadał za wysyłanie powiadomień
            console.log(data)
        }).catch((err) => {
            //wywołuję blok catch po to, żeby uniknąć warningu o braku pewności czy user udzielił pozwolenia
            return null
        })
    }, [])

    useEffect(() => {
        //ta metoda uruchamia się gdy user wejdzie w interackję z powiadomieniem gdy aplikacja jest w tle / nie
        //jest uruchomiona
        const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response)
        })

        //ta metoda uruchamia się gdy przychodzi powiadomienie i jednoczesnie gdy aplikacja jest uruchomiona
        const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
            console.log(notification)
        })
        //w powyższym obiekcie mamy wiele pól, ale wśród nich są np. title i body, które ustawiam w handlerze
        //moge zatem ustawić dowolną akcję lub dane w powieaomieniu, np do content dodając pole data: {...}
        //montujemy subskrypcję w momencie wywołania metody nasłuchującej i usuwamy ją gdy komponent jest
        //odmontowywany
        return () => {
            backgroundSubscription.remove()
            foregroundSubscription.remove()
        }
    }, [])

    const handleNotification = () => {
        //ta metoda wyzwala lokalne powiadomienia
        Notifications.scheduleNotificationAsync({
            content: {
                title: 'Tytuł powiadomienia',
                body: 'Treść powiadomienia',
            },
            trigger: {
                seconds: 5,
            }
        })
    }
    return (
        <View style={styles.container}>
            <Button title='Powiadomienie' onPress={handleNotification}/>
            <Text>hahahaha</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
