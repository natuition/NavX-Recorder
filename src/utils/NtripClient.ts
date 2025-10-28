import { SourceTable } from "./SourceTable.ts";

export class NtripClient {
  private streamSocket: WebSocket | null = null;
  private currentMountpoint: string | null = null;
  private rtcmListeners = new Set<(data: ArrayBuffer) => void>();

  public static async fetchSourceTableWithProxy(options: {
    host: string;
    port: number;
    username?: string;
    password?: string;
  }): Promise<SourceTable> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `wss://ws-tcp-ntrip-client.natuition.com/?host=${encodeURIComponent(
          options.host
        )}&port=${encodeURIComponent(options.port.toString())}`;
        const socket = new WebSocket(wsUrl);

        let responseBuffer = "";
        let timerHandle: number;

        socket.onopen = () => {
          const auth = btoa(`${options.username}:${options.password}`);
          const request = [
            "GET / HTTP/1.1",
            `Host: ${options.host}:${options.port}`,
            `Authorization: Basic ${auth}`,
            "User-Agent: NTRIP NavX-PWA/1.0",
            "Accept: */*",
            "Connection: close",
            "",
            "",
          ].join("\r\n");

          socket.send(new TextEncoder().encode(request));
        };

        socket.onmessage = (event) => {
          if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
              const chunk = reader.result as string;
              responseBuffer += chunk;
            };
            reader.readAsText(event.data);
          } else if (typeof event.data === "string") {
            responseBuffer += event.data;
          }
        };

        socket.onerror = (error) => {
          console.error(
            "Erreur WebSocket lors de la récupération des mountpoints:",
            error
          );
          clearTimeout(timerHandle);
          socket.close();
          reject(
            new Error("Impossible de récupérer la liste des mountpoints")
          );
        };

        socket.onclose = () => {
          clearTimeout(timerHandle);
          if (responseBuffer.length > 0) {
            try {
              const sourceTable = new SourceTable(responseBuffer);
              resolve(sourceTable);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error("Connexion fermée sans données"));
          }
        };

        timerHandle = window.setTimeout(() => {
          if (
            socket.readyState === WebSocket.CONNECTING ||
            socket.readyState === WebSocket.OPEN
          ) {
            socket.close();
            reject(
              new Error("Timeout lors de la récupération des mountpoints")
            );
          }
        }, 20000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Streamer les données RTCM d'un mountpoint
   */
  public async streamMountpointData(options: {
    host: string;
    port: number;
    mountpoint: string;
    username?: string;
    password?: string;
  }): Promise<void> {
    // Fermer la connexion précédente si elle existe et si c'est un autre mountpoint
    if (
      this.streamSocket &&
      this.currentMountpoint !== options.mountpoint
    ) {
      console.log(
        `Switching from mountpoint ${this.currentMountpoint} to ${options.mountpoint}`
      );
      this.closeSocket();
    }

    // Si déjà connecté au même mountpoint, ne rien faire
    if (
      this.currentMountpoint === options.mountpoint &&
      this.streamSocket?.readyState === WebSocket.OPEN
    ) {
      console.log(`Already streaming from ${options.mountpoint}`);
      return;
    }

    return new Promise<void>((resolve, reject) => {
      try {
        const wsUrl = `wss://ws-tcp-ntrip-client.natuition.com/?host=${encodeURIComponent(
          options.host
        )}&port=${encodeURIComponent(options.port.toString())}`;

        const socket = new WebSocket(wsUrl);
        socket.binaryType = "arraybuffer";

        let timerHandle: number;

        socket.onopen = () => {
          // Vérifier que la socket n'a pas été fermée entretemps
          if (socket.readyState !== WebSocket.OPEN) {
            console.warn("Socket closed before onopen");
            reject(new Error("Socket closed before onopen"));
            return;
          }

          const auth = btoa(`${options.username}:${options.password}`);
          const request = [
            `GET /${options.mountpoint} HTTP/1.1`,
            `Host: ${options.host}:${options.port}`,
            `Authorization: Basic ${auth}`,
            "User-Agent: NTRIP NavX-PWA/1.0",
            "Accept: */*",
            "Connection: close",
            "",
            "",
          ].join("\r\n");

          socket.send(new TextEncoder().encode(request));

          // Mettre à jour les références globales seulement après succès
          this.streamSocket = socket;
          this.currentMountpoint = options.mountpoint;
          console.debug(`Connected to NTRIP mountpoint: ${options.mountpoint}`);
          resolve();
        };

        socket.onmessage = (event) => {
          // Recevoir les paquets RTCM et les forwarder aux listeners
          if (event.data instanceof ArrayBuffer) {
            // const data = new Uint8Array(event.data);
            for (const listener of this.rtcmListeners) {
              try {
                listener(event.data);
              } catch (err) {
                console.error("RTCM listener error:", err);
              }
            }
          }
        };

        socket.onerror = (error) => {
          console.error("NTRIP WebSocket error:", error);
          clearTimeout(timerHandle);
          reject(error);
        };

        socket.onclose = () => {
          clearTimeout(timerHandle);
          console.debug(
            `NTRIP connection closed for mountpoint ${this.currentMountpoint}`
          );
          // Vérifier que c'est bien notre socket qui se ferme
          if (this.streamSocket === socket) {
            this.streamSocket = null;
            this.currentMountpoint = null;
          }
        };

        // Timeout après 30s
        timerHandle = window.setTimeout(() => {
          if (socket.readyState === WebSocket.CONNECTING) {
            socket.close();
            reject(new Error("NTRIP connection timeout"));
          }
        }, 30000);

        // Assigner temporairement pour que closeSocket() fonctionne
        this.streamSocket = socket;
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * S'abonner aux données RTCM reçues
   */
  public onRTCMData(callback: (data: ArrayBuffer) => void): () => void {
    this.rtcmListeners.add(callback);
    console.debug(
      `RTCM listener registered (total: ${this.rtcmListeners.size})`
    );
    return () => {
      this.rtcmListeners.delete(callback);
      console.debug(
        `RTCM listener removed (total: ${this.rtcmListeners.size})`
      );
    };
  }

  /**
   * Fermer la connexion WebSocket
   */
  private closeSocket(): void {
    if (this.streamSocket) {
      try {
        if (
          this.streamSocket.readyState === WebSocket.OPEN ||
          this.streamSocket.readyState === WebSocket.CONNECTING
        ) {
          this.streamSocket.close();
        }
      } catch (err) {
        console.warn("Error closing socket:", err);
      }
      this.streamSocket = null;
    }
  }

  /**
   * Déconnecter proprement
   */
  public disconnect(): void {
    this.closeSocket();
    this.rtcmListeners.clear();
  }
}
