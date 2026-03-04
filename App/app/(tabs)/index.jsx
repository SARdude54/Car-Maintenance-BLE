import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useBLE } from "../../hooks/useBLE";

export default function App() {
  const {
    devices,
    isScanning,
    isConnecting,
    connectedDevice,
    counter,
    startScan,
    connectToDevice,
  } = useBLE();

  const scanDisabled = isScanning || isConnecting;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>BLE Counter Demo</Text>

      <TouchableOpacity
        disabled={scanDisabled}
        onPress={startScan}
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 8,
          backgroundColor: scanDisabled ? "#bbb" : "#ddd",
        }}
      >
        <Text>{isConnecting ? "Connecting..." : isScanning ? "Scanning..." : "Scan"}</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 12 }}>
        Connected: {connectedDevice?.name ?? connectedDevice?.localName ?? "None"}
      </Text>

      <Text style={{ marginTop: 12, fontSize: 18, color: "red"}}>
        Counter: {counter}
      </Text>

      <Text style={{ marginTop: 16, fontSize: 16, fontWeight: "600" }}>Devices</Text>

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const displayName =
            item.name ??
            item.localName ??
            "Unnamed (tap to connect)";

          return (
            <TouchableOpacity
              disabled={isConnecting}
              onPress={() => connectToDevice(item)}
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
                opacity: isConnecting ? 0.5 : 1,
              }}
            >
             <Text style={{ fontSize: 16, color: "red" }}>
              {String(item.localName)}
            </Text>

            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}