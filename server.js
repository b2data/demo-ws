const WebSocket = require("ws");
const ReadLine = require("readline");

const server = new WebSocket.Server({ port: 8080 });
const rl = ReadLine.createInterface({
  input: process.stdin,
  output: process.stdout
});

const devices = [
  { uuid: "32ce7d81-d392-48d0-8c40-eb8b507d376a" },
  { uuid: "0a56a1ff-d8ab-468b-8b64-7a4d841e6cb4" },
  { uuid: "a3f9e13c-8ced-41de-98d9-96b678ac2a4e" },
];

const transaction = "86491bfd-a241-4c96-a738-dcb2fbd40017";

server.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    try {
      const packet = JSON.parse(message);
      handlePacket(ws, packet);
    } catch (error) {
      //console.error("Invalid JSON:", error);
      console.log("Received text message:", message.toString());
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

function handlePacket(ws, packet) {
  switch (packet.function) {
    case "DevicesRequest":
      handleDevicesRequest(ws, packet);
      break;
    case "DevicesStatus":
      handleDevicesStatus(ws, packet);
      break;
    case "DevicesReqStatus":
      handleDevicesReqStatus(ws, packet);
      break;
    case "SetNumRequest":
      handleSetNumRequest(ws, packet);
      break;
    case "SetNumResponse":
      handleSetNumResponse(ws, packet);
      break;
    case "SetNumResult":
      handleSetNumResult(ws, packet);
      break;
    case "SetNumReset":
      handleSetNumReset(ws, packet);
      break;
    default:
      console.error("Unknown function:", packet.function);
  }
}

function handleDevicesRequest(ws, packet) {
  console.log("Received DevicesRequest:", JSON.stringify(packet, null, 2));
  const response = {
    function: "DevicesResponse",
    uuid: transaction,
    data: {
      devices: devices,
    },
  };
  console.log("Sending DevicesResponse: ", JSON.stringify(response, null, 2));
  ws.send(JSON.stringify(response));
}

function handleDevicesStatus(ws, packet) {
  console.log("Received DevicesStatus:", JSON.stringify(packet, null, 2));
}

function handleDevicesReqStatus(ws, packet) {
  const response = {
    function: "DevicesStatus",
    uuid: transaction,
    data: {
      devices: devices.map((d, index) => ({ ...d, addr: index + 1, code: 1 })),
    },
  };
  console.log(
    "Sending DevicesReqResponse: ",
    JSON.stringify(response, null, 2)
  );
  ws.send(JSON.stringify(response));
}

function handleSetNumRequest(ws, packet) {
  const response = {
    function: "SetNumRequest",
    uuid: transaction,
    data: {
      live: true,
      devices: devices.map((device) => ({
        ...device,
        num: Math.floor(Math.random() * 10) + 1,
      })),
    },
  };
  console.log("Sending SetNumRequest: ", JSON.stringify(response, null, 2));
  ws.send(JSON.stringify(response));
}

function handleSetNumResponse(ws, packet) {
  console.log("Received SetNumResponse: ", JSON.stringify(packet, null, 2));
}

function handleSetNumResult(ws, packet) {
  console.log("Received SetNumResult: ", JSON.stringify(packet, null, 2));
}

function handleSetNumReset(ws, data) {
  const response = {
    function: "SetNumReset",
    uuid: "f8f031c3-3423-420e-ac18-3bc9dbea4b03",
    data: {},
  };
  console.log("Sending SetNumReset: ", JSON.stringify(response, null, 2));
  ws.send(JSON.stringify(response));
}


rl.on('line', (input) => {
  const [command, ...args] = input.split(' ');

  switch (command) {
    case "devreq":
      handleDevicesReqStatusFromConsole(...args);
      break;
    case "setnum":
      handleSetNumRequestFromConsole(...args);
      break;
    default:
      console.log(`Unknown command: ${command}. Allow: devreq, setnum`);
  }
});

function handleDevicesReqStatusFromConsole(...args) {
  server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      handleDevicesReqStatus(client);
    }
  });
}

function handleSetNumRequestFromConsole(...args) {
  server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      handleSetNumRequest(client);
    }
  });
}
