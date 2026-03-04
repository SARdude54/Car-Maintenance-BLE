import React from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBLE } from "../../hooks/useBLE";

const logo = require("../../assets/images/eva_ble.png");

const NAVY = "#0B1F3B";
const NAVY_2 = "#102A4C";
const WHITE = "#FFFFFF";
const MUTED = "#A9B6C7";

function PrimaryButton({ disabled, label, onPress }) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: disabled ? "#2B3F5A" : WHITE,
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      }}
    >
      <Text
        style={{
          color: disabled ? "#C3CFDD" : NAVY,
          fontSize: 16,
          fontWeight: "800",
          letterSpacing: 0.4,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function App() {
  const {
    devices,
    isScanning,
    isConnecting,
    connectedDevice,
    counter,
    hasCounter,
    startScan,
    connectToDevice,
    disconnectFromDevice,
  } = useBLE();

  const isConnected = !!connectedDevice;

  const scanDisabled = isScanning || isConnecting;
  const scanLabel = isConnecting
    ? "Connecting..."
    : isScanning
      ? "Connecting..."
      : "Connect";

  const connectedName =
    connectedDevice?.name ?? connectedDevice?.localName ?? "EVA";


  // Connected Screen
if (isConnected) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 50 }}>
        {/* Counter card */}
        <View
          style={{
            backgroundColor: WHITE,
            borderRadius: 18,
            paddingVertical: 18,
            paddingHorizontal: 16,

            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 4,
          }}
        >


          {hasCounter ? (
            <Text
              style={{
                marginTop: 10,
                color: NAVY,
                fontSize: 56,
                fontWeight: "900",
                letterSpacing: 1,
              }}
            >
              {counter}
            </Text>
          ) : (
            <Text style={{ marginTop: 10, color: NAVY, fontSize: 14 }}>
              Waiting for counter...
            </Text>
          )}

          <Text style={{ marginTop: 14, color: "#667892", fontSize: 12 }}>
            Connected to
          </Text>
          <Text style={{ marginTop: 4, color: NAVY, fontSize: 16, fontWeight: "800" }}>
            {connectedName}
          </Text>
        </View>

        {/* Space between disconnect button to bottom */}
        <View style={{ flex: 1 }} />

        {/* Disconnect Button */}
        <View style={{ paddingBottom: 60 }}>
          <PrimaryButton
            disabled={isConnecting}
            label={isConnecting ? "Disconnecting..." : "Disconnect"}
            onPress={disconnectFromDevice}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

  // main screen
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      {/* Logo */}
      <View style={{ paddingHorizontal: 18, paddingTop: 18 }}>
        <View
          style={{
            backgroundColor: NAVY_2,
            borderRadius: 18,
            paddingVertical: 18,
            paddingHorizontal: 14,
            alignItems: "center",
          }}
        >
          <Image source={logo} resizeMode="contain" style={{ width: 180, height: 90 }} />

          <Text
            style={{
              marginTop: 10,
              color: WHITE,
              fontSize: 20,
              fontWeight: "700",
              letterSpacing: 0.3,
            }}
          >
            Environmental Vibration Analysis
          </Text>

          <Text style={{ marginTop: 6, color: MUTED, fontSize: 13 }}>
            Scan → Select available EVA device
          </Text>
        </View>
      </View>

      {/* Main content */}
      <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 14 }}>
        {devices.length > 0 ? (
          <>
            <Text
              style={{
                color: WHITE,
                fontSize: 14,
                fontWeight: "700",
                marginBottom: 10,
                marginLeft: 2,
              }}
            >
              Devices
            </Text>

            <FlatList
              data={devices}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 12 }}
              renderItem={({ item }) => {
                const displayName = item.localName ?? item.name ?? "Unnamed device";

                return (
                  <TouchableOpacity
                    disabled={isConnecting}
                    onPress={() => connectToDevice(item)}
                    style={{
                      backgroundColor: WHITE,
                      borderRadius: 14,
                      paddingVertical: 14,
                      paddingHorizontal: 14,
                      marginBottom: 10,
                      opacity: isConnecting ? 0.6 : 1,
                    }}
                  >
                    <Text style={{ color: NAVY, fontSize: 16, fontWeight: "800" }}>
                      {displayName}
                    </Text>

                    <Text style={{ marginTop: 4, color: "#667892", fontSize: 12 }}>
                      Tap to connect
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </>
        ) : (
          <View style={{ marginTop: 10 }}>
            {isScanning ? (
              <Text style={{ color: WHITE, fontSize: 14 }}>
                Searching for EVA Device...
              </Text>
            ) : (
              <Text style={{ color: MUTED, fontSize: 14 }}>
                Tap Connect to search for EVA device.
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Connect Button */}
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 10,
          paddingBottom: 18,
          marginBottom: 50,
          backgroundColor: NAVY,
        }}
      >
        <PrimaryButton disabled={scanDisabled} label={scanLabel} onPress={startScan} />
        <Text
          style={{
            marginTop: 10,
            textAlign: "center",
            color: MUTED,
            fontSize: 12,
          }}
        >
          Make sure Bluetooth is enabled.
        </Text>
      </View>
    </SafeAreaView>
  );
}