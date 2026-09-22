const { spawn } = require("child_process");
const path = require("path");

const root = __dirname;
const services = [
  { name: "Client", directory: "client", entry: "server.js" },
  { name: "Server", directory: "server", entry: path.join("src", "server.js") },
];

const children = services.map(({ name, directory, entry }) => {
  const child = spawn(process.execPath, [entry], {
    cwd: path.join(root, directory),
    stdio: "inherit",
  });
  child.on("exit", (code) => console.log(`${name} stopped (code ${code ?? "signal"}).`));
  return child;
});

const stop = () => children.forEach((child) => child.kill());
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
