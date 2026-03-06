# BLE and App Integration for EVA

A minimal Expo (dev-client) React Native app that connects to an STM32 BLE peripheral.

The app:

- Scans for nearby BLE devices
- Filters and displays the STM32 peripheral (**EVABLE**)
- Connects and subscribes to a counter characteristic
- Displays the counter value live on the phone

This project demonstrates a simple **BLE to mobile app integration workflow** using **React Native + Expo Dev Client**.

This project will integrate with the EVA capstone project. 

---

# Requirements

- **Node.js v20.20.20**
- **npm 10.8.2** 
- **Android Studio**
- **Android SDK + Platform Tools**
    - Android Debug Bridge version 1.0.41
    - Version 34.0.4-debian
- **Java JDK 17**

### Installation Check

```bash
## Installation check
node -v
npm -v
java -version
adb version
```

## Setup and Run

```bash
# from repo root
cd App
npm install

### Verify Android device is connected
adb devices

# Terminal 1: metro
npx expo start --dev-client --clear

# Terminal 2: build/install/run android dev client
npx expo run:android
```
