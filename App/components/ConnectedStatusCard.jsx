import { View, Text } from "react-native";
import { NAVY, WHITE } from "../constants/colors";

export function ConnectedStatusCard({ deviceName, subtitle = "Vehicle Diagnostics Active" }) {
  return (
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
        {deviceName}
      </Text>

      <Text
        style={{
          marginTop: 8,
          color: "#667892",
          fontSize: 14,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}