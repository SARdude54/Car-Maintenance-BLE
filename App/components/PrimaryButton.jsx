import { TouchableOpacity, Text } from "react-native";
import { NAVY, WHITE } from "../constants/colors"

export function PrimaryButton({ disabled, label, onPress }) {
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