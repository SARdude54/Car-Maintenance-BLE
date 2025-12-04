import { BleManager, Device } from '@mocoding/react-native-ble-plx';
import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

const bleManager = new BleManager();

export function useBLE() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Run on app load
  useEffect(() => {
    requestPermissions().then(() => startScan());

    return () => {
      bleManager.destroy();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ]);
    }
  };

  const startScan = () => {
    if (isScanning) return;
    setIsScanning(true);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        setIsScanning(false);
        return;
      }

      if (device && device.name) {
        setDevices((prev) => {
          if (prev.find((d) => d.id === device.id)) return prev;
          return [...prev, device];
        });
      }
    });

    // Stop after 10 seconds
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  // Connect to a device
  const connectToDevice = async (device: Device) => {
    try {
      console.log("Connecting to", device.name);

      const connected = await device.connect();
      setConnectedDevice(connected);

      console.log("Connected! Discovering services...");
      await connected.discoverAllServicesAndCharacteristics();

      console.log("Ready!");
      return connected;
    } catch (error) {
      console.log("Connection error:", error);
    }
  };

  return {
    devices,
    isScanning,
    connectedDevice,
    startScan,
    connectToDevice,
  };
}
