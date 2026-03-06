import { Buffer } from "buffer";
import { useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device, Subscription } from "react-native-ble-plx";

// recieve UUIDs
const DIAGNOSTICS_SERVICE_UUID = "12345678-9ABC-DEF0-1122-334455667788";
const COUNTER_CHAR_UUID        = "12345678-9ABC-DEF0-1122-334455667789";
const RUNTIME_CHAR_UUID        = "12345678-9ABC-DEF0-1122-33445566778A";
const RPM_CHAR_UUID            = "12345678-9ABC-DEF0-1122-33445566778B";
const SPEED_CHAR_UUID          = "12345678-9ABC-DEF0-1122-33445566778C";
const DISTANCE_CHAR_UUID       = "12345678-9ABC-DEF0-1122-33445566778D";
const VIBX_CHAR_UUID           = "12345678-9ABC-DEF0-1122-33445566778E";
const VIBY_CHAR_UUID           = "12345678-9ABC-DEF0-1122-33445566778F";
const VIBZ_CHAR_UUID           = "12345678-9ABC-DEF0-1122-334455667790";

// helper functions
function leUint16FromBase64(b64: string): number {
  const bytes = Buffer.from(b64, "base64");
  if (bytes.length < 2) return 0;
  return ((bytes[0]) | (bytes[1] << 8)) >>> 0;
}

function leInt16FromBase64(b64: string): number {
  const bytes = Buffer.from(b64, "base64");
  if (bytes.length < 2) return 0;
  const val = (bytes[0]) | (bytes[1] << 8);
  return val & 0x8000 ? val - 0x10000 : val;
}

function leUint32FromBase64(b64: string): number {
  const bytes = Buffer.from(b64, "base64");
  if (bytes.length < 4) return 0;
  return (
    (bytes[0]) |
    (bytes[1] << 8) |
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
  const [isConnecting, setIsConnecting] = useState(false);

  const [counter, setCounter] = useState<number>(0);
  const [hasCounter, setHasCounter] = useState(false);

  const [runtime, setRuntime] = useState<number>(0);
  const [hasRuntime, setHasRuntime] = useState(false);

  const [rpm, setRpm] = useState<number>(0);
  const [hasRpm, setHasRpm] = useState(false);

  const [speed, setSpeed] = useState<number>(0);
  const [hasSpeed, setHasSpeed] = useState(false);

  const [distance, setDistance] = useState<number>(0);
  const [hasDistance, setHasDistance] = useState(false);

  const [vibX, setVibX] = useState<number>(0);
  const [hasVibX, setHasVibX] = useState(false);

  const [vibY, setVibY] = useState<number>(0);
  const [hasVibY, setHasVibY] = useState(false);

  const [vibZ, setVibZ] = useState<number>(0);
  const [hasVibZ, setHasVibZ] = useState(false);

  const counterSubRef = useRef<Subscription | null>(null);
  const runtimeSubRef = useRef<Subscription | null>(null);
  const rpmSubRef = useRef<Subscription | null>(null);
  const speedSubRef = useRef<Subscription | null>(null);
  const distanceSubRef = useRef<Subscription | null>(null);
  const vibXSubRef = useRef<Subscription | null>(null);
  const vibYSubRef = useRef<Subscription | null>(null);
  const vibZSubRef = useRef<Subscription | null>(null);

  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      await requestPermissions();
    })();

    return () => {
      removeAllSubscriptions();

      try {
        bleManager.stopDeviceScan();
      } catch {}

      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
    };
  }, []);

  const removeAllSubscriptions = () => {
    try { counterSubRef.current?.remove(); } catch {}
    try { runtimeSubRef.current?.remove(); } catch {}
    try { rpmSubRef.current?.remove(); } catch {}
    try { speedSubRef.current?.remove(); } catch {}
    try { distanceSubRef.current?.remove(); } catch {}
    try { vibXSubRef.current?.remove(); } catch {}
    try { vibYSubRef.current?.remove(); } catch {}
    try { vibZSubRef.current?.remove(); } catch {}

    counterSubRef.current = null;
    runtimeSubRef.current = null;
    rpmSubRef.current = null;
    speedSubRef.current = null;
    distanceSubRef.current = null;
    vibXSubRef.current = null;
    vibYSubRef.current = null;
    vibZSubRef.current = null;
  };

  const resetDiagnosticState = () => {
    setCounter(0);
    setHasCounter(false);

    setRuntime(0);
    setHasRuntime(false);

    setRpm(0);
    setHasRpm(false);

    setSpeed(0);
    setHasSpeed(false);

    setDistance(0);
    setHasDistance(false);

    setVibX(0);
    setHasVibX(false);

    setVibY(0);
    setHasVibY(false);

    setVibZ(0);
    setHasVibZ(false);
  };

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

      // If your embedded side still advertises "EVABLE", change this back.
      if (!name.includes("EVABLE")) return;

      setDevices((prev) => {
        if (prev.some((d) => d.id === device.id)) return prev;
        return [...prev, device];
      });
    });

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

      try { bleManager.stopDeviceScan(); } catch {}
      setIsScanning(false);

      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }

      removeAllSubscriptions();
      resetDiagnosticState();

      const already = await device.isConnected();
      const connected = already
        ? device
        : await device.connect({ autoConnect: false });

      setConnectedDevice(connected);

      await connected.discoverAllServicesAndCharacteristics();

      const counterSub = connected.monitorCharacteristicForService(
        DIAGNOSTICS_SERVICE_UUID,
        COUNTER_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.log("Counter monitor error:", error);
            return;
          }
          if (!characteristic?.value) return;

          const val = leUint32FromBase64(characteristic.value);
          setCounter(val);
          setHasCounter(true);
        }
      );

      const runtimeSub = connected.monitorCharacteristicForService(
        DIAGNOSTICS_SERVICE_UUID,
        RUNTIME_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.log("Runtime monitor error:", error);
            return;
          }
          if (!characteristic?.value) return;

          const val = leUint32FromBase64(characteristic.value);
          setRuntime(val);
          setHasRuntime(true);
        }
      );

      const rpmSub = connected.monitorCharacteristicForService(
        DIAGNOSTICS_SERVICE_UUID,
        RPM_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.log("RPM monitor error:", error);
            return;
          }
          if (!characteristic?.value) return;

          const val = leUint16FromBase64(characteristic.value);
          setRpm(val);
          setHasRpm(true);
        }
      );

      const speedSub = connected.monitorCharacteristicForService(
        DIAGNOSTICS_SERVICE_UUID,
        SPEED_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.log("Speed monitor error:", error);
            return;
          }
          if (!characteristic?.value) return;

          const val = leUint16FromBase64(characteristic.value);
          setSpeed(val);
          setHasSpeed(true);
        }
      );

      const distanceSub = connected.monitorCharacteristicForService(
        DIAGNOSTICS_SERVICE_UUID,
        DISTANCE_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.log("Distance monitor error:", error);
            return;
          }
          if (!characteristic?.value) return;

          const val = leUint32FromBase64(characteristic.value);
          setDistance(val);
          setHasDistance(true);
        }
      );

      const vibxSub = connected.monitorCharacteristicForService(
        DIAGNOSTICS_SERVICE_UUID,
        VIBX_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.log("VibX monitor error:", error);
            return;
          }
          if (!characteristic?.value) return;

          const val = leInt16FromBase64(characteristic.value);
          setVibX(val);
          setHasVibX(true);
        }
      );

      const vibySub = connected.monitorCharacteristicForService(
        DIAGNOSTICS_SERVICE_UUID,
        VIBY_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.log("VibY monitor error:", error);
            return;
          }
          if (!characteristic?.value) return;

          const val = leInt16FromBase64(characteristic.value);
          setVibY(val);
          setHasVibY(true);
        }
      );

      const vibzSub = connected.monitorCharacteristicForService(
        DIAGNOSTICS_SERVICE_UUID,
        VIBZ_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.log("VibZ monitor error:", error);
            return;
          }
          if (!characteristic?.value) return;

          const val = leInt16FromBase64(characteristic.value);
          setVibZ(val);
          setHasVibZ(true);
        }
      );

      counterSubRef.current = counterSub;
      runtimeSubRef.current = runtimeSub;
      rpmSubRef.current = rpmSub;
      speedSubRef.current = speedSub;
      distanceSubRef.current = distanceSub;
      vibXSubRef.current = vibxSub;
      vibYSubRef.current = vibySub;
      vibZSubRef.current = vibzSub;

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
      removeAllSubscriptions();

      try { bleManager.stopDeviceScan(); } catch {}
      setIsScanning(false);

      if (connectedDevice) {
        try {
          await connectedDevice.cancelConnection();
        } catch {}
      }
    } finally {
      setConnectedDevice(null);
      resetDiagnosticState();
      setIsConnecting(false);
      setDevices([]);
    }
  };

  return {
    devices,
    isScanning,
    isConnecting,
    connectedDevice,

    counter,
    hasCounter,

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
  };
}