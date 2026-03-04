# BLE and App Integration for EVA

A minimal Expo (dev-client) React Native app that connects to an STM32 BLE peripheral.

The app:

- Scans for nearby BLE devices
- Filters and displays the STM32 peripheral (**EVABLE**)
- Connects and subscribes to a counter characteristic
- Displays the counter value live on the phone

This project demonstrates a simple **BLE to mobile app integration workflow** using **React Native + Expo Dev Client**.

---

# Requirements

## Host Machine (Ubuntu)

You will need:

- **Node.js**
- **npm** 
- **Android Studio**
- **Android SDK + Platform Tools (*adb*)**
- **Java JDK 17**

Check your installations:

```bash
## Installation check
node -v
npm -v
java -version
adb version

## Setup and Run

# from repo root
cd App
npm install

### Verify Android device is connected
Run:

```bash
adb devices

# Terminal 1: metro
npx expo start --dev-client --clear

# Terminal 2: build/install/run android dev client
npx expo run:android