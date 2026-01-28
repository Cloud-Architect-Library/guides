---
sidebar_label: "Starter Kit - Primeros Pasos"
sidebar_position: 1
---
<div align="center">

# 🛟 Guía de Seguridad AWS - Primeros Pasos

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

</div>

## 📋 Introducción

Esta guía proporciona las mejores prácticas fundamentales para asegurar su cuenta de AWS. Está diseñada para ayudarle a implementar una base sólida de seguridad siguiendo las recomendaciones de AWS.

**Objetivo**: Establecer controles de seguridad esenciales que protejan sus recursos en la nube.

---

## 1️⃣ Modelo de Responsabilidad Compartida

### ¿Qué es?

AWS opera bajo un modelo de **responsabilidad compartida** donde tanto AWS como el cliente tienen responsabilidades específicas en materia de seguridad.

### Responsabilidades de AWS
- **Seguridad DE la nube**: Infraestructura física, hardware, software, redes y centros de datos
- Protección de la infraestructura global que ejecuta todos los servicios de AWS

### Responsabilidades del Cliente
- **Seguridad EN la nube**: Datos, aplicaciones, configuración de servicios
- Gestión de identidades y accesos (IAM)
- Configuración de seguridad de los servicios que utiliza
- Cifrado de datos en tránsito y en reposo

### 📚 Documentación Oficial
- [Modelo de Responsabilidad Compartida de AWS](https://aws.amazon.com/compliance/shared-responsibility-model/)

---

## 2️⃣ Protección de la Cuenta Root

### ¿Por qué es importante?

La cuenta root tiene **acceso completo e irrestricto** a todos los recursos de su cuenta AWS. Su compromiso podría resultar en pérdida total de control.

### ✅ Mejores Prácticas

#### 1. Habilitar MFA (Autenticación Multifactor)
- **Obligatorio** para la cuenta root
- Usar un dispositivo MFA físico o virtual (Google Authenticator, Authy)
- Nunca compartir el dispositivo MFA

#### 2. Uso Limitado de Root
**SOLO usar la cuenta root para:**
- Cambiar el plan de soporte de AWS
- Cerrar la cuenta de AWS
- Cambiar la configuración de la cuenta (nombre, email, información de facturación)
- Restaurar permisos de usuario IAM

**NO usar root para:**
- Operaciones diarias
- Crear recursos
- Gestionar servicios
- Acceso a la consola de AWS

#### 3. Credenciales Seguras
- Usar una contraseña fuerte y única (mínimo 14 caracteres)
- No compartir las credenciales root con nadie
- Almacenar las credenciales en un lugar seguro (gestor de contraseñas)
- No crear access keys para la cuenta root

### 📚 Documentación Oficial
- [Protección de la Cuenta Root](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html)
- [Habilitar MFA](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa_enable.html)

---

## 3️⃣ IAM y Principio de Mínimo Privilegio

### ¿Qué es IAM?

AWS Identity and Access Management (IAM) permite controlar de forma segura el acceso a los servicios y recursos de AWS.

### Principio de Mínimo Privilegio

**Otorgar únicamente los permisos estrictamente necesarios** para realizar una tarea específica, durante el tiempo necesario.

### ✅ Mejores Prácticas

#### 1. Usar Roles en lugar de Usuarios
**Ventajas de los Roles:**
- Proporcionan credenciales temporales que expiran automáticamente
- No requieren gestión de access keys permanentes
- Ideales para aplicaciones y servicios
- Permiten federación con proveedores de identidad externos (Azure AD, Google Workspace)

**Cuándo usar Roles:**
- Aplicaciones que se ejecutan en EC2
- Servicios de AWS que necesitan acceder a otros servicios
- Usuarios federados desde sistemas externos
- Acceso entre cuentas de AWS

#### 2. Políticas Gestionadas vs Inline

**Políticas Gestionadas por AWS:**
- ✅ Preferir siempre que sea posible
- Mantenidas y actualizadas por AWS
- Cubren casos de uso comunes
- Ejemplos: `ReadOnlyAccess`, `PowerUserAccess`, `SecurityAudit`

**Políticas Personalizadas:**
- Crear solo cuando las políticas de AWS no cubren el caso de uso
- Versionar las políticas personalizadas
- Documentar el propósito de cada política

**Políticas Inline:**
- ❌ Evitar (difíciles de auditar y mantener)
- Solo usar en casos muy específicos

#### 3. Requerir MFA

**Implementar MFA para:**
- Acceso a la consola de AWS (obligatorio)
- Operaciones sensibles (eliminar recursos, cambiar configuraciones críticas)
- Acceso mediante CLI usando AWS STS

**Usar condiciones en políticas:**
```json
"Condition": {
  "BoolIfExists": {
    "aws:MultiFactorAuthPresent": "true"
  }
}
```

#### 4. Rotación de Credenciales

**Access Keys:**
- Rotar cada 90 días como máximo
- Usar AWS Secrets Manager para automatizar la rotación
- Eliminar access keys no utilizadas
- Monitorizar el último uso de credenciales

**Contraseñas:**
- Implementar política de contraseñas robusta
- Requerir cambio periódico (90-180 días)
- Longitud mínima de 14 caracteres
- Complejidad: mayúsculas, minúsculas, números, símbolos

### 📚 Documentación Oficial
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)
- [Políticas de IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)

---

## 4️⃣ IAM Access Analyzer

### ¿Qué es?

Herramienta **gratuita** que analiza políticas de recursos para identificar aquellos compartidos con entidades externas a su cuenta u organización.

### ¿Qué detecta?

- **Buckets S3** públicos o compartidos con otras cuentas
- **Roles IAM** asumibles desde cuentas externas
- **Claves KMS** accesibles externamente
- **Funciones Lambda** con permisos de invocación externa
- **Colas SQS** y **Tópicos SNS** compartidos

### Funcionalidad Adicional: Policy Generation

Genera políticas de IAM basadas en la **actividad real** registrada en CloudTrail:
- Analiza los logs de acceso
- Identifica los permisos realmente utilizados
- Genera políticas con permisos mínimos necesarios

### ✅ Cómo Implementar

1. **Habilitar IAM Access Analyzer** en la consola de AWS
2. Crear un analyzer de tipo "Account" o "Organization"
3. Revisar los findings (hallazgos) regularmente
4. Remediar accesos no autorizados
5. Usar Policy Generation para refinar permisos

### 📚 Documentación Oficial
- [IAM Access Analyzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html)
- [Policy Generation](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-policy-generation.html)

---

## 5️⃣ AWS Organizations

### ¿Qué es?

Servicio que permite **gestionar y gobernar múltiples cuentas de AWS** de forma centralizada.

### Beneficios

- **Facturación consolidada**: Una sola factura para todas las cuentas
- **Gestión centralizada**: Políticas y controles aplicados a toda la organización
- **Separación de entornos**: Desarrollo, Testing, Producción en cuentas separadas
- **Service Control Policies (SCPs)**: Restricciones a nivel de organización

### Estructura Recomendada

```
Organización
├── Management Account (Cuenta de gestión)
├── OU: Security (Unidad Organizativa de Seguridad)
│   ├── Cuenta: Security Tools
│   └── Cuenta: Log Archive
├── OU: Production (Producción)
│   ├── Cuenta: Prod App 1
│   └── Cuenta: Prod App 2
├── OU: Development (Desarrollo)
│   ├── Cuenta: Dev App 1
│   └── Cuenta: Dev App 2
└── OU: Testing (Pruebas)
    └── Cuenta: Test Environment
```

### Service Control Policies (SCPs)

**Políticas que establecen límites máximos de permisos** para cuentas en la organización.

**Ejemplos de uso:**
- Restringir regiones permitidas (ej: solo EU)
- Prohibir desactivación de servicios de seguridad (CloudTrail, GuardDuty)
- Requerir cifrado para todos los recursos
- Prohibir creación de usuarios IAM (forzar uso de roles)

### ✅ Mejores Prácticas

1. **No usar la Management Account para workloads**
   - Solo para gestión de la organización
   - Minimizar el acceso a esta cuenta

2. **Crear cuentas separadas por entorno**
   - Desarrollo, Testing, Producción
   - Aislamiento de recursos y costos

3. **Implementar SCPs restrictivas**
   - Denegar acciones peligrosas
   - Requerir controles de seguridad

4. **Centralizar logs y seguridad**
   - Cuenta dedicada para logs (Log Archive)
   - Cuenta dedicada para herramientas de seguridad

### 📚 Documentación Oficial
- [AWS Organizations](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html)
- [Service Control Policies](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)
- [Best Practices](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_best-practices.html)

---

## 6️⃣ Servicios de Seguridad Fundamentales

### AWS CloudTrail

**Auditoría de todas las acciones en su cuenta AWS**

- Registra todas las llamadas a la API
- Esencial para cumplimiento y auditoría
- Habilitar en todas las regiones
- Almacenar logs en S3 con cifrado
- Habilitar validación de integridad de logs

📚 [CloudTrail Documentation](https://docs.aws.amazon.com/cloudtrail/)

### Amazon GuardDuty

**Detección de amenazas inteligente**

- Usa Machine Learning para detectar actividad maliciosa
- Analiza CloudTrail, VPC Flow Logs, DNS logs
- Detección de malware, criptominería, accesos no autorizados
- 30 días de prueba gratuita

📚 [GuardDuty Documentation](https://docs.aws.amazon.com/guardduty/)

### AWS Security Hub

**Dashboard centralizado de seguridad**

- Agrega hallazgos de múltiples servicios
- Verifica cumplimiento con estándares (CIS, PCI-DSS)
- Prioriza hallazgos por severidad
- Integración con GuardDuty, Inspector, Macie

📚 [Security Hub Documentation](https://docs.aws.amazon.com/securityhub/)

### AWS Config

**Auditoría continua de configuraciones**

- Registra cambios en recursos
- Verifica cumplimiento con reglas
- Historial completo de configuraciones
- Alertas de cambios no autorizados

📚 [AWS Config Documentation](https://docs.aws.amazon.com/config/)

---

## 7️⃣ Protección de Datos

### Cifrado en Reposo

**Todos los datos almacenados deben estar cifrados**

**Servicios que soportan cifrado:**
- **S3**: Cifrado del lado del servidor (SSE-S3, SSE-KMS)
- **EBS**: Volúmenes cifrados
- **RDS**: Cifrado de bases de datos
- **DynamoDB**: Cifrado en reposo

### Cifrado en Tránsito

**Usar HTTPS/TLS para todas las comunicaciones**

- Certificados SSL/TLS mediante AWS Certificate Manager
- Forzar HTTPS en buckets S3
- Usar VPN o AWS Direct Connect para conexiones privadas

### AWS KMS (Key Management Service)

**Gestión centralizada de claves de cifrado**

- Crear Customer Managed Keys (CMK)
- Habilitar rotación automática anual
- Controlar acceso mediante políticas de claves
- Auditar uso de claves con CloudTrail

📚 [KMS Best Practices](https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html)

### AWS Secrets Manager

**Gestión segura de credenciales**

- Almacenar contraseñas, API keys, tokens
- Rotación automática de secretos
- Integración con RDS, Redshift, DocumentDB
- Auditoría de acceso a secretos

📚 [Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)

---

## 8️⃣ Seguridad de Red

### VPC (Virtual Private Cloud)

**Red privada virtual aislada**

**Mejores prácticas:**
- Usar subredes públicas y privadas
- Recursos sensibles en subredes privadas
- NAT Gateway para acceso a internet desde subredes privadas
- Security Groups restrictivos (principio de mínimo privilegio)

### VPC Flow Logs

**Monitoreo de tráfico de red**

- Captura información sobre tráfico IP
- Detecta patrones anómalos
- Ayuda en troubleshooting
- Almacenar en S3 o CloudWatch Logs

📚 [VPC Flow Logs](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html)

### AWS WAF (Web Application Firewall)

**Protección de aplicaciones web**

- Protege contra OWASP Top 10
- Rate limiting (límite de peticiones)
- Reglas gestionadas por AWS
- Reglas personalizadas

📚 [AWS WAF Documentation](https://docs.aws.amazon.com/waf/)

### AWS Shield

**Protección contra ataques DDoS**

- **Shield Standard**: Incluido gratuitamente
- **Shield Advanced**: Protección avanzada ($3,000/mes)
  - Equipo de respuesta DDoS 24/7
  - Protección de costos durante ataques

📚 [AWS Shield Documentation](https://docs.aws.amazon.com/shield/)

---

## 9️⃣ Monitoreo y Alertas

### Amazon CloudWatch

**Monitoreo de recursos y aplicaciones**

- Métricas de rendimiento
- Logs centralizados
- Alarmas personalizadas
- Dashboards visuales

### Amazon EventBridge

**Bus de eventos para automatización**

- Respuesta automática a eventos de seguridad
- Integración con Lambda para remediation
- Notificaciones mediante SNS

### Amazon SNS (Simple Notification Service)

**Notificaciones push**

- Alertas por email, SMS
- Integración con sistemas de ticketing
- Notificaciones a equipos de seguridad

---

## 🔟 Cumplimiento y Auditoría

### AWS Artifact

**Acceso a informes de cumplimiento**

- Certificaciones de AWS (ISO, SOC, PCI-DSS)
- Informes de auditoría
- Acuerdos de cumplimiento

📚 [AWS Artifact](https://aws.amazon.com/artifact/)

### AWS Audit Manager

**Automatización de auditorías**

- Recopilación continua de evidencias
- Frameworks de cumplimiento predefinidos
- Generación de informes de auditoría

📚 [Audit Manager Documentation](https://docs.aws.amazon.com/audit-manager/)

---

## 📊 Roadmap de Implementación Recomendado

### Fase 1: Fundamentos (Semana 1-2)
**Prioridad: CRÍTICA**

- [ ] Habilitar MFA en cuenta root
- [ ] Crear política de contraseñas robusta
- [ ] Habilitar CloudTrail en todas las regiones
- [ ] Habilitar GuardDuty
- [ ] Habilitar Security Hub
- [ ] Habilitar AWS Config
- [ ] Habilitar IAM Access Analyzer

**Tiempo estimado**: 4-8 horas  
**Costo estimado**: $10-100/mes

### Fase 2: Protección de Datos (Semana 3-4)
**Prioridad: ALTA**

- [ ] Implementar cifrado en S3
- [ ] Cifrar volúmenes EBS
- [ ] Cifrar bases de datos RDS
- [ ] Configurar AWS KMS con rotación automática
- [ ] Migrar credenciales a Secrets Manager
- [ ] Habilitar VPC Flow Logs

**Tiempo estimado**: 8-16 horas  
**Costo estimado**: $20-150/mes adicionales

### Fase 3: Seguridad Avanzada (Mes 2)
**Prioridad: MEDIA**

- [ ] Implementar AWS WAF
- [ ] Configurar Amazon Macie (si maneja datos sensibles)
- [ ] Habilitar Amazon Inspector
- [ ] Implementar AWS Organizations (si tiene múltiples cuentas)
- [ ] Configurar Service Control Policies

**Tiempo estimado**: 16-24 horas  
**Costo estimado**: $50-500/mes adicionales

---

## 🤖 Implementación

Si necesita ayuda con la implementación de estas mejores prácticas, nuestro equipo técnico está disponible para:

- Evaluación de seguridad de su cuenta actual
- Implementación automatizada de controles de seguridad
- Configuración de servicios de seguridad
- Auditoría y remediación de hallazgos
- Capacitación de su equipo


---

## 📚 Recursos Adicionales

### Documentación Oficial de AWS
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [AWS Well-Architected Framework - Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/)
- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services)

### Formación
- [AWS Security Fundamentals](https://aws.amazon.com/training/course-descriptions/security-fundamentals/)
- [AWS Security Learning Path](https://aws.amazon.com/training/learning-paths/security/)

### Herramientas
- [AWS Security Hub](https://aws.amazon.com/security-hub/)
- [AWS Trusted Advisor](https://aws.amazon.com/premiumsupport/technology/trusted-advisor/)

---

## 📝 Notas Finales

Esta guía proporciona las bases para una cuenta AWS segura. La seguridad es un proceso continuo que requiere:

- **Monitoreo constante** de hallazgos de seguridad
- **Actualización regular** de políticas y controles
- **Capacitación continua** del equipo
- **Revisión periódica** de accesos y permisos
- **Respuesta rápida** a incidentes de seguridad

**La seguridad es responsabilidad de todos.**

---

**Versión**: 1.0  
**Fecha**: Enero 2026

---

*Este documento es una guía de referencia. Para implementación técnica detallada, consulte con nuestro equipo de arquitectos.*
