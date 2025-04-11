<h1 align="center">
  DevOPS Term Project (CI/CD)
</h1>

# About Project

This project perform CI/CD pipeline by `GitHub Action` define stages (Test, Build, Deploy, Post Deploy) and deploy on AWS EC2 (Make sure prepare instance (VM) aleardy).

#### Test

Test code quality in `Sonar Qube` (Make sure install `Sonar Qube` on Instance (VM) already).

#### Build

Build and push image on `Docker Registry` we have two kind of image.

- Build and Push `Frontend Image`.
- Build and Push `Backend Image`.
  (Make sure install Docker on Instance (VM) already).

#### Deploy

- Prepare DataBase SQL file for dumping database in `MySql` container for example is `easyroom.sql`.
- Pull `Docker` image on `Docker Hub` and running on instance (VM).
  Here is services in `Docker` container.

```bash
- apache-http-server (for serving frontend).
- node (for serving backend).
- mysql (for database).
```

#### Post Deploy

- Checking Container Running...

# Prepare Project

### About Application

Application in this repository using `Node` for running Backend and `Express` for creating API services.
here is dependencies in `package.json` from `src/backend/package.json`.

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

Backend running on port `3000`.
Prepare database file for dumping example is `easyroom.sql` that file is mounting in instance (VM) during CI/CD pipeline perform.

### Network Config

We have to config and open port in instance (VM).

<table>
  <tr>
    <th>IP version</th>
    <th>Type</th>
    <th>Protocol</th>
    <th>Port range</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>IPv4</td>
    <td>SSH</td>
    <td>22</td>
    <td>For GitHub Action access to VM.</td>
  </tr>
  <tr>
    <td>IPv4</td>
    <td>HTTP</td>
    <td>80</td>
    <td>For every user can access web application by typing public VM IP.</td>
  </tr>
  <tr>
    <td>IPv4</td>
    <td>TCP</td>
    <td>3000</td>
    <td>For backend API.</td>
  </tr>
  <tr>
    <td>IPv4</td>
    <td>TCP</td>
    <td>9000</td>
    <td>For access Sonar Qube (Sonar Qube running on VM).</td>
  </tr>
</table>

### Secret

Add Secret in GitHub action repository setting.

- `DOCKER_HUB_TOKEN` from Docker Hub example `dckr_pat_....`.
- `DOCKER_HUB_USERNAME` from Docker Hub example `samson1234`.
- `EC2_HOST` from public ip of instance (VM) example `172.168.9.12`.
- `EC2_SSH_KEY` from keypair of EC2 instance example `-----BEGIN RSA PRIVATE KEY----- MIIEpAIBAAKCAQEAtZT9t2YslHI/AS5p6aENWHKwhlfcmlrlDbyxYGO/so2xKvjM......-----END RSA PRIVATE KEY-----`.
- `EC2_USERNAME` from username of instance (VM) example `ubuntu4088` or typing `whoami` in termial of VM or see in AWS platform.
- `SONAR_TOKEN` copy from `Sonar Qube` platform on your server example `sqp_cbe61c...`.
- `SONAR_HOST_URL` from public ip, protocol, port of instance (VM) example `http://172.168.9.12:9000` for port get from config install `Sonar Qube` on VM in this case we use `Docker Container` to install and running `Sonar Qube` on VM or copy `HOST URL` from `Sonar Qube` platform on your server.

### Infrastructure

```bash
AWS EC2, ubuntu-noble-24.04-amd64-server-20250305
```

### Architecture

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
