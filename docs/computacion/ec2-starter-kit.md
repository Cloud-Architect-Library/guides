---
sidebar_label: "Starter Kit - Buenas Prácticas de Seguridad"
sidebar_position: 1
---

<div align="center">

# 🚀 EC2 Starter Kit - Buenas Prácticas de Seguridad

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![EC2](https://img.shields.io/badge/EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white)

</div>

## 📋 Introducción

Esta guía presenta las mejores prácticas de seguridad que debe implementar al trabajar con instancias Amazon EC2 en producción. Está diseñada para profesionales que ya conocen AWS y buscan fortalecer la postura de seguridad de sus workloads.

**Objetivo**: Implementar controles de seguridad robustos que protejan sus instancias EC2 siguiendo el principio de defensa en profundidad.

---

## 1️⃣ Gestión de Acceso y Credenciales

### AWS Systems Manager Session Manager

**¿Por qué es importante?**

Exponer puertos SSH (22) o RDP (3389) a internet es una de las principales causas de compromiso de instancias EC2. Session Manager elimina esta necesidad.

### ✅ Mejores Prácticas

#### Usa Session Manager en lugar de SSH/RDP
#### Ventajas de Session Manager

- ✅ **Sin puertos expuestos**: No necesita abrir SSH/RDP en Security Groups
- ✅ **Sin IPs públicas**: Funciona con instancias en subnets privadas
- ✅ **Auditoría completa**: Todas las sesiones se registran en CloudTrail
- ✅ **Control granular**: Permisos mediante IAM
- ✅ **Grabación de sesiones**: Almacena logs de comandos ejecutados

#### Configuración Básica

**1. Asignar IAM Role a la instancia:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "ssm:UpdateInstanceInformation",
      "ssmmessages:CreateControlChannel",
      "ssmmessages:CreateDataChannel",
      "ssmmessages:OpenControlChannel",
      "ssmmessages:OpenDataChannel"
    ],
    "Resource": "*"
  }]
}
```

**2. Instalar SSM Agent** (preinstalado en AMIs de Amazon Linux 2, Ubuntu 16.04+, Windows Server 2016+)

**3. Conectar desde la consola o CLI:**
```bash
aws ssm start-session --target i-1234567890abcdef0
```

📚 [Session Manager Documentation](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)

---

### Gestión de Claves SSH

**Si necesita usar SSH tradicional:**
- ❌ **Nunca compartas claves privadas** entre usuarios o instancias
- 🔄 **Rota las claves regularmente** (cada 90 días)
- 🔐 **Usa AWS Secrets Manager** o Parameter Store para almacenar claves
- 📜 **Implementa autenticación basada en certificados** cuando sea posible
- 🗑️ **Elimina claves no utilizadas** de `~/.ssh/authorized_keys`

---

### IAM Roles para EC2

**¿Por qué usar IAM Roles?**

Las credenciales hardcodeadas son la causa #1 de filtraciones de seguridad. Los IAM Roles proporcionan credenciales temporales que se rotan automáticamente.

#### ✅ Mejores Prácticas
1. **Siempre usa IAM Roles** en lugar de credenciales estáticas
2. **Aplica el principio de mínimo privilegio** - solo permisos necesarios
3. **Revisa y audita permisos regularmente** con IAM Access Analyzer
4. **Usa políticas basadas en condiciones** (IP, tiempo, MFA, tags)

#### Ejemplo: Política con Restricción de IP

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::mi-bucket/*",
    "Condition": {
      "IpAddress": {
        "aws:SourceIp": "10.0.0.0/16"
      }
    }
  }]
}
```

#### Ejemplo: Política con Restricción de Tags

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "ec2:StartInstances",
    "Resource": "*",
    "Condition": {
      "StringEquals": {
        "ec2:ResourceTag/Environment": "Development"
      }
    }
  }]
}
```

📚 [IAM Roles for EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html)

---

## 2️⃣ Configuración de Red

### Security Groups

**Los Security Groups son firewalls stateful** que controlan el tráfico de entrada y salida de las instancias.

### ✅ Mejores Prácticas

#### 1. Principio de Mínimo Privilegio
- ✅ **Solo abre los puertos estrictamente necesarios**
- ❌ **Evita reglas 0.0.0.0/0** en tráfico de entrada (excepto HTTP/HTTPS en ALB)
- 🔗 **Usa Security Groups como origen** en lugar de rangos IP
- 📝 **Documenta cada regla** con descripciones claras
- 🏗️ **Separa por función**: web-sg, app-sg, db-sg

#### 2. Ejemplos de Configuración Segura

**❌ MAL - Demasiado permisivo:**
```
Inbound: 0.0.0.0/0 → Port 22 (SSH)
```

**✅ BIEN - Restrictivo:**
```
Inbound: sg-bastion-12345 → Port 22 (SSH)
Description: "SSH desde bastion host"
```

**✅ MEJOR - Sin SSH expuesto:**
```
Inbound: sg-alb-67890 → Port 443 (HTTPS)
Description: "HTTPS desde Application Load Balancer"
# Usar Session Manager para acceso administrativo
```

#### 3. Arquitectura de Capas

```
Internet
    ↓
[ALB Security Group] → Ports 80, 443 desde 0.0.0.0/0
    ↓
[App Security Group] → Port 8080 desde ALB-SG
    ↓
[DB Security Group] → Port 3306 desde App-SG
```

📚 [Security Groups Best Practices](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html)

---

### Network ACLs

**Las NACLs son firewalls stateless** que operan a nivel de subnet.

#### ✅ Cuándo Usar NACLs
- 🛡️ **Capa adicional de defensa** (defensa en profundidad)
- 🚫 **Bloquear IPs maliciosas conocidas** explícitamente
- 🔒 **Protección a nivel de subnet** para toda la infraestructura
- 📋 **Mantén las reglas ordenadas y documentadas**

#### Ejemplo: Bloquear IP Maliciosa

```
Rule #: 10
Type: Deny
Protocol: All
Source: 203.0.113.0/24
Description: "Bloquear red maliciosa detectada por GuardDuty"
```

---

### VPC y Subnets

**Arquitectura de red segura y escalable**

#### ✅ Mejores Prácticas

1. **Subnets Privadas para Workloads**
   - ✅ Coloca instancias en subnets **privadas** siempre que sea posible
   - ✅ Usa NAT Gateway para acceso a internet saliente
   - ✅ Sin IPs públicas en instancias de aplicación

2. **Segmentación por Capas**
   ```
   VPC: 10.0.0.0/16
   ├── Public Subnet:  10.0.1.0/24  (ALB, NAT Gateway)
   ├── Private Subnet: 10.0.10.0/24 (App Servers)
   └── Data Subnet:    10.0.20.0/24 (Databases)
   ```

3. **VPC Flow Logs**
   - 📊 **Habilita Flow Logs** en todas las VPCs
   - 🔍 **Analiza patrones de tráfico** sospechosos
   - 🚨 **Integra con SIEM** para detección de amenazas
   - 📦 **Almacena en S3** con retención según compliance

#### Configurar VPC Flow Logs

```bash
aws ec2 create-flow-logs \
  --resource-type VPC \
  --resource-ids vpc-12345678 \
  --traffic-type ALL \
  --log-destination-type s3 \
  --log-destination arn:aws:s3:::my-flow-logs-bucket
```

📚 [VPC Best Practices](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-best-practices.html)

---

## 3️⃣ Cifrado y Protección de Datos

### Cifrado de Volúmenes EBS

**¿Por qué es crítico?**

Los volúmenes EBS sin cifrar exponen datos sensibles en caso de acceso no autorizado a snapshots o volúmenes.

### ✅ Mejores Prácticas

#### 1. Habilitar Cifrado por Defecto

**Configurar a nivel de región:**
```bash
# Habilitar cifrado por defecto en la región
aws ec2 enable-ebs-encryption-by-default --region us-east-1

# Verificar estado
aws ec2 get-ebs-encryption-by-default --region us-east-1
```

#### 2. Usar AWS KMS para Gestión de Claves

- 🔑 **Customer Managed Keys (CMK)** para control total
- 🔄 **Rotación automática anual** de claves
- 📋 **Políticas de claves** para control de acceso granular
- 📊 **Auditoría con CloudTrail** de uso de claves

#### 3. Cifrar Volúmenes Existentes

**Proceso para volúmenes no cifrados:**

1. Crear snapshot del volumen
2. Copiar snapshot con cifrado habilitado
3. Crear nuevo volumen desde snapshot cifrado
4. Reemplazar volumen original

```bash
# Crear snapshot
aws ec2 create-snapshot --volume-id vol-1234567890abcdef0

# Copiar con cifrado
aws ec2 copy-snapshot \
  --source-snapshot-id snap-066877671789bd71b \
  --encrypted \
  --kms-key-id arn:aws:kms:us-east-1:123456789012:key/abcd1234
```

📚 [EBS Encryption](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSEncryption.html)

---

### Snapshots

**Protección y gestión de backups**

#### ✅ Mejores Prácticas
- 🔐 **Cifra todos los snapshots** (heredan cifrado del volumen)
- ⏰ **Implementa políticas de retención** con Data Lifecycle Manager
- 🌍 **Copia snapshots críticos** a otra región (DR)
- 🔒 **Restringe permisos de acceso** - nunca públicos
- 🏷️ **Etiqueta snapshots** para gestión y compliance

#### Automatizar Snapshots con DLM

```json
{
  "PolicyDetails": {
    "ResourceTypes": ["VOLUME"],
    "TargetTags": [{
      "Key": "Backup",
      "Value": "Daily"
    }],
    "Schedules": [{
      "Name": "Daily Snapshots",
      "CreateRule": {
        "Interval": 24,
        "IntervalUnit": "HOURS",
        "Times": ["03:00"]
      },
      "RetainRule": {
        "Count": 7
      },
      "CopyTags": true
    }]
  }
}
```

📚 [Amazon Data Lifecycle Manager](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/snapshot-lifecycle.html)

---

## 4️⃣ Gestión de Imágenes (AMIs)

### AMIs Seguras

**Las AMIs son la base de sus instancias** - deben ser seguras desde el inicio.

### ✅ Mejores Prácticas

#### 1. Fuentes Confiables
- ✅ **Usa AMIs oficiales** de AWS o proveedores verificados
- 🏢 **Mantén repositorio privado** de AMIs corporativas
- 🔒 **Implementa proceso de hardening** antes de crear AMIs
- 🔍 **Escanea AMIs** en busca de vulnerabilidades (Inspector)
- 🗑️ **Elimina credenciales y datos sensibles** antes de crear la AMI

#### 2. Hardening de AMIs

**Checklist de hardening:**

- [ ] Actualizar todos los paquetes del sistema
- [ ] Eliminar usuarios y credenciales por defecto
- [ ] Deshabilitar servicios innecesarios
- [ ] Configurar firewall local (iptables/firewalld)
- [ ] Instalar y configurar agentes de seguridad
- [ ] Configurar logging centralizado
- [ ] Eliminar historial de comandos y logs temporales
- [ ] Configurar SELinux/AppArmor

#### 3. Gestión del Ciclo de Vida

```
Crear AMI Base → Hardening → Escaneo → Aprobación → Distribución → Deprecación
```

📚 [AMI Best Practices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html)

---

### Actualizaciones y Parches

**Mantener sistemas actualizados es crítico** para prevenir explotación de vulnerabilidades conocidas.

#### ✅ AWS Systems Manager Patch Manager
**Automatiza la aplicación de parches:**

1. **Define Patch Baselines**
   - Parches críticos y de seguridad
   - Ventanas de aprobación
   - Excepciones documentadas

2. **Configura Maintenance Windows**
   - Horarios de bajo impacto
   - Diferentes ventanas por entorno
   - Notificaciones automáticas

3. **Monitorea Compliance**
   - Dashboard de estado de parches
   - Alertas de instancias no conformes
   - Reportes para auditoría

```bash
# Ver estado de compliance de parches
aws ssm describe-instance-patch-states \
  --instance-ids i-1234567890abcdef0
```

📚 [Patch Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-patch.html)

---

## 5️⃣ Monitoreo y Logging

### Amazon CloudWatch

**Visibilidad completa de sus instancias EC2**

### ✅ Mejores Prácticas

#### 1. Monitoreo Detallado
- 📊 **Habilita monitoreo detallado** (métricas cada 1 minuto)
- 📈 **Instala CloudWatch Agent** para métricas del SO (memoria, disco)
- 📋 **Centraliza logs** de aplicaciones y sistema
- 🚨 **Configura alarmas proactivas**

#### 2. Alarmas Críticas de Seguridad

**CPU Anómala (posible cryptomining):**
```json
{
  "AlarmName": "High-CPU-Usage",
  "MetricName": "CPUUtilization",
  "Threshold": 80,
  "ComparisonOperator": "GreaterThanThreshold",
  "EvaluationPeriods": 2,
  "Period": 300
}
```

**Tráfico de Red Inusual:**
```json
{
  "AlarmName": "Unusual-Network-Out",
  "MetricName": "NetworkOut",
  "Statistic": "Average",
  "Threshold": 1000000000,
  "ComparisonOperator": "GreaterThanThreshold"
}
```

#### 3. CloudWatch Logs Insights

**Buscar intentos de acceso fallidos:**
```sql
fields @timestamp, @message
| filter @message like /Failed password/
| stats count() by bin(5m)
```

📚 [CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)

---

### AWS CloudTrail

**Auditoría de todas las acciones en EC2**

#### ✅ Configuración Esencial
- ✅ **Habilita CloudTrail** en todas las regiones
- 🔐 **Cifra logs** con KMS
- 🔒 **Protege el bucket S3** con políticas restrictivas
- ✔️ **Habilita validación de integridad** de logs
- 🚨 **Configura alertas** para acciones críticas

#### Eventos Críticos a Monitorear

- `RunInstances` - Lanzamiento de instancias
- `TerminateInstances` - Terminación de instancias
- `AuthorizeSecurityGroupIngress` - Cambios en Security Groups
- `CreateKeyPair` / `DeleteKeyPair` - Gestión de claves
- `ModifyInstanceAttribute` - Cambios en configuración
- `AttachVolume` / `DetachVolume` - Manipulación de volúmenes

#### Ejemplo: Alerta de Cambio en Security Group

```json
{
  "source": ["aws.ec2"],
  "detail-type": ["AWS API Call via CloudTrail"],
  "detail": {
    "eventName": ["AuthorizeSecurityGroupIngress"],
    "requestParameters": {
      "ipPermissions": {
        "ipRanges": {
          "cidrIp": ["0.0.0.0/0"]
        }
      }
    }
  }
}
```

📚 [CloudTrail Best Practices](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/best-practices-security.html)

---

### VPC Flow Logs

**Análisis de tráfico de red**

#### ✅ Implementación
- 📊 **Habilita en todas las VPCs** y subnets críticas
- 🔍 **Analiza patrones sospechosos** (port scanning, data exfiltration)
- 🔗 **Integra con herramientas SIEM** (Splunk, ELK)
- 📦 **Retén logs** según requisitos de compliance (90+ días)

#### Casos de Uso

1. **Detectar Port Scanning**
2. **Identificar tráfico a IPs maliciosas**
3. **Analizar patrones de comunicación**
4. **Troubleshooting de conectividad**
5. **Auditoría de compliance**

#### Análisis con Athena

```sql
SELECT sourceaddress, destinationaddress, destinationport, protocol, bytes
FROM vpc_flow_logs
WHERE action = 'REJECT'
AND destinationport = 22
ORDER BY bytes DESC
LIMIT 100;
```

📚 [VPC Flow Logs](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html)

---

## 6️⃣ Protección contra Amenazas

### AWS GuardDuty

**Detección inteligente de amenazas con Machine Learning**

### ✅ Mejores Prácticas

#### Qué Detecta GuardDuty en EC2
- 🦠 **Malware y cryptomining**
- 🔓 **Credenciales comprometidas**
- 🌐 **Comunicación con IPs maliciosas**
- 🚪 **Backdoors y C&C (Command & Control)**
- 📡 **Data exfiltration**
- 🔨 **Brute force attacks**

#### Implementación

1. **Habilita GuardDuty** en todas las regiones activas
2. **Revisa hallazgos** diariamente (o automatiza)
3. **Configura respuestas automáticas** con EventBridge + Lambda
4. **Integra con ticketing** (Jira, ServiceNow)

#### Ejemplo: Auto-Remediation

```python
# Lambda para aislar instancia comprometida
def lambda_handler(event, context):
    instance_id = event['detail']['resource']['instanceDetails']['instanceId']
    
    # Crear Security Group de cuarentena
    quarantine_sg = create_quarantine_sg()
    
    # Aplicar a la instancia
    ec2.modify_instance_attribute(
        InstanceId=instance_id,
        Groups=[quarantine_sg]
    )
    
    # Notificar al equipo de seguridad
    sns.publish(
        TopicArn='arn:aws:sns:us-east-1:123456789012:security-alerts',
        Message=f'Instancia {instance_id} aislada por GuardDuty'
    )
```

📚 [GuardDuty Documentation](https://docs.aws.amazon.com/guardduty/)

---

### Amazon Inspector

**Escaneo automatizado de vulnerabilidades**

#### ✅ Qué Escanea
- 🐛 **Vulnerabilidades de software** (CVEs)
- 📦 **Paquetes desactualizados**
- 🔓 **Configuraciones inseguras**
- 🌐 **Exposición de red no intencional**
- 📋 **Compliance con CIS Benchmarks**

#### Implementación

- ✅ **Escaneo continuo** automático
- 📊 **Prioriza por criticidad** (Critical, High, Medium, Low)
- 🔄 **Integra con CI/CD** para escaneo de AMIs
- 📝 **Documenta excepciones** justificadas

#### Ejemplo de Hallazgo

```
CVE-2021-44228 (Log4Shell)
Severity: CRITICAL
Package: log4j-core 2.14.1
Remediation: Upgrade to 2.17.1 or later
Affected Instances: 15
```

📚 [Amazon Inspector](https://docs.aws.amazon.com/inspector/)

---

### AWS WAF (para instancias web)

**Protección de aplicaciones web**

#### ✅ Reglas Esenciales
- 🛡️ **AWS Managed Rules** para OWASP Top 10
- 🚦 **Rate limiting** (prevenir DDoS de capa 7)
- 🚫 **IP Reputation Lists** (bloquear IPs maliciosas)
- 🌍 **Geo-blocking** (restringir países)
- 🤖 **Bot Control** (detectar bots maliciosos)

#### Ejemplo: Rate Limiting

```json
{
  "Name": "RateLimitRule",
  "Priority": 1,
  "Statement": {
    "RateBasedStatement": {
      "Limit": 2000,
      "AggregateKeyType": "IP"
    }
  },
  "Action": {
    "Block": {}
  }
}
```

**Nota**: WAF se asocia con Application Load Balancer, no directamente con EC2.

📚 [AWS WAF Documentation](https://docs.aws.amazon.com/waf/)

---

## 7️⃣ Configuración de Instancias

### Instance Metadata Service (IMDS)

**¿Por qué es importante?**

IMDSv1 es vulnerable a ataques SSRF (Server-Side Request Forgery). IMDSv2 requiere autenticación mediante tokens.

### ✅ Mejores Prácticas

#### 1. Usar IMDSv2 Obligatoriamente
**Configurar en instancias existentes:**

```bash
aws ec2 modify-instance-metadata-options \
  --instance-id i-1234567890abcdef0 \
  --http-tokens required \
  --http-put-response-hop-limit 1
```

**Configurar en Launch Template:**

```json
{
  "MetadataOptions": {
    "HttpTokens": "required",
    "HttpPutResponseHopLimit": 1,
    "HttpEndpoint": "enabled"
  }
}
```

#### 2. Limitar Hop Count

- ✅ **Hop limit = 1** para instancias normales
- ✅ **Hop limit = 2** solo si usa contenedores (ECS, EKS)
- ❌ **Nunca > 2** (aumenta superficie de ataque)

#### 3. Deshabilitar IMDS si no se usa

```bash
aws ec2 modify-instance-metadata-options \
  --instance-id i-1234567890abcdef0 \
  --http-endpoint disabled
```

📚 [IMDSv2 Documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html)

---

### User Data

**Scripts de inicialización de instancias**

#### ✅ Mejores Prácticas
- ❌ **Nunca incluyas credenciales** en User Data
- 🔐 **Usa Parameter Store o Secrets Manager** para secretos
- 📝 **Minimiza la lógica** - usa Configuration Management (Ansible, Chef)
- 📊 **Registra la ejecución** para debugging

#### Ejemplo Seguro: Obtener Secreto

```bash
#!/bin/bash
# User Data Script

# Obtener secreto desde Secrets Manager
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id prod/db/password \
  --query SecretString \
  --output text)

# Configurar aplicación
echo "DB_PASSWORD=$DB_PASSWORD" >> /etc/app/config
```

---

### Hardening del Sistema Operativo

**Configuración segura del SO**

#### ✅ Checklist de Hardening
**Linux:**
- [ ] Deshabilitar servicios innecesarios
- [ ] Configurar firewall local (iptables/firewalld)
- [ ] Implementar fail2ban para protección contra brute force
- [ ] Configurar SELinux en modo enforcing
- [ ] Limitar acceso sudo con políticas granulares
- [ ] Deshabilitar root login
- [ ] Configurar auditoría con auditd

**Windows:**
- [ ] Habilitar Windows Firewall
- [ ] Configurar Windows Defender
- [ ] Deshabilitar servicios innecesarios
- [ ] Implementar AppLocker
- [ ] Configurar auditoría de eventos
- [ ] Aplicar Group Policy Objects (GPO)

#### Ejemplo: Configurar fail2ban

```bash
# Instalar fail2ban
yum install fail2ban -y

# Configurar para SSH
cat > /etc/fail2ban/jail.local <<EOF
[sshd]
enabled = true
port = ssh
logpath = /var/log/secure
maxretry = 3
bantime = 3600
EOF

systemctl enable fail2ban
systemctl start fail2ban
```

📚 [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks/)

---

## 8️⃣ Backup y Recuperación

### Estrategia de Backup

**Los backups son su última línea de defensa** contra ransomware y pérdida de datos.

### ✅ Mejores Prácticas

#### 1. AWS Backup
**Servicio centralizado de backup:**

- 🔄 **Automatiza backups** de EC2, EBS, RDS, DynamoDB
- 📅 **Define políticas de retención** por tipo de dato
- 🔐 **Cifra backups** con KMS
- 🌍 **Copia a múltiples regiones** para DR
- 🏷️ **Etiqueta backups** para gestión

#### 2. Definir RPO y RTO

**RPO (Recovery Point Objective)**: ¿Cuántos datos puedo perder?
- Crítico: RPO = 1 hora (backups cada hora)
- Importante: RPO = 4 horas
- Normal: RPO = 24 horas

**RTO (Recovery Time Objective)**: ¿Cuánto tiempo para recuperar?
- Crítico: RTO = 1 hora
- Importante: RTO = 4 horas
- Normal: RTO = 24 horas

#### 3. Pruebas de Restauración

- 🧪 **Prueba restauraciones regularmente** (mensual)
- 📋 **Documenta procedimientos** de recuperación
- ⏱️ **Mide tiempos reales** de restauración
- 🎯 **Valida integridad** de datos restaurados

#### Ejemplo: Plan de Backup con AWS Backup

```json
{
  "BackupPlanName": "EC2-Production-Backup",
  "Rules": [{
    "RuleName": "DailyBackups",
    "TargetBackupVault": "Production-Vault",
    "ScheduleExpression": "cron(0 2 * * ? *)",
    "StartWindowMinutes": 60,
    "CompletionWindowMinutes": 120,
    "Lifecycle": {
      "DeleteAfterDays": 30,
      "MoveToColdStorageAfterDays": 7
    },
    "CopyActions": [{
      "DestinationBackupVaultArn": "arn:aws:backup:us-west-2:123456789012:backup-vault:DR-Vault"
    }]
  }]
}
```

📚 [AWS Backup Documentation](https://docs.aws.amazon.com/aws-backup/)

---

### Disaster Recovery

**Preparación para el peor escenario**

#### ✅ Estrategias de DR
**1. Backup & Restore** (RTO: horas/días, Costo: $)
- Backups regulares en S3
- Restauración manual cuando sea necesario

**2. Pilot Light** (RTO: minutos/horas, Costo: $$)
- Infraestructura mínima siempre activa
- Escala rápidamente en caso de desastre

**3. Warm Standby** (RTO: minutos, Costo: $$$)
- Versión reducida del entorno en otra región
- Siempre ejecutándose

**4. Multi-Site Active/Active** (RTO: segundos, Costo: $$$$)
- Entorno completo en múltiples regiones
- Tráfico distribuido activamente

#### Implementación Básica

- 📋 **Documenta runbooks** de DR
- 🗺️ **Mantén AMIs actualizadas** en región secundaria
- 🔄 **Usa Auto Scaling** para resiliencia
- ❤️ **Implementa health checks** robustos
- 🎭 **Practica simulacros** de DR (GameDays)

📚 [Disaster Recovery on AWS](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html)

---

## 9️⃣ Compliance y Gobernanza

### AWS Config

**Auditoría continua de configuraciones**

### ✅ Reglas Esenciales para EC2

#### Reglas Gestionadas Recomendadas
| Regla | Descripción |
|-------|-------------|
| `ec2-instance-managed-by-systems-manager` | Verifica que instancias estén gestionadas por SSM |
| `ec2-volume-inuse-check` | Detecta volúmenes EBS no adjuntos |
| `encrypted-volumes` | Verifica que volúmenes EBS estén cifrados |
| `ec2-security-group-attached-to-eni` | Valida Security Groups en uso |
| `ec2-imdsv2-check` | Verifica que IMDSv2 esté habilitado |
| `ec2-instance-no-public-ip` | Detecta instancias con IP pública |
| `ec2-stopped-instance` | Identifica instancias detenidas (optimización de costos) |

#### Implementación

```bash
# Habilitar AWS Config
aws configservice put-configuration-recorder \
  --configuration-recorder name=default,roleARN=arn:aws:iam::123456789012:role/config-role \
  --recording-group allSupported=true,includeGlobalResourceTypes=true

# Agregar regla
aws configservice put-config-rule \
  --config-rule file://encrypted-volumes-rule.json
```

📚 [AWS Config Rules](https://docs.aws.amazon.com/config/latest/developerguide/managed-rules-by-aws-config.html)

---

### Estrategia de Tagging

**Los tags son fundamentales** para gobernanza, seguridad y gestión de costos.

#### ✅ Tags Obligatorios
| Tag | Valores | Propósito |
|-----|---------|-----------|
| `Environment` | prod, staging, dev, test | Segregación de entornos |
| `Owner` | team-backend, team-frontend | Responsabilidad |
| `CostCenter` | engineering, marketing | Asignación de costos |
| `Compliance` | pci-dss, hipaa, sox | Requisitos regulatorios |
| `DataClassification` | public, internal, confidential, restricted | Nivel de sensibilidad |
| `BackupPolicy` | daily, weekly, none | Estrategia de backup |
| `PatchGroup` | critical, standard, manual | Gestión de parches |

#### Ejemplo: Política de Tags Obligatorios

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "ec2:RunInstances",
    "Resource": "arn:aws:ec2:*:*:instance/*",
    "Condition": {
      "StringNotLike": {
        "aws:RequestTag/Environment": ["prod", "staging", "dev"],
        "aws:RequestTag/Owner": "*",
        "aws:RequestTag/CostCenter": "*"
      }
    }
  }]
}
```

#### Automatizar Tagging

```bash
# Tag Editor - buscar recursos sin tags
aws resourcegroupstaggingapi get-resources \
  --resource-type-filters "ec2:instance" \
  --tag-filters Key=Environment

# Aplicar tags masivamente
aws ec2 create-tags \
  --resources i-1234567890abcdef0 i-0987654321fedcba0 \
  --tags Key=Environment,Value=production Key=Owner,Value=team-backend
```

📚 [Tagging Best Practices](https://docs.aws.amazon.com/general/latest/gr/aws_tagging.html)

---

### Service Control Policies (SCPs)

**Restricciones a nivel de AWS Organizations**

#### ✅ Ejemplos de SCPs para EC2
**1. Prevenir lanzamiento sin cifrado:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "ec2:RunInstances",
    "Resource": "arn:aws:ec2:*:*:volume/*",
    "Condition": {
      "Bool": {
        "ec2:Encrypted": "false"
      }
    }
  }]
}
```

**2. Restringir tipos de instancia:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "ec2:RunInstances",
    "Resource": "arn:aws:ec2:*:*:instance/*",
    "Condition": {
      "StringNotLike": {
        "ec2:InstanceType": ["t3.*", "t3a.*", "m5.*"]
      }
    }
  }]
}
```

**3. Bloquear regiones no autorizadas:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "ec2:*",
    "Resource": "*",
    "Condition": {
      "StringNotEquals": {
        "aws:RequestedRegion": ["us-east-1", "eu-west-1"]
      }
    }
  }]
}
```

**4. Requerir IMDSv2:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "ec2:RunInstances",
    "Resource": "arn:aws:ec2:*:*:instance/*",
    "Condition": {
      "StringNotEquals": {
        "ec2:MetadataHttpTokens": "required"
      }
    }
  }]
}
```

📚 [Service Control Policies](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)

---

## 🔟 Automatización y IaC

### Infrastructure as Code

**La infraestructura como código es esencial** para seguridad, consistencia y auditoría.

### ✅ Mejores Prácticas

#### 1. Herramientas Recomendadas
- **Terraform**: Multi-cloud, gran ecosistema
- **AWS CloudFormation**: Nativo de AWS, integración profunda
- **AWS CDK**: Infraestructura con lenguajes de programación

#### 2. Seguridad en IaC

- 📝 **Versiona toda la infraestructura** en Git
- 👀 **Implementa code review** para cambios
- 🔍 **Escanea IaC** con herramientas de seguridad
- 🚫 **Nunca hardcodees secretos** en código
- 🧪 **Prueba en entornos no productivos** primero

#### 3. Herramientas de Escaneo

| Herramienta | Descripción |
|-------------|-------------|
| **Checkov** | Escaneo de Terraform, CloudFormation, Kubernetes |
| **tfsec** | Análisis estático de Terraform |
| **cfn-nag** | Linter para CloudFormation |
| **Terrascan** | Detección de compliance en IaC |

#### Ejemplo: Escanear con Checkov

```bash
# Instalar Checkov
pip install checkov

# Escanear directorio de Terraform
checkov -d ./terraform

# Escanear CloudFormation
checkov -f template.yaml --framework cloudformation

# Ejemplo de salida
Check: CKV_AWS_8: "Ensure all data stored in the Launch configuration EBS is securely encrypted"
FAILED for resource: aws_launch_configuration.example
File: /main.tf:10-25
```

#### Ejemplo: Terraform con Seguridad

```hcl
# Launch Template seguro
resource "aws_launch_template" "secure_template" {
  name_prefix   = "secure-"
  image_id      = data.aws_ami.amazon_linux_2.id
  instance_type = "t3.micro"

  # IMDSv2 obligatorio
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  # Volúmenes cifrados
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      encrypted   = true
      kms_key_id  = aws_kms_key.ebs.arn
      volume_size = 20
      volume_type = "gp3"
    }
  }

  # IAM Role
  iam_instance_profile {
    name = aws_iam_instance_profile.app.name
  }

  # Security Group
  vpc_security_group_ids = [aws_security_group.app.id]

  # Tags
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name               = "secure-instance"
      Environment        = "production"
      Owner              = "team-backend"
      DataClassification = "confidential"
    }
  }

  # User Data sin secretos
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    secret_arn = aws_secretsmanager_secret.app.arn
  }))
}
```

📚 [Terraform AWS Best Practices](https://www.terraform-best-practices.com/)

---

### Automatización de Seguridad

**Respuesta automática a eventos de seguridad**

#### ✅ Patrones de Automatización

**1. Auto-Remediation con EventBridge + Lambda**

```
GuardDuty Finding → EventBridge → Lambda → Remediation Action
```

**Ejemplo: Aislar instancia comprometida**

```python
import boto3

ec2 = boto3.client('ec2')
sns = boto3.client('sns')

def lambda_handler(event, context):
    # Extraer información del evento
    finding_type = event['detail']['type']
    instance_id = event['detail']['resource']['instanceDetails']['instanceId']
    severity = event['detail']['severity']
    
    if severity >= 7:  # High o Critical
        # Crear Security Group de cuarentena
        quarantine_sg = ec2.create_security_group(
            GroupName=f'quarantine-{instance_id}',
            Description='Quarantine SG - No traffic allowed',
            VpcId=get_instance_vpc(instance_id)
        )
        
        # Aplicar a la instancia
        ec2.modify_instance_attribute(
            InstanceId=instance_id,
            Groups=[quarantine_sg['GroupId']]
        )
        
        # Crear snapshot para análisis forense
        volumes = get_instance_volumes(instance_id)
        for volume in volumes:
            ec2.create_snapshot(
                VolumeId=volume,
                Description=f'Forensic snapshot - {finding_type}',
                TagSpecifications=[{
                    'ResourceType': 'snapshot',
                    'Tags': [
                        {'Key': 'Forensic', 'Value': 'true'},
                        {'Key': 'FindingType', 'Value': finding_type}
                    ]
                }]
            )
        
        # Notificar al equipo de seguridad
        sns.publish(
            TopicArn='arn:aws:sns:us-east-1:123456789012:security-incidents',
            Subject=f'CRITICAL: Instance {instance_id} isolated',
            Message=f'''
            Instance {instance_id} has been automatically isolated due to:
            Finding: {finding_type}
            Severity: {severity}
            
            Actions taken:
            - Applied quarantine Security Group
            - Created forensic snapshots
            - Incident ticket created
            
            Please investigate immediately.
            '''
        )
        
        return {
            'statusCode': 200,
            'body': f'Instance {instance_id} isolated successfully'
        }
```

**2. Compliance Automation**

```python
# Lambda para forzar cifrado de volúmenes
def enforce_ebs_encryption(event, context):
    volume_id = event['detail']['requestParameters']['volumeId']
    
    # Verificar si el volumen está cifrado
    volume = ec2.describe_volumes(VolumeIds=[volume_id])['Volumes'][0]
    
    if not volume['Encrypted']:
        # Crear snapshot
        snapshot = ec2.create_snapshot(VolumeId=volume_id)
        
        # Copiar con cifrado
        encrypted_snapshot = ec2.copy_snapshot(
            SourceSnapshotId=snapshot['SnapshotId'],
            Encrypted=True,
            KmsKeyId='arn:aws:kms:us-east-1:123456789012:key/abcd1234'
        )
        
        # Notificar al propietario
        notify_owner(volume, "Volume created without encryption - remediated automatically")
```

📚 [Security Automation on AWS](https://aws.amazon.com/solutions/implementations/automated-security-response-on-aws/)

---

## ✅ Checklist de Lanzamiento

Antes de lanzar una instancia EC2 en producción, verifica:

### Acceso y Autenticación
- [ ] IAM Role asignado con permisos mínimos necesarios
- [ ] Session Manager configurado (sin SSH/RDP expuesto)
- [ ] IMDSv2 habilitado y obligatorio (`HttpTokens: required`)
- [ ] Sin access keys hardcodeadas en la instancia

### Cifrado y Datos
- [ ] Volúmenes EBS cifrados (root y datos)
- [ ] KMS CMK configurada con rotación automática
- [ ] Snapshots automáticos configurados con DLM
- [ ] Backups configurados en AWS Backup

### Red y Conectividad
- [ ] Instancia en subnet privada (si aplica)
- [ ] Security Groups con reglas restrictivas (sin 0.0.0.0/0 en SSH/RDP)
- [ ] VPC Flow Logs habilitados
- [ ] Network ACLs configuradas (si aplica)

### Monitoreo y Logging
- [ ] CloudWatch Agent instalado (métricas de SO)
- [ ] CloudWatch Logs configurado
- [ ] Alarmas de CloudWatch activas (CPU, red, disco)
- [ ] CloudTrail habilitado en la región

### Seguridad y Compliance
- [ ] GuardDuty habilitado en la cuenta
- [ ] Inspector escaneando la instancia
- [ ] AWS Config rules aplicadas
- [ ] Tags obligatorios aplicados según política

### Sistema Operativo
- [ ] AMI actualizada y escaneada
- [ ] Hardening del SO aplicado
- [ ] Firewall local configurado
- [ ] Fail2ban o similar instalado (Linux)
- [ ] Agentes de seguridad instalados

### Gestión y Operaciones
- [ ] Patch Manager configurado
- [ ] Systems Manager Inventory habilitado
- [ ] Documentación actualizada (runbooks)
- [ ] Plan de DR documentado y probado

### Automatización
- [ ] Infraestructura definida como código (Terraform/CloudFormation)
- [ ] IaC escaneado con herramientas de seguridad
- [ ] Auto-remediation configurada para hallazgos críticos
- [ ] Respuestas automáticas a eventos de seguridad

---

## 📊 Roadmap de Implementación

### Fase 1: Fundamentos (Semana 1-2)
**Prioridad: CRÍTICA**

- [ ] Habilitar cifrado EBS por defecto
- [ ] Configurar IAM Roles para todas las instancias
- [ ] Implementar Session Manager
- [ ] Habilitar GuardDuty
- [ ] Habilitar AWS Config
- [ ] Configurar CloudWatch Logs
- [ ] Habilitar VPC Flow Logs

**Tiempo estimado**: 8-16 horas  
**Costo estimado**: $50-200/mes

### Fase 2: Hardening (Semana 3-4)
**Prioridad: ALTA**

- [ ] Migrar a IMDSv2 en todas las instancias
- [ ] Implementar Security Groups restrictivos
- [ ] Configurar AWS Backup
- [ ] Implementar Inspector
- [ ] Hardening de AMIs base
- [ ] Configurar Patch Manager
- [ ] Implementar estrategia de tagging

**Tiempo estimado**: 16-24 horas  
**Costo estimado**: $100-300/mes adicionales

### Fase 3: Automatización (Mes 2)
**Prioridad: MEDIA**

- [ ] Migrar infraestructura a IaC
- [ ] Implementar auto-remediation
- [ ] Configurar respuestas automáticas a GuardDuty
- [ ] Implementar CI/CD para IaC
- [ ] Escaneo automático de AMIs
- [ ] Automatizar compliance checks

**Tiempo estimado**: 24-40 horas  
**Costo estimado**: $50-150/mes adicionales

### Fase 4: Optimización (Mes 3+)
**Prioridad: BAJA**

- [ ] Implementar WAF (si aplica)
- [ ] Configurar AWS Shield Advanced (si aplica)
- [ ] Implementar estrategia multi-región
- [ ] Optimizar costos de seguridad
- [ ] Capacitación del equipo
- [ ] Simulacros de DR (GameDays)

**Tiempo estimado**: Continuo  
**Costo estimado**: Variable

---

## 📚 Recursos Adicionales

### Documentación Oficial de AWS
- [EC2 Security Best Practices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security.html)
- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)
- [AWS Well-Architected Framework - Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)

### Benchmarks y Estándares
- [CIS Amazon Web Services Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services)
- [CIS Amazon Linux 2 Benchmark](https://www.cisecurity.org/benchmark/amazon_linux)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

### Herramientas
- [Prowler](https://github.com/prowler-cloud/prowler) - Security assessment tool
- [ScoutSuite](https://github.com/nccgroup/ScoutSuite) - Multi-cloud security auditing
- [CloudMapper](https://github.com/duo-labs/cloudmapper) - AWS environment visualization
- [Steampipe](https://steampipe.io/) - SQL queries for cloud resources

### Formación
- [AWS Security Fundamentals](https://aws.amazon.com/training/course-descriptions/security-fundamentals/)
- [AWS Security Engineering](https://aws.amazon.com/training/classroom/aws-security-engineering/)
- [AWS Certified Security - Specialty](https://aws.amazon.com/certification/certified-security-specialty/)

---

## 📝 Notas Finales

Esta guía proporciona una base sólida para asegurar instancias EC2 en producción. Recuerde que:

- 🔄 **La seguridad es un proceso continuo**, no un estado final
- 📊 **Monitoree y revise** hallazgos de seguridad regularmente
- 🎓 **Capacite a su equipo** en mejores prácticas de seguridad
- 🧪 **Pruebe sus controles** con simulacros y ejercicios
- 📋 **Documente todo** - procedimientos, excepciones, incidentes
- 🤝 **Colabore** con equipos de seguridad y compliance

**La seguridad es responsabilidad de todos.**

---

**Versión**: 1.0  
**Última actualización**: Febrero 2026  
**Próxima revisión**: Mayo 2026

---

*Este documento es una guía de referencia. Para implementación técnica detallada, consulte con nuestro equipo de arquitectos.*
