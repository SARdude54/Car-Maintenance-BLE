import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useBLE } from "../hooks/useBLE";
import { PrimaryButton } from "../components/PrimaryButton";
import { DiagnosticTile } from "../components/DiagnosticTile";
import { ConnectedStatusCard } from "../components/ConnectedStatusCard";
import { DeviceCard } from "../components/DeviceCard";
import { NAVY, NAVY_2, WHITE, MUTED } from "../constants/colors";

const logo = require("../assets/images/eva_ble.png");

export default function HomeScreen() {
  const {
    devices,
    isScanning,
    isConnecting,
    connectedDevice,

    runtime,
    hasRuntime,

    rpm,
    hasRpm,

    speed,
    hasSpeed,

    distance,
    hasDistance,

    vibX,
    hasVibX,

    vibY,
    hasVibY,

    vibZ,
    hasVibZ,

    startScan,
    connectToDevice,
    disconnectFromDevice,
  } = useBLE();

  const isConnected = !!connectedDevice;

  const scanDisabled = isScanning || isConnecting;
  const scanLabel = isConnecting
    ? "Connecting..."
    : isScanning
      ? "Scanning..."
      : "Connect";

  const connectedName =
    connectedDevice?.name ?? connectedDevice?.localName ?? "EVA";

  if (isConnected) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 18,
              paddingTop: 24,
              paddingBottom: 28,
            }}
            showsVerticalScrollIndicator={false}
          >
            <ConnectedStatusCard deviceName={connectedName} />

            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: "row", gap: 14 }}>
                <DiagnosticTile
                  label="Runtime"
                  value={hasRuntime ? runtime : "--"}
                  unit="seconds"
                />
                <DiagnosticTile
                  label="RPM"
                  value={hasRpm ? rpm : "--"}
                  unit="rpm"
                />
              </View>

              <View style={{ flexDirection: "row", gap: 14 }}>
                <DiagnosticTile
                  label="Speed"
                  value={hasSpeed ? speed : "--"}
                  unit="mph"
                />
                <DiagnosticTile
                  label="Distance"
                  value={hasDistance ? distance : "--"}
                  unit="m"
                />
              </View>

              <View style={{ flexDirection: "row", gap: 14 }}>
                <DiagnosticTile
                  label="Vibration X"
                  value={hasVibX ? vibX : "--"}
                  unit="raw"
                />
                <DiagnosticTile
                  label="Vibration Y"
                  value={hasVibY ? vibY : "--"}
                  unit="raw"
                />
              </View>

              <View style={{ flexDirection: "row", gap: 14 }}>
                <DiagnosticTile
                  label="Vibration Z"
                  value={hasVibZ ? vibZ : "--"}
                  unit="raw"
                />
                <View style={{ flex: 1 }} />
              </View>
            </View>

            <View style={{ paddingTop: 22 }}>
              <PrimaryButton
                disabled={isConnecting}
                label={isConnecting ? "Disconnecting..." : "Disconnect"}
                onPress={disconnectFromDevice}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NAVY }}>
      {/* Header / Logo */}
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
          <Image
            source={logo}
            resizeMode="contain"
            style={{ width: 180, height: 90 }}
          />

          <Text
            style={{
              marginTop: 10,
              color: WHITE,
              fontSize: 20,
              fontWeight: "700",
              letterSpacing: 0.3,
              textAlign: "center",
            }}
          >
            Environmental Vibration Analysis
          </Text>

          <Text
            style={{
              marginTop: 6,
              color: WHITE,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            Scan → Select available EVA device
          </Text>
        </View>
      </View>

      {/* Main Content */}
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
              renderItem={({ item }) => (
                <DeviceCard
                  device={item}
                  disabled={isConnecting}
                  onPress={() => connectToDevice(item)}
                />
              )}
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

      {/* Bottom Connect Button */}
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 10,
          paddingBottom: 18,
          marginBottom: 50,
          backgroundColor: NAVY,
        }}
      >
        <PrimaryButton
          disabled={scanDisabled}
          label={scanLabel}
          onPress={startScan}
        />

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