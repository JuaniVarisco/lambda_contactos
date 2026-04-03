# LambdaContactManager

Aplicación web Full Stack desarrollada para gestionar contactos. Este proyecto fue construido como parte de una prueba técnica, separando la lógica de negocio en una API REST y la interfaz de usuario en una aplicación cliente.

🌐 Demo en vivo: https://contactos-frontend-j9tx.onrender.com

## Funcionalidades

El sistema cumple con los requisitos fundamentales y añade las características extras solicitadas:

- **Gestión de contactos:** Operaciones CRUD completas (Crear, Leer, Actualizar y Eliminar).
- **Búsqueda en tiempo real:** Filtrado reactivo de contactos por nombre o correo electrónico en el cliente.
- **Validación de datos:** Implementada en ambas capas. Frontend (expresiones regulares y campos requeridos) y Backend (uso de DTOs y `class-validator`).
- **Manejo de errores:** Captura de excepciones en la base de datos (ej. colisiones de emails únicos) con respuestas HTTP adecuadas al cliente.
- **Interfaz de Usuario:** Diseño limpio y responsivo, con manejo de estados de carga y retroalimentación visual de errores.

## Tecnologías Utilizadas

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS.
- **Backend:** NestJS, TypeScript.
- **Base de Datos & ORM:** PostgreSQL, Prisma ORM.
- **Infraestructura:** Docker Compose.

## Estructura del Proyecto

El repositorio está organizado como un monorepo con dos componentes principales:

```text
/
├── /backend            # API REST (NestJS)
├── /frontend           # Aplicación cliente (Next.js)
└── docker-compose.yml  # Configuración de infraestructura (PostgreSQL)
```

## Ejecución Local

### 1. Base de Datos

Clonar el repositorio e iniciar el contenedor de PostgreSQL. Asegúrese de tener el puerto 5432 libre.

```bash
git clone <URL_DEL_REPOSITORIO>
cd lambda_contactos
docker compose up -d
```

### 2. Configuración del Backend

En una terminal, acceda al directorio del backend e instale las dependencias:

```bash
cd backend
npm install
```

Cree un archivo `.env` en la raíz del directorio backend con la cadena de conexión a la base de datos local:

```env
DATABASE_URL="postgresql://test:test@localhost:5432/test?schema=public"
```

Ejecute las migraciones para estructurar la base de datos e inicie el servidor:

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run start:dev
```

La API quedará escuchando peticiones en `http://localhost:3000`.

### 3. Configuración del Frontend

Abra una nueva pestaña en la terminal (manteniendo el backend en ejecución), ingrese al directorio del frontend e instale las dependencias:

```bash
cd frontend
npm install
```

Cree un archivo `.env.local` en la raíz del directorio frontend para apuntar a la API:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

Inicie la aplicación cliente en modo desarrollo:

```bash
npm run dev
```

La interfaz de usuario estará disponible en `http://localhost:3001` (o el puerto consecutivo que indique la terminal).