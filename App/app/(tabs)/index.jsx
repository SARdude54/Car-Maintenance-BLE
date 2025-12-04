import { Button, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useBLE } from "../../hooks/useBLE";

export default function Index() {
  const {
    devices,
    isScanning,
    startScan,
    connectToDevice,
    connectedDevice,
  } = useBLE();

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Button title={isScanning ? "Scanning..." : "Scan Again"} onPress={startScan} />

      {connectedDevice && (
        <Text style={{ marginTop: 20, color: "green", fontSize: 18 }}>
          Connected to: {connectedDevice.name}
        </Text>
      )}

      <Text style={{ marginTop: 20, fontWeight: "bold", fontSize: 16 }}>
        Nearby Devices:
      </Text>

      <ScrollView style={{ marginTop: 10 }}>
        {devices.map((d) => (
          <TouchableOpacity
            key={d.id}
            onPress={() => connectToDevice(d)}
            style={{
              padding: 12,
              marginVertical: 6,
              backgroundColor: "#eee",
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 16 }}>{d.name}</Text>
            <Text style={{ fontSize: 12, color: "#666" }}>{d.id}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
