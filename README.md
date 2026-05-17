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
3. ¡Listo! Estarán disponibles los siguientes enlaces:
   * **Aplicación Web (Frontend)**: [http://localhost](http://localhost)

   * **Documentación Interactiva de la API**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
## ©️ Licencia

[![CC BY-SA 4.0][cc-by-sa-shield]][cc-by-sa]

El código fuente y la documentación de **RESTNOVA** se distribuyen bajo una licencia **Creative Commons**.

Esta obra está sujeta a una licencia [Reconocimiento-CompartirIgual 4.0 Internacional (CC BY-SA 4.0)][cc-by-sa] de Creative Commons. Para ver una copia de esta licencia, visite http://creativecommons.org/licenses/by-sa/4.0/ o envíe una carta a Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

[cc-by-sa-shield]: https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg
[cc-by-sa]: http://creativecommons.org/licenses/by-sa/4.0/