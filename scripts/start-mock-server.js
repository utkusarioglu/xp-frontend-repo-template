#!/usr/local/bin/node

const https = require("node:https");
const fs = require("node:fs");
const queryString = require("node:querystring");

const CERT_PATH =
  "/utkusarioglu-com/templates/xp-frontend-repo-template/.certs.local/mock-server";

const PORT = 443;

const options = {
  // ca: fs.readFileSync(`${CERT_PATH}/ca.crt`),
  ca: fs.readFileSync(`${CERT_PATH}/chain.crt`),
  cert: fs.readFileSync(`${CERT_PATH}/chain.crt`),
  key: fs.readFileSync(`${CERT_PATH}/tls.key`),
};

function produceData(codes) {
  const data =
    codes[0] === ""
      ? []
      : codes
          .map((code) =>
            Array(2)
              .fill(null)
              .map((_, i) => ({
                countryCode: `${code.toUpperCase()}-${i}`,
                countryName: code.toLowerCase(),
                decade: i,
                count: i,
                average: i,
                max: i,
                min: i,
                median: i,
                range: i,
                stdDev: i,
                variance: i,
              }))
          )
          .reduce((p, c) => {
            p = [...p, ...c];
            return p;
          }, []);
  return JSON.stringify({ decadeStats: data });
}

https
  .createServer(options, (req, res) => {
    const url = new URL(`http://localhost:443${req.url}`);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader(
      "Access-Control-Allow-Headers",
      [
        "Access-Control-Allow-Headers",
        "Origin,Accept",
        "X-Requested-With",
        "Content-Type",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
      ].join(", ")
    );
    setTimeout(() => {
      switch (url.pathname) {
        case "/api/v1/decade-stats":
          console.log("hit");
          const codesParam = url.searchParams.get("codes");
          if (!codesParam) {
            res.statusCode = 400;
            res.write(JSON.stringify({ error: "no codes param given" }));
            res.end();
            break;
          }

          const codes = codesParam.split(",");
          console.log({ codes });
          res.write(produceData(codes));
          res.end();
          break;

        case "/api/v1/auth/login/user-pass":
          try {
            console.log("Login", req.method);
            let bodyBuf = Buffer.from("");
            req
              .on("data", (chunk) => {
                bodyBuf = Buffer.concat([bodyBuf, chunk]);
              })
              .on("end", () => {
                const bodyStr = bodyBuf.toString();
                if (!!bodyStr) {
                  console.log({ bodyStr });
                  const body = JSON.parse(bodyStr);
                  console.log({ body });
                  let responseDraft;
                  if ((body.username === "guest", body.password === "guest")) {
                    console.log("userpass correct");
                    responseDraft = {
                      authId: body.username,
                      username: body.username,
                    };
                  } else {
                    responseDraft = { authId: "" };
                  }
                  console.log({ responseDraft });
                  res.write(JSON.stringify(responseDraft));
                  res.end();
                } else {
                  res.write("");
                  res.end();
                }
              });
          } catch (e) {
            res.write(JSON.stringify({ error: 505 }));
            res.end();
            console.log({ e });
          }
          break;

        case "/api/v1/auth/login/auth-id":
          try {
            console.log("Login", req.method);
            let bodyBuf = Buffer.from("");
            // req.setEncoding("utf-8");
            req
              .on("data", (chunk) => {
                bodyBuf = Buffer.concat([bodyBuf, chunk]);
              })
              .on("end", () => {
                const bodyStr = bodyBuf.toString();
                if (!!bodyStr) {
                  console.log({ bodyStr });
                  const body = JSON.parse(bodyStr);
                  console.log({ body });
                  let responseDraft;
                  if (body.authId === "guest") {
                    console.log("authId correct");
                    responseDraft = {
                      authId: body.username,
                      username: body.username,
                    };
                  } else {
                    responseDraft = { authId: "" };
                  }
                  console.log({ responseDraft });
                  res.write(JSON.stringify(responseDraft));
                  res.end();
                } else {
                  res.write("");
                  res.end();
                }
              });
          } catch (e) {
            res.write(JSON.stringify({ error: 505 }));
            res.end();
            console.log({ e });
          }
          break;
        case "/api/v1/auth/logout":
          console.log("Logout");
          res.write(JSON.stringify({ authId: "" }));
          res.end();
          break;

        default:
          console.log("Default hit:", req.url);
          res.write(
            JSON.stringify({
              error: "Not implemented",
              url,
            })
          );
          res.end();
          break;
      }
    }, 1500);
  })
  .listen(PORT, () => {
    console.log(`Mock server listening on port ${PORT}`);
  });
