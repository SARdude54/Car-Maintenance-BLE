import { Buffer } from "buffer";
import { useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device, Subscription } from "react-native-ble-plx";

const COUNTER_SERVICE_UUID = "12345678-9ABC-DEF0-1122-334455667788";
const COUNTER_CHAR_UUID    = "12345678-9ABC-DEF0-1122-334455667789";

function leUint32FromBase64(b64: string): number {
  const bytes = Buffer.from(b64, "base64");
  if (bytes.length < 4) return 0;
  return (
    (bytes[0]      ) |
    (bytes[1] <<  8) |
    (bytes[2] << 16) |
    (bytes[3] << 24)
  ) >>> 0;
}

export function useBLE() {
  const managerRef = useRef(new BleManager());
  const bleManager = managerRef.current;

  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [counter, setCounter] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasCounter, setHasCounter] = useState(false);

  const monitorSubRef = useRef<Subscription | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      await requestPermissions();
      // startScan();
    })();

    return () => {
      // stop notifications
      try { monitorSubRef.current?.remove(); } catch {}
      monitorSubRef.current = null;

      // stop scanning + clear timeout
      try { bleManager.stopDeviceScan(); } catch {}
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }

      // bleManager.destroy();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== "android") return;

    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
  };

  const startScan = () => {
    if (isScanning || isConnecting) return;

    setDevices([]);
    setIsScanning(true);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan error:", error);
        setIsScanning(false);
        return;
      }
      if (!device) return;

      const name = device.name ?? device.localName ?? "";

      // show only STM device
      // TODO: make sure its only STM devices, not my specific one
      if (!name.includes("EVABLE")) return;

      setDevices((prev) => {
        if (prev.some((d) => d.id === device.id)) return prev;
        return [...prev, device];
      });
    });

    // stop after 10 seconds
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    scanTimeoutRef.current = setTimeout(() => {
      try { bleManager.stopDeviceScan(); } catch {}
      setIsScanning(false);
      scanTimeoutRef.current = null;
    }, 10000);
  };

  const connectToDevice = async (device: Device) => {
  if (isConnecting) return null;
  setIsConnecting(true);

  try {
    console.log("Connecting to", device.name ?? device.localName ?? device.id);

    // stop scan + clear timeout
    try { bleManager.stopDeviceScan(); } catch {}
    setIsScanning(false);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }

    // clear old notifications
    try { monitorSubRef.current?.remove(); } catch {}
    monitorSubRef.current = null;

    // reset counter UI state for new connection
    setHasCounter(false);
    setCounter(0);

    const already = await device.isConnected();
    const connected = already
      ? device
      : await device.connect({ autoConnect: false });

    setConnectedDevice(connected);

    await connected.discoverAllServicesAndCharacteristics();

    const sub = connected.monitorCharacteristicForService(
      COUNTER_SERVICE_UUID,
      COUNTER_CHAR_UUID,
      (error, characteristic) => {
        if (error) {
          console.log("Monitor error:", error);
          return;
        }
        if (!characteristic?.value) return;

        const val = leUint32FromBase64(characteristic.value);
        setCounter(val);
        setHasCounter(true);
      }
    );

    monitorSubRef.current = sub;
    console.log("Connected + subscribed!");
    return connected;
  } catch (e) {
    console.log("Connection error:", e);
    return null;
  } finally {
    setIsConnecting(false);
  }
};

const disconnectFromDevice = async () => {
  try {
    // stop notifications
    try { monitorSubRef.current?.remove(); } catch {}
    monitorSubRef.current = null;

    // stop scanning if it’s running
    try { bleManager.stopDeviceScan(); } catch {}
    setIsScanning(false);

    // disconnect if connected
    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection();
      } catch {}
    }
  } finally {
    // reset UI state back to main screen
    setConnectedDevice(null);
    setCounter(0);
    setHasCounter(false);
    setIsConnecting(false);
    setDevices([]); 
  }
};

  return {
    devices,
    isScanning,
    isConnecting, 
    connectedDevice,
    disconnectFromDevice,
    counter,
    hasCounter,
    startScan,
    connectToDevice,
  };
}