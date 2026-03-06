import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBLE } from "../hooks/useBLE";

const logo = require("../assets/images/eva_ble.png");

const NAVY = "#0B1F3B";
const NAVY_2 = "#102A4C";
const WHITE = "#FFFFFF";
const MUTED = "#A9B6C7";
const TILE_BG = "#F3F7FB";

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

function DiagnosticTile({ label, value, unit }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: WHITE,
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 16,

        shadowColor: "#000",
        shadowOpacity: 0.14,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      }}
    >
      <Text
        style={{
          color: "#667892",
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>

      <View
        style={{
          marginTop: 12,
          backgroundColor: TILE_BG,
          borderRadius: 14,
          paddingVertical: 16,
          paddingHorizontal: 12,
          alignItems: "center",
          justifyContent: "center",
          minHeight: 95,
        }}
      >
        <Text
          style={{
            color: NAVY,
            fontSize: 28,
            fontWeight: "900",
            letterSpacing: 0.5,
          }}
        >
          {value}
        </Text>

        {unit ? (
          <Text
            style={{
              marginTop: 4,
              color: "#667892",
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function App() {
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
            {/* Status Card */}
            <View
              style={{
                backgroundColor: WHITE,
                borderRadius: 18,
                paddingVertical: 18,
                paddingHorizontal: 18,
                marginBottom: 18,

                shadowColor: "#000",
                shadowOpacity: 0.14,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 4,
              }}
            >
              <Text
                style={{
                  color: "#667892",
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 0.3,
                }}
              >
                CONNECTED TO
              </Text>

              <Text
                style={{
                  marginTop: 6,
                  color: NAVY,
                  fontSize: 24,
                  fontWeight: "900",
                }}
              >
                {connectedName}
              </Text>

              <Text
                style={{
                  marginTop: 8,
                  color: "#667892",
                  fontSize: 14,
                }}
              >
                Vehicle Diagnostics Active
              </Text>
            </View>

            {/* Diagnostics Grid */}
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

            {/* Disconnect */}
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
              color: MUTED,
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
                    <Text
                      style={{
                        color: NAVY,
                        fontSize: 16,
                        fontWeight: "800",
                      }}
                    >
                      {displayName}
                    </Text>

                    <Text
                      style={{
                        marginTop: 4,
                        color: "#667892",
                        fontSize: 12,
                      }}
                    >
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