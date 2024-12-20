import express, { json } from "express";
import playwright from "playwright-aws-lambda"
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors())

app.get("/api", (req, res) =>{

    (async () => {
      const browser = await playwright.launchChromium({headless: true});

        const context = await browser.newContext();

        context.addCookies([
            {
              name: "hs-session",
              path: "/",
              value: process.env.HIGHSEAS_SESSION_TOKEN,
              domain: "highseas.hackclub.com",
            },
          ]);

          const page = await context.newPage();
          await page.goto("https://highseas.hackclub.com/shop", {
            waitUntil: "networkidle",
          });

          const storage = await context.storageState();
          const localStorage = storage.origins[0].localStorage;

          const rawData = localStorage.find((element) => element.name == "cache.shopItems")

          if (!rawData) {
            res.status(404).json({error: "Could not fetch shop items"})
            return;
          }

          const shopItems = JSON.parse(rawData.value)

          res.json(shopItems)

          await browser.close();
    })();
})

app.get("/api/:name", (req, res) =>{
    (async () => {
        const itemName = req.params.name;

        const browser = await playwright.launchChromium({headless: true});

        const context = await browser.newContext();

        context.addCookies([
            {
              name: "hs-session",
              path: "/",
              value: process.env.HIGHSEAS_SESSION_TOKEN,
              domain: "highseas.hackclub.com",
            },
          ]);

          const page = await context.newPage();
          await page.goto("https://highseas.hackclub.com/shop", {
            waitUntil: "networkidle",
          });

          const storage = await context.storageState();
          const localStorage = storage.origins[0].localStorage;

          const rawData = localStorage.find((element) => element.name == "cache.shopItems")

          if (!rawData) {
            res.status(404).json({error: "Could not fetch shop items"})
            return;
          }

          const shopItems = JSON.parse(rawData.value)

          const requestedItem = shopItems["value"].find((element) => element.name == itemName);

          res.json(requestedItem)

          await browser.close();
    })();
})

app.listen(5000, ()=>{
    console.log("listening on port 5000")
})

export default app;