const app = require("express")();
const frida = require("frida");
const fs = require("fs");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const path = require("path");
const bodyParser = require("body-parser");

// const remoteAddress = "192.168.1.110:27042";
const processName = "com.zhiliaoapp.musically"; // "Gadget";
const scriptPath = path.join(__dirname, "script.js");
var api = null;
var session = null;
var device = null;

async function main() {
  await attach();
}

async function attach() {
  if (device === null) {
    device = await frida.getUsbDevice(1);
    device.processCrashed.connect(onProcessCrashed);
  }

  if (session === null) {
    session = await device.attach(processName);
    session.detached.connect(onSessionDetached);

    const source = fs.readFileSync(scriptPath).toString();
    const script = await session.createScript(source);

    script.message.connect((message) => {
      console.log("[*] Message:", message);
    });

    script.message.disconnect(async (message) => {
      console.log("[*] Disconnected:", message);
      console.log("[*] Restarting...");

      session = null;
      device = null;
      await attach();
    });

    // script.destroyed.destroyed((message) => {
    //   console.log("[*] Dstroyed:", message);
    // });

    await script.load();
    io.emit("script-loaded");

    api = script.exports;
  }
}

function onProcessCrashed(crash) {
  console.log("[*] onProcessCrashed() crash:", crash);
  console.log(crash.report);
}

function onSessionDetached(reason, crash) {
  console.log("[*] onDetached() reason:", reason, "crash:", crash);
  session = null;
  device = null;
  attach();
}

const options = {
  inflate: true,
  limit: "100kb",
  type: "application/octet-stream",
};

var binaryParser = bodyParser.raw(options);
app.use(bodyParser.json());

app.post("/api/leviathan", binaryParser, async function (req, res) {
  const bytes = Array.from(req.body);
  const result = await api.leviathan(
    req.query.time,
    bytes,
    req.query.did,
    req.query.iid
  );
  res.end(Buffer.from(result, "binary"));
});

app.post("/api/ttEncrypt", binaryParser, async function (req, res) {
  const bytes = Array.from(req.body);
  const result = await api.ttEncrypt(bytes);
  res.end(Buffer.from(result, "binary"));
});

main().then(() => {
  http.listen(3000, function () {
    console.log("listening on *:3000");
  });
});

setInterval(async function () {
  console.log("Restarting Injector.");
  await attach();
}, 1 * 60 * 30 * 1000); // 30 MIN
