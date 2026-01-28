---
sidebar_position: 3
---
<div align="center">

# 🔐 AWS Credentials Zero Trust



![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Security](https://img.shields.io/badge/Security-Zero%20Trust-green?style=for-the-badge)
![MFA](https://img.shields.io/badge/MFA-Required-blue?style=for-the-badge)


**Sistema de credenciales temporales para AWS con AssumeRole + MFA**

</div>

## 📖 Descripción

Un sistema de **credenciales temporales** para AWS que implementa principios **Zero Trust**, eliminando el uso de access keys permanentes con permisos amplios y añadiendo **autenticación multifactor (MFA)** recomendada y obligatoria.

## ¿ A quien va dirigida esta implementación?

Esta implementación va dirigida a los usuarios que trabajan con entornos de AWS CLI (DevOps, Administradores de Infraestructura, SysAdmins, etc.) que necesitan un sistema robusto de credenciales de AWS y quieran implementar el modelo Zero Trust en sus terminales, eliminando el uso de access keys permanentes con permisos amplios y añadiendo autenticación multifactor (MFA) recomendada y obligatoria.

### 🔴 Problema Original
```
❌ Credenciales permanentes con permisos amplios [ya sabes ese permiso "admin" que da acceso a todo ⚡️]
❌ Sin expiración automática
❌ Sin segundo factor de autenticación
❌ Difícil auditoría de acciones
❌ Alto riesgo si se comprometen
```

### ✅ Solución Implementada
```
✅ Usuario IAM con permisos mínimos (solo AssumeRole)
✅ MFA obligatorio para asumir roles
✅ Credenciales temporales (expiran cada 4-12 horas)
✅ Renovación automática con código MFA
✅ Auditoría completa en CloudTrail
✅ Nivel Zero Trust: ~90%
```

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                  Contenedor Local                       │
│                                                         │
│  ┌────────────────────────────────────────────────┐     │
│  │  ~/.aws/credentials                            │     │
│  │  [default] ← Credenciales TEMPORALES           │     │
│  │  [base]    ← Credenciales permanentes          │     │
│  │              (solo AssumeRole)                  │    │
│  └────────────────────────────────────────────────┘     │
│                          │                              │
│                          ▼                              │
│  ┌────────────────────────────────────────────────┐     │
│  │    Scripts de Renovación + MFA                  │    │
│  │    - renew-aws-credentials.sh (ReadOnly)        │    │
│  │    - renew-aws-credentials-admin.sh (Admin)     │    │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                          │
                          │ sts:AssumeRole + MFA
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    AWS Account                          │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────────┐     │
│  │  Usuario IAM     │ MFA  │  Roles IAM           │     │
│  │  my-user         │─────▶│  - ReadOnly (12h)    │     │
│  │                  │      │  - Admin (4h)        │     │
│  │  Permisos:       │      │                      │     │
│  │  - AssumeRole    │      │  Requiere MFA: ✅    │     │
│  └──────────────────┘      └──────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```
### 🔐 Seguridad Avanzada
- **MFA Obligatorio**: Autenticación de dos factores para todos los roles
- **Credenciales Temporales**: Expiran automáticamente (4-12 horas)
- **Least Privilege**: Usuarios con permisos mínimos
- **Auditoría Completa**: CloudTrail registra todas las acciones
- **Alertas Automáticas**: CloudWatch detecta actividad sospechosa

### 🎭 Múltiples Roles
| Rol | Permisos | Duración | Uso |
|-----|----------|----------|-----|
| **ReadOnly** | Solo lectura | 12 horas | Consultas diarias |
| **Admin** | Administrador | 4 horas | Cambios críticos |

### 🔄 Renovación Automática
- Scripts inteligentes que detectan expiración
- Solicitud de código MFA solo cuando es necesario
- Integración con `.bashrc` para avisos automáticos

### 📊 Monitoreo
- Alarmas para intentos fallidos de MFA
- Detección de actividad excesiva de AssumeRole
- Notificaciones por email vía SNS
---

## Implementación 
Con un despliegue rapido podemos implementar lo necesario en tu cuenta, además de facilitarte los scripts necesarios para potenciar la seguridad de tus credenciales de AWS.

### Requisitos Previos
- AWS CLI instalado
- `jq` instalado
- Acceso a IAM y permisos de creación de roles
- Smartphone con app de MFA (Google Authenticator, Authy, etc.)

### Como veras tu CLI
Cada vez que inicies sesión en tu terminal, veras un mensaje como el siguiente:

- ⚠️  Las credenciales AWS han expirado o no existen
- 🔐 Ejecuta: /ruta/a/mi/script/cred-admin.sh
- 💡 Necesitarás tu código MFA del teléfono

`SuperAdmin@linux:/#`

Una vez lanzado el script, te pedira tu codigo MFA y podras acceder a tus credenciales temporales. Estas credenciales expiran cada 4-12 horas (Este tiempo se puede ajustar) De esta manera tienes en tu configuración de AWS-CLI unas credenciales con un token de autenticación que si es expuesto no podra ser utilizado por nadie más.

## 🛡️ Seguridad

### Nivel Zero Trust Alcanzado: El camino del guerrero 🦄

| Principio | Estado | Implementación |
|-----------|--------|----------------|
| **Least Privilege** | ✅ | Usuario solo puede AssumeRole |
| **Credenciales Temporales** | ✅ | 4-12 horas de duración |
| **MFA** | ✅ | Obligatorio para AssumeRole |
| **Auditoría** | ✅ | CloudTrail completo |
| **Monitoreo** | ✅ | CloudWatch Alarms + SNS |
| **Alertas** | ✅ | Email automático |
| **Verificación Contextual** | ⚠️ | Parcial (región) |

### 🚨 Alarmas Configuradas

#### Intentos Fallidos de MFA
- **Umbral**: ≥3 intentos en 5 minutos
- **Acción**: Email automático
- **Respuesta**: Verificar actividad, cambiar contraseñas si es necesario

#### Actividad Excesiva de AssumeRole
- **Umbral**: >5 AssumeRole en 1 hora
- **Acción**: Email automático
- **Respuesta**: Investigar posible compromiso

## 📚 Referencias

- [AWS STS AssumeRole Documentation](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)
- [AWS MFA Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa.html)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Zero Trust Security Model](https://aws.amazon.com/security/zero-trust/)

---
<div align="center">

**Hecho con 💪 para mejorar la seguridad en AWS**

</div>
