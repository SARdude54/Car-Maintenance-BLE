import { View, Text } from "react-native";
import { NAVY, WHITE, TILE_BG } from "../constants/colors";

export function DiagnosticTile({ label, value, unit }) {
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