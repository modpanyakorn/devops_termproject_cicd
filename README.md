<h3 align="center">
  DevOPS Term Project (CI/CD)
</h3>

### เข้า WebSite
ใช้ public ip ของ vm ผ่าน URL
```bash
122.248.221.64
```
Project: Easyroom Reservation
Login ด้วย username, password
```bash
64312995
1234
```

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
└── .github
│   └── workflow/
│       └── check-vm-connect.yml
│       └──ci-cd.yml
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

### Installation

- **Docker:** Make sure Docker is installed on your system. You can download it from [here](https://www.docker.com/get-started).
