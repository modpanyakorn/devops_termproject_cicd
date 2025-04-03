<h3 align="center">
  DevOPS Term Project (CI/CD)
</h3>

### Architecture

```bash
easyroom-reservation/
├── docker-compose.yml
├── Dockerfile
├── easyroom.sql (Backup DataBase)
├── .gitignore
├── .env (Docker config)
└── src/
    ├── frontend/
    │   └── index.html (Login file)
    │   └── booker/
    │   └── admin/
    │   └── executive/
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
        │   └── admin/
        │   └── executive/
        ├── storage/
        │   └── equipment_img/
        ├── .env (Backend config, API HOST, API PORT, DB HOST, ...)
        ├── package.json
        └── server.js (Collect All Routing Path API)
```

### Installation

- **Docker:** Make sure Docker is installed on your system. You can download it from [here](https://www.docker.com/get-started).
