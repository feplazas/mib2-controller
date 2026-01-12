import TcpSocket from "react-native-tcp-socket";

export interface TelnetConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface TelnetMessage {
  type: "info" | "error" | "command" | "response";
  text: string;
  timestamp: Date;
}

export class TelnetClient {
  private socket: any = null;
  private connected = false;
  private buffer = "";
  private onMessageCallback?: (message: TelnetMessage) => void;
  private onConnectCallback?: () => void;
  private onDisconnectCallback?: () => void;

  constructor(
    private config: TelnetConfig,
    callbacks?: {
      onMessage?: (message: TelnetMessage) => void;
      onConnect?: () => void;
      onDisconnect?: () => void;
    }
  ) {
    this.onMessageCallback = callbacks?.onMessage;
    this.onConnectCallback = callbacks?.onConnect;
    this.onDisconnectCallback = callbacks?.onDisconnect;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = TcpSocket.createConnection(
          {
            host: this.config.host,
            port: this.config.port,
          },
          () => {
            this.connected = true;
            this.emitMessage("info", `Conectado a ${this.config.host}:${this.config.port}`);
            this.onConnectCallback?.();
            
            // Esperar prompt de login y enviar credenciales
            setTimeout(() => {
              this.sendCommand(this.config.username);
              setTimeout(() => {
                this.sendCommand(this.config.password);
              }, 500);
            }, 1000);
            
            resolve();
          }
        );

        this.socket.on("data", (data: Buffer) => {
          const text = data.toString("utf8");
          this.buffer += text;
          
          // Procesar líneas completas
          const lines = this.buffer.split("\n");
          this.buffer = lines.pop() || "";
          
          lines.forEach((line) => {
            const trimmed = line.trim();
            if (trimmed) {
              this.emitMessage("response", trimmed);
            }
          });
        });

        this.socket.on("error", (error: Error) => {
          this.emitMessage("error", `Error: ${error.message}`);
          reject(error);
        });

        this.socket.on("close", () => {
          this.connected = false;
          this.emitMessage("info", "Conexión cerrada");
          this.onDisconnectCallback?.();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  sendCommand(command: string): void {
    if (!this.connected || !this.socket) {
      this.emitMessage("error", "No conectado");
      return;
    }

    try {
      this.emitMessage("command", `$ ${command}`);
      this.socket.write(`${command}\n`);
    } catch (error) {
      this.emitMessage("error", `Error al enviar comando: ${(error as Error).message}`);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  private emitMessage(type: TelnetMessage["type"], text: string): void {
    const message: TelnetMessage = {
      type,
      text,
      timestamp: new Date(),
    };
    this.onMessageCallback?.(message);
  }
}

// Comandos pre-configurados para MIB2
export const MIB2_COMMANDS = {
  // Información del sistema
  VERSION: "cat /net/rcc/dev/shmem/version.txt",
  MIB_INFO: "cat /net/rcc/dev/shmem/mib_info",
  MOUNT: "mount",
  UPTIME: "uptime",
  IFCONFIG: "ifconfig",
  
  // Instalación de Toolbox
  INSTALL_TOOLBOX: "ksh /media/mp000/install.sh",
  INSTALL_TOOLBOX_USB: "ksh /media/mp002/install.sh",
  
  // Navegación
  LS_ROOT: "ls -la /",
  LS_NET_RCC: "ls -la /net/rcc",
  LS_MEDIA: "ls -la /media",
  
  // Procesos
  PS: "ps aux",
  TOP: "top -n 1",
  
  // Toolbox
  TOOLBOX_MENU: "/mnt/efs-persist/toolbox/bin/mibstd2_toolbox",
};

// Configuración por defecto para MIB2 STD2
export const DEFAULT_MIB2_CONFIG: TelnetConfig = {
  host: "192.168.1.4",
  port: 23,
  username: "root",
  password: "root",
};
