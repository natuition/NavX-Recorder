import { Capacitor } from "@capacitor/core";
import { BleClient } from "@capacitor-community/bluetooth-le";

/**
 * Bluetooth service supporting Capacitor native BLE (iOS/Android) with Web Bluetooth fallback for PWA/Desktop.
 */
export class BluetoothService {
  private deviceId: string | null = null;
  private deviceName?: string | null;
  private isConnected = false;
  private onDataCallback: ((data: string) => void) | null = null;
  private writeQueue: ArrayBuffer[] = [];
  private isWriting = false;

  // UART Service UUID (Nordic UART Service)
  private static readonly UART_SERVICE_UUID =
    "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
  private static readonly UART_RX_CHAR_UUID =
    "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
  private static readonly UART_TX_CHAR_UUID =
    "6e400003-b5a3-f393-e0a9-e50e24dcca9e";


  public async connect(): Promise<void> {
    try {
      await BleClient.initialize();

      const device = await BleClient.requestDevice({
        services: [BluetoothService.UART_SERVICE_UUID],
      });


      this.deviceId = device.deviceId;
      this.deviceName = device.name;

      await BleClient.connect(this.deviceId, (deviceId) => {
        this.isConnected = false;
        this.deviceId = null;
        this.deviceName = null;
        console.log(`Device ${deviceId} disconnected`);
      });

      this.isConnected = true;

      await BleClient.startNotifications(
        this.deviceId,
        BluetoothService.UART_SERVICE_UUID,
        BluetoothService.UART_TX_CHAR_UUID,
        (value) => this.handleNotifications(value)
      );

      console.log("Native BLE connected");
    } catch (error) {
      console.error("Native BLE connection error:", error);
      throw error;
    }
  }

  /**
   * Disconnect from the Bluetooth device
   */
  async disconnect(): Promise<void> {
    console.log('Disconnecting Bluetooth...')
    await this.disconnectNative();
    console.log('Bluetooth disconnected')

    // reset queue/flags
    this.writeQueue = [];
    this.isWriting = false;
  }

  private async disconnectNative(): Promise<void> {
    try {
      if (this.deviceId) {
        try {
          await BleClient.stopNotifications(
            this.deviceId,
            BluetoothService.UART_SERVICE_UUID,
            BluetoothService.UART_TX_CHAR_UUID
          );
        } catch { }
        await BleClient.disconnect(this.deviceId);
      }
    } finally {
      this.isConnected = false;
      this.deviceId = null;
      this.deviceName = null;
      console.log("BLE disconnected");
    }
  }

  /**
   * Write data to the Bluetooth device (for RTCM corrections)
   */
  async write(data: ArrayBuffer): Promise<void> {
    if (!this.isConnected || !this.deviceId) {
      throw new Error("Bluetooth device not connected");
    }

    // Ajouter au buffer d'envoi et démarrer le traitement si nécessaire
    this.writeQueue.push(data);

    if (!this.isWriting) {
      this.processWriteQueue()
        .catch((err) => {
          console.error("Bluetooth write queue error:", err);
        });
    }
  }

  /**
   * Traite la file d'attente d'écritures de manière séquentielle pour éviter
   * l'erreur "GATT operation already in progress".
   */
  private async processWriteQueue(): Promise<void> {
    if (this.isWriting) return;
    this.isWriting = true;

    try {
      while (
        this.writeQueue.length > 0 &&
        this.isConnected
      ) {
        const buf = this.writeQueue.shift()!;
        await this.writeDataChunked(buf);
      }
    } finally {
      this.isWriting = false;
      if (
        this.writeQueue.length > 0 &&
        this.isConnected
      ) {
        setTimeout(() => this.processWriteQueue()
          .catch(console.error), 0);
      }
    }
  }

  /**
   * Ecrit en paquets (20 octets typiquement) avec un petit délai entre paquets
   * pour éviter de surcharger le lien BLE.
   */
  private async writeDataChunked(data: ArrayBuffer): Promise<void> {
    const chunkSize = 20;
    const dataArray = new Uint8Array(data);
    const interChunkDelayMs = 5; // iOS rapide (5ms), Web légèrement ralenti (8ms)

    for (let i = 0; i < dataArray.length; i += chunkSize) {
      const chunk = dataArray.slice(
        i,
        Math.min(i + chunkSize, dataArray.length)
      );

      const view = new DataView(
        chunk.buffer,
        chunk.byteOffset,
        chunk.byteLength
      );
      await this.writeNativeWithRetry(view);

      if (i + chunkSize < dataArray.length) await this.sleep(interChunkDelayMs);
    }
  }

  private async writeNativeWithRetry(
    view: DataView,
    maxRetries = 5
  ): Promise<void> {
    const anyBle = BleClient as unknown as Record<string, any>;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (typeof anyBle.writeWithoutResponse === "function") {
          await anyBle.writeWithoutResponse(
            this.deviceId!,
            BluetoothService.UART_SERVICE_UUID,
            BluetoothService.UART_RX_CHAR_UUID,
            view
          );
        } else {
          await BleClient.write(
            this.deviceId!,
            BluetoothService.UART_SERVICE_UUID,
            BluetoothService.UART_RX_CHAR_UUID,
            view
          );
        }
        return; // success
      } catch (e: any) {
        const msg = String(e?.message || e || "");
        if (
          attempt < maxRetries &&
          /GATT operation already in progress/i.test(msg)
        ) {
          // Petit backoff exponentiel: 12ms, 20ms, 35ms, 60ms, 80ms...
          const delay = 12 + Math.floor(8 * Math.pow(1.6, attempt));
          await this.sleep(delay);
          continue;
        }
        // Dernier essai ou autre erreur: rethrow
        throw e;
      }
    }
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Set callback for received data
   */
  onData(callback: (data: string) => void): void {
    this.onDataCallback = callback;
  }


  /**
   * Handle incoming data from device
   */
  private handleNotifications(value: DataView): void {
    // decode as UTF-8 text
    const buffer = value.buffer.slice(
      value.byteOffset,
      value.byteOffset + value.byteLength
    );
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(new Uint8Array(buffer));
    this.onDataCallback?.(text);
  }

  /**
   * Check if device is connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get device name
   */
  getDeviceName(): string | null | undefined {
    return this.deviceName;
  }
}
