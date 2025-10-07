Got it! Here’s the **simplest version**, just commands with short explanations:

---

# 🐳 Docker Quick Commands: Bind Mount & Volume

### 1️⃣ Bind Mount (sync host folder with container)

```bash
docker run -d -p 3000:3000 -v "//c/works/docker":/usr/src/app node:latest
```

- Host folder `C:/works/docker` → Container `/usr/src/app`
- Changes on host reflect inside container

---

### 2️⃣ Docker Volume (persistent storage)

```bash
docker volume create logs_volume      # create volume
docker volume ls                      # list volumes
docker volume inspect logs_volume     # check volume details
docker volume rm logs_volume          # delete volume
```

---

### 3️⃣ Bind Mount + Volume Together

```bash
docker run -d -p 3000:3000 \
  -v "//c/works/docker":/usr/src/app \
  -v "logs_volume:/usr/src/app/logs" \
  node:latest
```

- Project folder → live code
- Logs → persistent volume

---

### 4️⃣ Optional: Auto-reload Node.js on Windows

```dockerfile
CMD ["npx", "nodemon", "--legacy-watch", "index.js"]
```

- Automatically reloads server on code change

---

This version is **just commands**, easy to read and understand.

I can make an **even shorter cheat sheet** in **5 lines max** if you want. Do you want me to do that?
