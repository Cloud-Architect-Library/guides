<div align="center">

# 🚀 Cloud Architect Library

[![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Docusaurus](https://img.shields.io/badge/Docusaurus-3EC7B2?style=for-the-badge&logo=docusaurus&logoColor=white)](https://docusaurus.io/)

**Repositorio técnico de referencia diseñado por AWS Solution Architects**

[Ver Documentación](https://Cloud-Architect-Library.github.io/guides/) | [Reportar Issue](https://github.com/Cloud-Architect-Library/guides/issues)

</div>

---

## 📖 Acerca de este Proyecto

**Cloud Architect Library** es un repositorio de conocimiento técnico creado y mantenido por el equipo de **AWS Solution Architects**. Este proyecto sirve como puente entre los conceptos teóricos de AWS y las implementaciones prácticas en producción.

### 🎯 Propósito

A diferencia de la documentación oficial de AWS, que ofrece un detalle exhaustivo de cada servicio, esta librería se enfoca en la **arquitectura aplicada**. Aquí encontrarás:

- 🏗️ **Patrones de Arquitectura**: Soluciones para alta disponibilidad, escalabilidad y resiliencia
- 🔐 **Seguridad Zero Trust**: Guías detalladas sobre cómo asegurar identidades, datos y redes
- 📦 **Infrastructure as Code (IaC)**: Ejemplos con Terraform, CDK y CloudFormation
- 🌐 **Estrategias de Networking**: Diseños de red para entornos híbridos y multi-región
- ☁️ **Modernización de Aplicaciones**: Guías sobre Serverless, Microservicios y Contenedores
- 📊 **Observabilidad**: Monitorización y gestión de aplicaciones
- 🤖 **Data & AI**: Servicios de AWS para análisis de datos e inteligencia artificial

### 🏆 Alineación con Well-Architected Framework

Todo el contenido está rigurosamente alineado con los seis pilares del **AWS Well-Architected Framework**:

- **Seguridad** | **Excelencia Operativa** | **Fiabilidad** | **Rendimiento** | **Optimización de Costos** | **Sostenibilidad**

---

## 🛠️ Tecnología

Este sitio está construido con [Docusaurus](https://docusaurus.io/), un generador de sitios estáticos moderno que facilita la creación y mantenimiento de documentación técnica.

---

## 💻 Desarrollo Local

### Requisitos Previos

- Node.js >= 20.0
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Cloud-Architect-Library/guides.git
cd guides

# Instalar dependencias
yarn
```

### Servidor de Desarrollo Local

```bash
yarn start
```

Este comando inicia un servidor de desarrollo local y abre una ventana del navegador. La mayoría de los cambios se reflejan en vivo sin necesidad de reiniciar el servidor.

### Generar Build de Producción

```bash
yarn build
```

Este comando genera contenido estático en el directorio `build` que puede ser servido usando cualquier servicio de hosting de contenido estático.

---

## 🚀 Despliegue

El sitio se despliega automáticamente a GitHub Pages mediante GitHub Actions cuando se hace push a la rama `main`.

**URL del sitio**: [https://Cloud-Architect-Library.github.io/guides/](https://Cloud-Architect-Library.github.io/guides/)

---

*Construido y mantenido por el equipo de AWS Solution Architects*
