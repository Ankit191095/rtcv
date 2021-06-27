`use strict`;
var http = require("http");
let dataToSendAr = [];
const sql = require("mssql");

/**
 * Config for SQL server
 */
const sqlConfig = {
  user: "rtcvadmin",
  password: "Infy@1234",
  database: "InfyRTCVDatabase",
  server: "infyrtcvserver.database.windows.net", //update me
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: false, // change to true for local dev / self-signed certs
  },
};

let pool = null;
/**
 * Server config
 */
const options = {
  hostname: "0.0.0.0",
  port: "3001",
  rejectUnauthorized: false,
};

let server = http.createServer(options);
/**
 * Socker server inetgration
 */
let io = require("socket.io")(server);
io.on("connection", function (socket) {
  console.log("connection established");
  setInterval(async () => {
    try {
      pool = await sql.connect(sqlConfig);
      // let queryToexecute =
      //   "SELECT   TOP(40) Camera,EntryCount,ExitCount,EventDate FROM [snsr].[ingress_egress02]" +
      //   "where EventDate <= ( SELECT MAX(EventDate)   FROM [snsr].[ingress_egress02])";
      let queryToexecute =
        "SELECT * FROM [snsr].[ingress_egress02] WHERE EventDate <= DATETIMEFROMPARTS(DATEPART(year,SYSDATETIME()),DATEPART(month,SYSDATETIME()),DATEPART(day,SYSDATETIME())," +
        "DATEPART(hour,SYSDATETIME()),DATEPART(minute,SYSDATETIME()),DATEPART(second,SYSDATETIME()),00) AND EventDate >= DATEADD(HOUR,-1,DATETIMEFROMPARTS(DATEPART(year,SYSDATETIME())," +
        "DATEPART(month,SYSDATETIME()),DATEPART(day,SYSDATETIME()),DATEPART(hour,SYSDATETIME()),DATEPART(minute,SYSDATETIME()),DATEPART(second,SYSDATETIME()),00));";

      let result1 = await pool.request().query(queryToexecute);
      await io.emit("graphData", JSON.stringify(result1));
      pool.close();
    } catch (error) {
      console.error(error);
      pool.close();
    }
  }, 10000);

  // socket
  socket.on("disconnect", function () {
    // socket.close();
    console.log("user disconnected");
  });
});

server.listen("3001");
console.log("Socker server started at--3001");
