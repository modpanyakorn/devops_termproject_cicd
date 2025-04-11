<h1 align="center">
  DevOPS Term Project (CI/CD)
</h1>

## About Project

This project perform CI/CD pipeline by `GitHub Action` define stages (Test, Build, Deploy, Post Deploy) and deploy on AWS EC2.

### Test Stage

Test code quality in `Sonar Qube` (If you using this CI/CD script, make sure install Sonar Qube on your server).

### Build Stage

Build and push image on `Docker Registry` we have two kind of image.

- Build and Push `Frontend Image`
- Build and Push `Backend Image`

### Deploy Stage

- Prepare database `.sql` file for dumping database in `MySql` container for example is `easyroom.sql`.
- Pull `Docker` image on `Docker Hub` and running on instance (VM).

```bash
# services in `Docker` container.
apache-http-server (for serving frontend).
node (for serving backend).
mysql (for database).
```

### Post Deploy Stage

Checking container is running...

## Prepare Project

### About Application

Application in this repository using `Node` for running backend and `Express` for creating API services.<br>
Dependencies in `package.json` from `src/backend/package.json`.

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "express-list-endpoints": "^7.1.1",
    "express-routes-catalogue": "^1.1.0",
    "express-session": "^1.18.1",
    "multer": "^1.4.5-lts.2",
    "mysql2": "^3.14.0",
    "node-cron": "^3.0.3",
    "nodemon": "^3.1.9",
    "socket.io": "^4.8.1"
  }
}
```

Backend running on port `3000`.<br>
Before running! prepare database `.sql` file for dumping database example is `easyroom.sql` that file is mounting to instance (VM) during CI/CD pipeline perform.

### Network Config

Config and open port on instance (VM).

<table>
  <tr>
    <th>IP version</th>
    <th>Type</th>
    <th>Protocol</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>IPv4</td>
    <td>SSH</td>
    <td>22</td>
    <td>For GitHub Action access to VM</td>
  </tr>
  <tr>
    <td>IPv4</td>
    <td>HTTP</td>
    <td>80</td>
    <td>For every user can access web application by typing public VM IP</td>
  </tr>
  <tr>
    <td>IPv4</td>
    <td>TCP</td>
    <td>3000</td>
    <td>For backend API</td>
  </tr>
  <tr>
    <td>IPv4</td>
    <td>TCP</td>
    <td>9000</td>
    <td>For access Sonar Qube (Sonar Qube running on VM)</td>
  </tr>
</table>

### Secret Key

Add Secret in GitHub action repository setting.

<table>
  <tr>
    <th>Secret</th>
    <th>Example</th>
    <th>Source</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>DOCKER_HUB_TOKEN</td>
    <td>dckr_pat_....</td>
    <td>Docker Hub</td>
    <td>-</td>
  </tr>
  <tr>
    <td>DOCKER_HUB_USERNAME</td>
    <td>samson1234</td>
    <td>Docker Hub</td>
    <td>-</td>
  </tr>
  <tr>
    <td>EC2_HOST</td>
    <td>172.168.9.12</td>
    <td>Public IP of instance (VM)</td>
    <td>-</td>
  </tr>
  <tr>
    <td>EC2_SSH_KEY</td>
    <td>-----BEGIN RSA PRIVATE KEY----- MIIEpAIBAAKCAQEAtZT9t2YslHI/AS5p6aENWHKwhlfcmlrlDbyxYGO/so2xKvjM......-----END RSA PRIVATE KEY-----</td>
    <td>Keypair of EC2 instance (VM)</td>
    <td>-</td>
  </tr>
  <tr>
    <td>EC2_USERNAME</td>
    <td>ubuntu4088</td>
    <td>Username of instance (VM)</td>
    <td>Typing 'whoami' in termial of VM or find in AWS platform</td>
  </tr>
  <tr>
    <td>SONAR_TOKEN</td>
    <td>sqp_cbe61c...</td>
    <td>Sonar Qube platform</td>
    <td>copy from 'Sonar Qube' platform on your server</td>
  </tr>
  <tr>
    <td>SONAR_HOST_URL</td>
    <td>http://172.168.9.12:9000</td>
    <td>Sonar Qube platform</td>
    <td>copy from 'Sonar Qube' platform on your server, actually input key with 'protocols://ip-vm:services-port'</td>
  </tr>
  
</table>

## Infrastructure

```bash
AWS EC2, ubuntu-noble-24.04-amd64-server-20250305
```

## Architecture

```bash
easyroom-reservation/
├── docker-compose.yml
├── Dockerfile.frontend
├── Dockerfile.backend
├── easyroom.sql (Backup DataBase)
├── .env (Config)
├── wait-for-it.sh
├── sonar-project.properties
└── .github
│   └── workflow/
│       └── check-vm-connect.yml
│       └── ci-cd.yml
└── src/
    ├── frontend/
    │   └── index.html (Login file)
    │   └── booker/
    │   └── script/
    │       └── auth.js (Sessions checking)
    │       └── config.js (Frontend config, API URL, ...)
    │
    └── backend/
        ├── certificate/
        ├── core/
        │   └── auth/ (Sessions orchestration)
        │   └── db.js (DataBase connection)
        ├── modules/
        │   └── booker/
        ├── storage/
        │   └── equipment_img/
        ├── .env (Backend config, API HOST, API PORT, DB HOST, ...)
        ├── package.json
        └── server.js (Collect All Routing API Path)
```
