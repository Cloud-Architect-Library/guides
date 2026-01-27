---
sidebar_position: 2
---
# 🔐 AWSAM - AWS Access Monitor

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
[![AWS](https://img.shields.io/badge/AWS-CloudFormation-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/cloudformation/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Status](https://img.shields.io/badge/Status-Active-success)](https://github.com)

> Sistema automatizado de monitoreo y notificación en tiempo real de actividad de usuarios IAM en AWS.

## 📖 Descripción

**AWSAM (AWS Access Monitor)** es una solución serverless que te permite monitorear y recibir alertas instantáneas sobre cualquier actividad de usuarios IAM en tu cuenta AWS, incluyendo:

- 🖥️ **Logins a la consola AWS**
- 🔑 **Asunción de roles IAM**
- 🔐 **Accesos vía CLI/API**
- 📧 **Notificaciones por email en tiempo real**

### ✨ Características Principales

- ⚡ **Tiempo Real**: Notificaciones en menos de 1 minuto
- 💰 **Costo Cero**: Completamente dentro de la capa gratuita de AWS
- 🚀 **Despliegue IaC**: CloudFormation y Terraform
- 🔒 **Seguro**: Implementa principios de mínimo privilegio
- 📊 **Completo**: Captura eventos de consola, CLI y API

## 🏗️ Arquitectura

```
            ┌─────────────────┐
            │  Usuario IAM    │
            │  (Login/CLI)    │
            └───────┬─────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│               CloudTrail                │
│       Registra todos los eventos        │
└────────┬────────────────────┬───────────┘
         │                    │
         │ ConsoleLogin       │ CLI/API Events
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│ CloudWatch Logs │  │  EventBridge    │
│ + Filter        │  │  Rule           │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └──────────┬─────────┘
                    ▼
         ┌─────────────────┐
         │  Lambda         │
         │  Function       │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  SNS Topic      │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  📧 Email       │
         └─────────────────┘
```

## 🚀 Inicio

Elige como quieres tu despliegue:

### ☁️ Opción 1: CloudFormation (Nativo AWS)

### 🏗️ Opción 2: Terraform (Multi-cloud)


## 📊 CloudFormation vs Terraform

| Característica | CloudFormation | Terraform |
|----------------|----------------|-----------|
| **Sintaxis** | YAML | HCL |
| **Nativo AWS** | ✅ Sí | ❌ No |
| **Multi-cloud** | ❌ No | ✅ Sí |
| **Estado** | Gestionado por AWS | Archivo externo (S3) |
| **Rollback** | Automático | Manual |
| **Validación** | `aws cloudformation validate-template` | `terraform validate` |
| **Preview** | Change Sets | `terraform plan` |
| **Módulos** | Nested Stacks | Terraform Registry |
| **Curva de aprendizaje** | ⭐⭐⭐ | ⭐⭐⭐⭐ |

### 💡 ¿Cuál elegir?

**Usa CloudFormation si:**
- ✅ Solo trabajas con AWS
- ✅ Quieres integración nativa
- ✅ Prefieres que AWS gestione el estado
- ✅ Necesitas rollback automático

**Usa Terraform si:**
- ✅ Trabajas con múltiples clouds, recuerda que podras reciclar tu codigo para otros proveedores
- ✅ Prefieres HCL sobre YAML
- ✅ Quieres usar módulos de la comunidad
- ✅ Necesitas más control sobre el estado

## 📧 Ejemplo de Notificación, así es como se ve la alerta en tu correo

```
🚨 ALERTA DE ACTIVIDAD IAM

🔑 AssumeRole
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Usuario: admin-user
📅 Fecha/Hora: 2025-12-05T10:30:15Z
🌐 IP Origen: 003.0.113.42
🔧 Acción: AssumeRole
💻 User Agent: aws-cli/2.31.31

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Región: us-east-1


```
## 💰 Costes


**Completamente GRATIS** para uso normal (dentro de la capa gratuita de AWS):

| Servicio | Capa Gratuita | Uso Estimado |
|----------|---------------|--------------|
| CloudTrail    | Incluido          | Ya activo    |
| EventBridge   | 1M eventos/mes    | ~1,000/mes   |
| Lambda        | 1M invocaciones/mes | ~1,000/mes   |
| SNS           | 1,000 emails/mes  | ~1,000/mes   |
| **TOTAL**     |                   | **€0/mes**   |

## 🔒 Seguridad
```

✅ **Principio de mínimo privilegio** - Roles IAM con permisos mínimos  
✅ **Confirmación de email** - Suscripciones SNS requieren confirmación  
✅ **Auditoría completa** - Logs de CloudWatch para todas las operaciones  
✅ **Sin credenciales hardcodeadas** - Usa variables de entorno  
✅ **Timeout limitado** - Lambda con timeout de 30 segundos
``` 


🎯 Roadmap

**Nuestra solución puede potenciarse con más funcionalidades:**

- Captura de ConsoleLogin en tiempo real
- Soporte para roles asumidos (AssumedRole)
- Integración con Slack/Microsoft Teams
- Dashboard de CloudWatch con métricas
- Detección de IPs sospechosas
- Alertas diferenciadas por severidad
- Análisis de patrones de comportamiento

<div align="center">

**Hecho con 💪 para mejorar la seguridad en AWS**

</div>
