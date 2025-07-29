#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <EEPROM.h>
#include <ESP8266WebServer.h>

#define TRIGPIN D5
#define ECHOPIN D6

const char* AP_SSID = "BantayBaha_WifiConfig";
const char* AP_PASS = "bantaybaha";

const char* host = "bantaybaha.site";
const int httpsPort = 443;

WiFiClientSecure client;
ESP8266WebServer server(80);

char ssid[32];
char pass[32];
const int EEPROM_SIZE = 96;

const float SENSOR_HEIGHT_CM = 300.0;

// Variables to hold current readings
float currentRaw = 0;
float currentCm = 0;
float currentFt = 0;
String currentThreshold = "safe";

// Web page with current WiFi, IP, and sensor readings
String page() {
  String currentWiFi = (WiFi.status() == WL_CONNECTED) ? WiFi.SSID() : "Not connected";
  String deviceIP = (WiFi.status() == WL_CONNECTED) ? WiFi.localIP().toString() : "No IP";

  String html = "<!DOCTYPE html><html><head><title>WiFi setup</title>"
                "<style>body{font-family:sans-serif;background:#e6f0ff;text-align:center;padding:20px}"
                "form{display:inline-block;background:#fff;padding:20px;border-radius:10px;"
                "box-shadow:0 0 10px #007bff}"
                "input{padding:10px;width:200px;margin:10px;border:1px solid #007bff;border-radius:5px}"
                "button{background:#007bff;color:#fff;padding:10px 20px;border:none;border-radius:5px}"
                "</style></head><body>"
                "<h2>WiFi configuration</h2>"
                "<p><b>Current WiFi:</b> " + currentWiFi + "</p>"
                "<p><b>Device IP:</b> " + deviceIP + "</p>"
                "<h3>Current Sensor Readings</h3>"
                "<p><b>Raw Distance:</b> " + String(currentRaw, 2) + " cm</p>"
                "<p><b>Water Level:</b> " + String(currentCm, 2) + " cm / " + String(currentFt, 2) + " ft</p>"
                "<p><b>Status:</b> " + currentThreshold + "</p>"
                "<form method='POST' action='/save'>"
                "<input name='ssid' placeholder='WiFi SSID' required><br>"
                "<input name='pass' type='password' placeholder='WiFi Password' required><br>"
                "<button type='submit'>Connect</button>"
                "</form></body></html>";
  return html;
}

void handleRoot() {
  server.send(200, "text/html", page());
}

void handleSave() {
  String s = server.arg("ssid");
  String p = server.arg("pass");
  s.toCharArray(ssid, 32);
  p.toCharArray(pass, 32);
  saveCred();
  server.send(200, "text/html", "<h2>WiFi saved. Restarting...</h2>");
  delay(1000);
  ESP.restart();
}

void loadCred() {
  EEPROM.begin(EEPROM_SIZE);
  for (int i = 0; i < 32; i++) {
    ssid[i] = EEPROM.read(i);
    pass[i] = EEPROM.read(i + 32);
  }
  ssid[31] = 0;
  pass[31] = 0;
}

void saveCred() {
  for (int i = 0; i < 32; i++) {
    EEPROM.write(i, ssid[i]);
    EEPROM.write(i + 32, pass[i]);
  }
  EEPROM.commit();
}

float readDistance() {
  digitalWrite(TRIGPIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIGPIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIGPIN, LOW);
  long us = pulseIn(ECHOPIN, HIGH, 30000);
  if (us == 0) return -1;
  return (us * 0.0343f) / 2.0f;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIGPIN, OUTPUT);
  pinMode(ECHOPIN, INPUT);

  loadCred();

  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP(AP_SSID, AP_PASS);
  Serial.print("AP started. Access config at http://");
  Serial.println(WiFi.softAPIP());

  if (strlen(ssid) > 0) {
    Serial.printf("Connecting to WiFi %s\n", ssid);
    WiFi.begin(ssid, pass);
  } else {
    Serial.println("No saved WiFi.");
  }

  server.on("/", handleRoot);
  server.on("/save", HTTP_POST, handleSave);
  server.begin();
  Serial.println("Web portal ready.");

  client.setInsecure();
}

unsigned long lastSent = 0;
// Change data upload interval here (currently 30 seconds)
const unsigned long sendInterval = 30000;

void loop() {
  server.handleClient();

  float rawDistance = readDistance();
  currentRaw = rawDistance;  // Update global for web page

  Serial.printf("Raw Distance: %.2f cm\n", rawDistance);

  if (rawDistance < 0) {
    delay(1000);
    return;
  }

  float waterLevelCm = SENSOR_HEIGHT_CM - rawDistance;
  if (waterLevelCm < 0) waterLevelCm = 0;
  float waterLevelFt = waterLevelCm / 30.48;

  currentCm = waterLevelCm;
  currentFt = waterLevelFt;

  String threshold = "safe";
  if (waterLevelFt >= 2 && waterLevelFt < 4) threshold = "caution";
  else if (waterLevelFt >= 4) threshold = "danger";

  currentThreshold = threshold;

  Serial.printf("Water Level: %.2f cm (%.2f ft) [%s]\n", waterLevelCm, waterLevelFt, threshold.c_str());

  unsigned long now = millis();
  if (now - lastSent >= sendInterval) {
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("Connecting to server via HTTPS...");

      if (client.connect(host, httpsPort)) {
        String url = "/hardware_connect/connect.php?cm=" + String(waterLevelCm, 2) +
                     "&ft=" + String(waterLevelFt, 2) +
                     "&threshold=" + threshold;

        Serial.print("Requesting URL: ");
        Serial.println(url);

        client.printf("GET %s HTTP/1.1\r\nHost: %s\r\nConnection: close\r\n\r\n", url.c_str(), host);

        while (client.connected()) {
          String line = client.readStringUntil('\n');
          Serial.println(line);
          if (line == "\r") break;
        }
      } else {
        Serial.println("HTTPS connection failed.");
      }
      client.stop();
    } else {
      Serial.println("WiFi not connected. Skipping upload.");
    }
    lastSent = now;
  }

  delay(1000);
}
