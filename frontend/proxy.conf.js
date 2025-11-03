var winston = require('winston'); //(1)

function logProvider() { //(2)
  return winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.simple()
    ),
    transports: [new winston.transports.Console()],
  });
}

var PROXY_CONFIG = {
  "/api/**": {
    "target": "http://localhost:5000",
    "secure": false,
    "logLevel": "debug",
    "configure": (proxy, _options) => {
        proxy.on("error", (err, _req, _res) => {
          console.log("proxy error", err);
        });
        proxy.on("proxyReq", (proxyReq, req, _res) => {
          const headers = proxyReq.getHeaders();
          // console.log(headers);
          console.log(
            req.method,
            req.url,
            " -> ",
            `${headers.host}${proxyReq.path}`,
          );
        });
        proxy.on("proxyRes", (proxyRes, req, _res) => {
          console.log(
            req.method,
            "Target Response",
            proxyRes.statusCode,
            ":",
            req.url,
          );
        });
      },
    "changeOrigin": true
  }
}

module.exports = PROXY_CONFIG;