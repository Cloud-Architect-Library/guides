---
sidebar_position: 3
---
<div align="center">

# 🚀 VPC EndPoint - System Manager (SSM)

### *Gestión de Instancias EC2 de forma segura con SSM*

![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![SSM](https://img.shields.io/badge/AWS_SSM-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)

</div>

## 📖 Índice

- [Descripción](#descripción)
- [¿Qué es AWS Systems Manager (SSM)?](#qué-es-aws-systems-manager-ssm)
- [¿Qué son los VPC Endpoints?](#qué-son-los-vpc-endpoints)
- [Arquitectura de la Solución](#arquitectura-de-la-solución)
- [Flujo de Comunicación](#flujo-de-comunicación)
- [Ventajas de esta Arquitectura](#ventajas-de-esta-arquitectura)
- [Casos de Uso](#casos-de-uso)

---

## 📖 Descripción

La gestión tradicional de instancias EC2 requiere exponer puertos SSH (22) o RDP (3389) a través de Internet, lo que representa un riesgo de seguridad significativo. Esta arquitectura elimina esa necesidad utilizando **AWS Systems Manager (SSM)** combinado con **VPC Endpoints**, permitiendo una gestión completamente privada y segura.

### Problema

```
Internet → Security Group (Puerto 22-3389 abierto) → EC2 en Subred Pública
❌ Exposición directa a ataques
❌ Requiere gestión de claves SSH
❌ Logs de acceso limitados
❌ Sin control granular de permisos
```

### Solución

```
Usuario → AWS IAM → SSM Service → VPC Endpoint → EC2 en Subred Privada
✅ Sin exposición a Internet
✅ Autenticación vía IAM
✅ Auditoría completa en CloudTrail
✅ Control granular de permisos
```

---

## ¿Qué es AWS Systems Manager (SSM)?

**AWS Systems Manager** es un servicio de gestión que permite administrar recursos de AWS e infraestructura on-premises de forma unificada y segura.

### Componentes Clave de SSM

#### 1. **SSM Agent**
- Agente instalado en las instancias EC2
- Preinstalado en AMIs de Amazon Linux, Ubuntu, Windows Server
- Establece comunicación bidireccional con el servicio SSM
- Se ejecuta como servicio del sistema operativo

#### 2. **Session Manager**
- Permite acceso interactivo a instancias sin SSH/RDP
- Sesiones basadas en navegador o AWS CLI
- Registro completo de sesiones en CloudWatch Logs o S3
- No requiere bastion hosts ni jump boxes

#### 3. **Run Command**
- Ejecuta comandos remotos en múltiples instancias
- Scripts predefinidos (SSM Documents)
- Ejecución paralela y programada
- Resultados centralizados

#### 4. **Patch Manager**
- Automatiza el parcheo de sistemas operativos
- Ventanas de mantenimiento programadas
- Cumplimiento de políticas de seguridad

---

## ¿Qué son los VPC Endpoints?

Los **VPC Endpoints** permiten conectar tu VPC de forma privada a servicios de AWS sin necesidad de Internet Gateway, NAT Gateway o VPN.

### Tipos de VPC Endpoints

#### 🔵 Interface Endpoints (AWS PrivateLink)
- Crean interfaces de red elásticas (ENI) en tus subredes
- Asignan IPs privadas dentro del rango de tu VPC
- Utilizan DNS privado para resolver nombres de servicios
- **Usados para SSM**: `ssm`, `ssmmessages`, `ec2messages`

#### 🟢 Gateway Endpoints
- Rutas en tablas de enrutamiento
- Sin costo adicional
- Solo para S3 y DynamoDB
- No aplicables a SSM

### VPC Endpoints para SSM

Para que SSM funcione completamente en una red privada, necesitas **tres Interface Endpoints**:

| Endpoint | Servicio AWS | Propósito |
|----------|--------------|-----------|
| **com.amazonaws.region.ssm** | Systems Manager | API principal de SSM para gestión de instancias |
| **com.amazonaws.region.ssmmessages** | SSM Messages | Comunicación bidireccional para Session Manager |
| **com.amazonaws.region.ec2messages** | EC2 Messages | Mensajes entre SSM Agent y el servicio EC2 |

---

## Arquitectura de la Solución

### Diagrama Detallado

<details>
<summary>💡 Ver ejemplo completo</summary>

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD                                    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    VPC (10.0.0.0/16)                           │ │
│  │                                                                │ │
│  │  ┌──────────────────────┐    ┌──────────────────────────────┐ │ │
│  │  │  Subred Pública      │    │  Subred Privada              │ │ │
│  │  │  (10.0.1.0/24)       │    │  (10.0.10.0/24)              │ │ │
│  │  │                      │    │                              │ │ │
│  │  │  ┌────────────────┐ │    │  ┌────────────────────────┐ │ │ │
│  │  │  │  NAT Gateway   │ │    │  │   EC2 Instance         │ │ │ │
│  │  │  │  + Elastic IP  │ │    │  │   - SSM Agent          │ │ │ │
│  │  │  └────────────────┘ │    │  │   - IAM Role           │ │ │ │
│  │  │                      │    │  │   - No Public IP       │ │ │ │
│  │  └──────────────────────┘    │  └───────┬────────────────┘ │ │ │
│  │           │                   │          │                  │ │ │
│  │           │                   │          │ HTTPS (443)      │ │ │
│  │  ┌────────▼────────┐          │  ┌───────▼────────────────┐ │ │ │
│  │  │ Internet Gateway│          │  │  VPC Endpoints (ENIs)  │ │ │ │
│  │  └────────┬────────┘          │  │                        │ │ │ │
│  │           │                   │  │  ┌──────────────────┐  │ │ │ │
│  └───────────┼───────────────────┼──┼──│ ssm.region.aws   │  │ │ │ │
│              │                   │  │  │ (10.0.10.10)     │  │ │ │ │
│              │                   │  │  └──────────────────┘  │ │ │ │
│              │                   │  │  ┌──────────────────┐  │ │ │ │
│              │                   │  │  │ ssmmessages      │  │ │ │ │
│              │                   │  │  │ (10.0.10.11)     │  │ │ │ │
│              │                   │  │  └──────────────────┘  │ │ │ │
│              │                   │  │  ┌──────────────────┐  │ │ │ │
│              │                   │  │  │ ec2messages      │  │ │ │ │
│              │                   │  │  │ (10.0.10.12)     │  │ │ │ │
│              │                   │  │  └──────────────────┘  │ │ │ │
│              │                   │  └────────────────────────┘ │ │ │
│              │                   └──────────────────────────────┘ │ │
│              │                                                    │ │
└──────────────┼────────────────────────────────────────────────────┘ │
               │                                                      │
               │                                                      │
        ┌──────▼──────┐                                              │
        │  Internet   │                                              │
        └──────┬──────┘                                              │
               │                                                      │
        ┌──────▼──────────┐                                          │
        │  Usuario IAM    │                                          │
        │  + AWS CLI      │                                          │
        └─────────────────┘                                          │
```

</details>

### Componentes de Red

#### Subred Pública
- **CIDR**: 10.0.1.0/24
- **Propósito**: Alojar NAT Gateway
- **Ruta**: 0.0.0.0/0 → Internet Gateway
- **Recursos**: NAT Gateway con Elastic IP

#### Subred Privada
- **CIDR**: 10.0.10.0/24
- **Propósito**: Alojar instancias EC2
- **Ruta**: 0.0.0.0/0 → NAT Gateway (para actualizaciones)
- **Recursos**: EC2, VPC Endpoints (ENIs)

---

## Flujo de Comunicación

### 1. Inicio de Sesión SSM

<details>
<summary>💡 Ver ejemplo completo</summary>

```
┌─────────────┐
│  Usuario    │
│  (AWS CLI)  │
└──────┬──────┘
       │ 1. aws ssm start-session --target i-xxxxx
       │
       ▼
┌─────────────────────┐
│  AWS IAM            │
│  - Valida usuario   │
│  - Verifica permisos│
└──────┬──────────────┘
       │ 2. Autorización OK
       │
       ▼
┌─────────────────────────────┐
│  AWS Systems Manager        │
│  - Busca instancia          │
│  - Verifica SSM Agent       │
│  - Crea sesión              │
└──────┬──────────────────────┘
       │ 3. Comando de conexión
       │
       ▼
┌─────────────────────────────┐
│  VPC Endpoint (ssmmessages) │
│  - ENI en subred privada    │
│  - IP: 10.0.10.11           │
└──────┬──────────────────────┘
       │ 4. Tráfico HTTPS (443)
       │    dentro de la VPC
       ▼
┌─────────────────────────────┐
│  EC2 Instance               │
│  - SSM Agent recibe comando │
│  - Establece sesión         │
│  - Shell interactivo        │
└─────────────────────────────┘
```

</details>

### 2. Comunicación del SSM Agent

El SSM Agent en la instancia EC2 realiza las siguientes acciones:

#### Registro Inicial
```
EC2 Instance (SSM Agent)
    │
    │ HTTPS → VPC Endpoint (ssm)
    │ POST /register
    │
    ▼
SSM Service
    │ Respuesta: Instance ID registrado
    │
    ▼
EC2 Instance
    │ Estado: Managed Instance
```

#### Polling de Comandos
```
Cada 15 segundos:

EC2 Instance (SSM Agent)
    │
    │ HTTPS → VPC Endpoint (ssm)
    │ GET /commands
    │
    ▼
SSM Service
    │ Respuesta: Comandos pendientes (si hay)
    │
    ▼
EC2 Instance
    │ Ejecuta comandos
    │ Envía resultados
```

#### Sesión Interactiva
```
Usuario ejecuta: aws ssm start-session

SSM Service
    │ Crea sesión
    │
    ▼
VPC Endpoint (ssmmessages)
    │ Canal WebSocket
    │
    ▼
EC2 Instance (SSM Agent)
    │ Abre shell
    │ Streaming bidireccional
    │
    ▼
Usuario
    │ Terminal interactivo
```

---



## Ventajas de esta Arquitectura

### 🔐 Seguridad

| Aspecto | Tradicional (SSH) | Con SSM + VPC Endpoints |
|---------|-------------------|-------------------------|
| **Exposición a Internet** | ❌ Puerto 22 abierto | ✅ Sin exposición |
| **Gestión de claves** | ❌ Claves SSH distribuidas | ✅ Autenticación IAM |
| **Auditoría** | ⚠️ Logs locales limitados | ✅ CloudTrail completo |
| **Rotación de credenciales** | ❌ Manual y compleja | ✅ Automática con IAM |
| **Acceso granular** | ⚠️ Todo o nada | ✅ Políticas IAM detalladas |
| **Cifrado** | ⚠️ Depende de configuración | ✅ TLS 1.2+ obligatorio |

### 💰 Costos

**VPC Endpoints (Interface)**:
- Costo por hora por endpoint: ~$0.01/hora
- Costo por GB procesado: ~$0.01/GB
- **Total mensual** (3 endpoints, uso moderado): ~$22-25/mes

**Comparación con alternativas**:
- Bastion Host (t3.micro): 💰
- VPN Site-to-Site: 💰💰
- Direct Connect: 💰💰💰

### 📊 Operacional

- ✅ **Sin mantenimiento de bastion hosts**
- ✅ **Sin gestión de claves SSH**
- ✅ **Escalabilidad automática**
- ✅ **Integración con AWS Organizations**
- ✅ **Cumplimiento normativo facilitado**

---

## Casos de Uso

### 1. Entornos de Producción Seguros

```
Requisito: Instancias en subredes privadas sin acceso directo
Solución: SSM + VPC Endpoints
Beneficio: Cumplimiento PCI-DSS, HIPAA, SOC 2
```

### 2. Automatización de Operaciones

```
Requisito: Ejecutar scripts en múltiples instancias
Solución: SSM Run Command + VPC Endpoints
Beneficio: Ejecución paralela sin SSH
```

### 3. Gestión Multi-Cuenta

```
Requisito: Administrar instancias en múltiples cuentas AWS
Solución: SSM + AWS Organizations + VPC Endpoints
Beneficio: Gestión centralizada con IAM
```

### 4. Troubleshooting Temporal

```
Requisito: Acceso temporal para debugging
Solución: Session Manager + IAM temporal
Beneficio: Acceso just-in-time sin cambios de seguridad
```

### 5. Cumplimiento Normativo

```
Requisito: Auditoría completa de accesos
Solución: SSM + CloudTrail + CloudWatch Logs
Beneficio: Registro de todas las sesiones y comandos
```

---

## Conclusión

La combinación de **AWS Systems Manager** con **VPC Endpoints** proporciona una solución robusta, segura y escalable para la gestión de instancias EC2 sin necesidad de exponer puertos de gestión a Internet. Esta arquitectura es especialmente valiosa en entornos regulados y de alta seguridad.

### Puntos Clave

- ✅ **Seguridad**: Sin exposición a Internet, autenticación IAM
- ✅ **Auditoría**: Registro completo en CloudTrail
- ✅ **Escalabilidad**: Gestión de miles de instancias
- ✅ **Costos**: Predecibles y razonables
- ✅ **Cumplimiento**: Facilita certificaciones de seguridad

---

<div align="center">

**Hecho con 💪 para mejorar la seguridad en AWS**

**📚 Documentación Adicional**

[AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/) | 
[VPC Endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/) | 
[Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)

</div>
