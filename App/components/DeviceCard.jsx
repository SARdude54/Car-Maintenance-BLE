import { TouchableOpacity, Text } from "react-native";
import { NAVY, WHITE } from "../constants/colors";

export function DeviceCard({ device, onPress, disabled }) {
  const displayName = device?.localName ?? device?.name ?? "Unnamed device";

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: WHITE,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 14,
        marginBottom: 10,
        opacity: disabled ? 0.6 : 1,
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
}