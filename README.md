# Refaccionaria

Sistema de administración de usuarios, clientes, vehículos, refacciones, proveedores e inventario.

## Requisitos

- Node.js 18+
- PostgreSQL 16 (o Docker)

## Variables de entorno

Copia `backend/.env.example` a `backend/.env`.

## Arranque

```bash
docker compose up -d

cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

cd ../frontend
npm install
npm run dev
```

- API: http://localhost:4000
- App: http://localhost:5173

Usuario inicial:

- Email: `admin@refaccionaria.com`
- Contraseña: `Admin123!`
