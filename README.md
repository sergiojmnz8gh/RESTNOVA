# 🌟 RESTNOVA

RestNova es una plataforma digital de última generación diseñada para la automatización, gestión y optimización de la experiencia del cliente y del personal en restaurantes de alta cocina. 

Con un diseño visual sofisticado y premium, RestNova unifica en una sola aplicación interactiva el pedido en mesa a través de códigos QR, el flujo de comandas en tiempo real para cocineros, la gestión ágil para camareros, la planificación de reservas avanzadas y el control administrativo total.

---
## 🐳 Instalación y Despliegue con Docker

El despliegue con Docker es la forma más rápida de ejecutar la aplicación con un solo comando. Todo el stack (Frontend, Backend y Base de datos MySQL) se levantará automáticamente configurado con volúmenes persistentes.

### Requisitos Previos
* Clonar el repositorio del proyecto en tu equipo.
* Tener instalado [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/).

### Pasos para Ejecutar
1. Abre tu terminal en el directorio raíz del proyecto (donde está el archivo `docker-compose.yml`).
2. Ejecuta el siguiente comando para compilar y levantar los contenedores:
   ```bash
   docker-compose up --build -d
   ```
3. ¡Listo! Los servicios estarán disponibles en los siguientes enlaces:
   * **Aplicación Web (Frontend)**: [http://localhost](http://localhost)
   * **API del Servidor (Backend)**: [http://localhost:8080](http://localhost:8080)
   * **Documentación Interactiva de la API**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)