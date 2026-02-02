---
sidebar_label: "Estrategia de Tagging"
sidebar_position: 3
---

<div align="center">

# 🏷️ Estrategia de Tagging en AWS

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Tags](https://img.shields.io/badge/Tags-0052CC?style=for-the-badge&logo=tags&logoColor=white)

</div>

## 📋 Introducción

El tagging (etiquetado) es una práctica fundamental en AWS que permite **organizar, gestionar y controlar costos** de recursos en la nube. Los tags son pares clave-valor que se asignan a recursos de AWS.

**Objetivo**: Implementar una estrategia de tagging consistente que facilite la gestión, seguridad, automatización y optimización de costos.

---

## 1️⃣ ¿Qué son los Tags?

### Definición

Los tags son **metadatos** que se asignan a recursos de AWS en forma de pares clave-valor:

```
Clave: Environment
Valor: production

Clave: Owner
Valor: team-backend

Clave: CostCenter
Valor: engineering
```

### Beneficios del Tagging

#### 1. Gestión de Costos 💰

- **Asignación de costos** por departamento, proyecto o equipo
- **Identificación de recursos** que generan más gastos
- **Presupuestos y alertas** basados en tags
- **Optimización** de recursos no utilizados

#### 2. Organización y Búsqueda 🔍

- **Filtrado rápido** de recursos en la consola
- **Agrupación lógica** de recursos relacionados
- **Inventario** de recursos por categoría
- **Documentación** automática de infraestructura

#### 3. Automatización 🤖

- **Políticas de backup** basadas en tags
- **Programación de encendido/apagado** de instancias
- **Aplicación de parches** por grupos
- **Respuestas automáticas** a eventos

#### 4. Seguridad y Compliance 🔒

- **Control de acceso** basado en tags (ABAC)
- **Auditoría** de recursos por clasificación de datos
- **Cumplimiento** de políticas corporativas
- **Segregación** de entornos

#### 5. Operaciones 🛠️

- **Identificación de propietarios** de recursos
- **Gestión del ciclo de vida** de recursos
- **Troubleshooting** más rápido
- **Documentación** de dependencias

### Limitaciones de Tags

| Límite | Valor |
|--------|-------|
| **Tags por recurso** | 50 |
| **Longitud de clave** | 128 caracteres |
| **Longitud de valor** | 256 caracteres |
| **Caracteres permitidos** | Letras, números, espacios, `+ - = . _ : / @` |
| **Case sensitive** | Sí (distingue mayúsculas/minúsculas) |

📚 [Tagging AWS Resources](https://docs.aws.amazon.com/general/latest/gr/aws_tagging.html)

---

## 2️⃣ Estrategia de Tagging

### Tags Obligatorios (Mandatory)

Estos tags **deben aplicarse a todos los recursos** sin excepción:

#### 1. Environment (Entorno)

**Propósito**: Identificar el entorno de ejecución

```
Clave: Environment
Valores permitidos: production | staging | development | testing | sandbox
```

**Ejemplos:**
```
Environment: production
Environment: staging
Environment: development
```

**Uso:**
- Segregación de recursos por entorno
- Políticas de seguridad diferenciadas
- Presupuestos por entorno
- Automatización de backups

---

#### 2. Owner (Propietario)

**Propósito**: Identificar el equipo o persona responsable

```
Clave: Owner
Valores: Nombre del equipo o email
```

**Ejemplos:**
```
Owner: team-backend
Owner: team-frontend
Owner: team-data
Owner: john.doe@company.com
```

**Uso:**
- Contacto para incidentes
- Asignación de responsabilidades
- Auditoría de recursos
- Notificaciones automáticas

---

#### 3. Application (Aplicación)

**Propósito**: Identificar la aplicación o servicio

```
Clave: Application
Valores: Nombre de la aplicación
```

**Ejemplos:**
```
Application: webapp
Application: api-gateway
Application: data-pipeline
Application: mobile-backend
```

**Uso:**
- Agrupación de recursos relacionados
- Análisis de costos por aplicación
- Gestión de dependencias
- Troubleshooting

---

#### 4. CostCenter (Centro de Costos)

**Propósito**: Asignar costos a departamentos o proyectos

```
Clave: CostCenter
Valores: Código de centro de costos
```

**Ejemplos:**
```
CostCenter: engineering
CostCenter: marketing
CostCenter: sales
CostCenter: CC-1234
```

**Uso:**
- Facturación interna
- Reportes financieros
- Presupuestos departamentales
- Chargeback/Showback

---

#### 5. Project (Proyecto)

**Propósito**: Identificar el proyecto específico

```
Clave: Project
Valores: Nombre o código del proyecto
```

**Ejemplos:**
```
Project: migration-2024
Project: mobile-app-v2
Project: data-lake
Project: PRJ-5678
```

**Uso:**
- Seguimiento de costos por proyecto
- Recursos temporales
- Gestión de ciclo de vida
- Reportes de progreso

---

### Tags Recomendados (Recommended)

Estos tags son **altamente recomendados** para mejorar la gestión:

#### 6. Name (Nombre)

**Propósito**: Nombre descriptivo del recurso

```
Clave: Name
Valores: Nombre legible del recurso
```

**Ejemplos:**
```
Name: prod-web-server-01
Name: staging-database-mysql
Name: dev-cache-redis
```

---

#### 7. DataClassification (Clasificación de Datos)

**Propósito**: Nivel de sensibilidad de los datos

```
Clave: DataClassification
Valores: public | internal | confidential | restricted
```

**Ejemplos:**
```
DataClassification: public
DataClassification: confidential
DataClassification: restricted
```

**Uso:**
- Políticas de seguridad
- Cifrado obligatorio
- Control de acceso
- Compliance (GDPR, HIPAA)

---

#### 8. Compliance (Cumplimiento)

**Propósito**: Requisitos regulatorios aplicables

```
Clave: Compliance
Valores: Estándares de compliance
```

**Ejemplos:**
```
Compliance: pci-dss
Compliance: hipaa
Compliance: sox
Compliance: gdpr
```

**Uso:**
- Auditorías de compliance
- Configuraciones específicas
- Reportes regulatorios
- Segregación de datos

---

#### 9. BackupPolicy (Política de Backup)

**Propósito**: Frecuencia y retención de backups

```
Clave: BackupPolicy
Valores: daily | weekly | monthly | none
```

**Ejemplos:**
```
BackupPolicy: daily
BackupPolicy: weekly
BackupPolicy: none
```

**Uso:**
- Automatización de backups
- AWS Backup policies
- Retención de datos
- Optimización de costos

---

#### 10. PatchGroup (Grupo de Parches)

**Propósito**: Programación de actualizaciones

```
Clave: PatchGroup
Valores: critical | standard | manual
```

**Ejemplos:**
```
PatchGroup: critical
PatchGroup: standard
PatchGroup: manual
```

**Uso:**
- AWS Systems Manager Patch Manager
- Ventanas de mantenimiento
- Priorización de parches
- Minimizar downtime

---

### Tags Opcionales (Optional)

Estos tags son útiles según el contexto:

| Tag | Propósito | Ejemplo |
|-----|-----------|---------|
| **Version** | Versión de la aplicación | `Version: 2.1.0` |
| **CreatedBy** | Quién creó el recurso | `CreatedBy: terraform` |
| **CreatedDate** | Fecha de creación | `CreatedDate: 2024-02-01` |
| **ExpirationDate** | Fecha de expiración | `ExpirationDate: 2024-12-31` |
| **Schedule** | Horario de operación | `Schedule: 24x7` o `Schedule: business-hours` |
| **Criticality** | Criticidad del recurso | `Criticality: high` |
| **SLA** | Nivel de servicio | `SLA: 99.9` |
| **Monitoring** | Nivel de monitoreo | `Monitoring: enhanced` |
| **AutoShutdown** | Apagado automático | `AutoShutdown: true` |
| **Contact** | Email de contacto | `Contact: ops@company.com` |

---

## 3️⃣ Nomenclatura y Convenciones

### Convenciones de Nombres

#### ✅ Buenas Prácticas

```
✅ PascalCase para claves: Environment, CostCenter, DataClassification
✅ lowercase-kebab-case para valores: production, team-backend
✅ Nombres descriptivos: Application en lugar de App
✅ Consistencia: Siempre usar el mismo formato
```

#### ❌ Malas Prácticas

```
❌ Mezclar formatos: environment, Cost_Center, data-classification
❌ Abreviaciones confusas: Env, CC, DC
❌ Espacios innecesarios: " production ", "team backend "
❌ Caracteres especiales: environment!, cost$center
```

### Ejemplos de Nomenclatura

**Instancia EC2 de Producción:**
```json
{
  "Name": "prod-web-server-01",
  "Environment": "production",
  "Owner": "team-backend",
  "Application": "webapp",
  "CostCenter": "engineering",
  "Project": "ecommerce-platform",
  "DataClassification": "confidential",
  "BackupPolicy": "daily",
  "PatchGroup": "critical",
  "Compliance": "pci-dss"
}
```

**Base de Datos RDS de Desarrollo:**
```json
{
  "Name": "dev-mysql-db",
  "Environment": "development",
  "Owner": "team-data",
  "Application": "analytics",
  "CostCenter": "engineering",
  "Project": "data-warehouse",
  "DataClassification": "internal",
  "BackupPolicy": "weekly",
  "PatchGroup": "standard",
  "AutoShutdown": "true"
}
```

**Bucket S3 para Logs:**
```json
{
  "Name": "prod-logs-bucket",
  "Environment": "production",
  "Owner": "team-platform",
  "Application": "logging",
  "CostCenter": "infrastructure",
  "DataClassification": "internal",
  "Compliance": "sox",
  "ExpirationDate": "2025-12-31"
}
```

📚 [Tagging Best Practices](https://docs.aws.amazon.com/whitepapers/latest/tagging-best-practices/tagging-best-practices.html)

---

## 4️⃣ Implementación de Tags

### Aplicar Tags Manualmente

#### AWS Console

**Paso 1: Navegar al recurso**
1. Ir a la consola del servicio (EC2, RDS, S3, etc.)
2. Seleccionar el recurso
3. Click en la pestaña "Tags"
4. Click en "Manage tags"

**Paso 2: Agregar tags**
1. Click en "Add tag"
2. Ingresar clave y valor
3. Repetir para cada tag
4. Click en "Save"

---

#### AWS CLI

**Etiquetar instancia EC2:**
```bash
aws ec2 create-tags \
  --resources i-1234567890abcdef0 \
  --tags \
    Key=Environment,Value=production \
    Key=Owner,Value=team-backend \
    Key=Application,Value=webapp \
    Key=CostCenter,Value=engineering \
    Key=Project,Value=ecommerce
```

**Etiquetar múltiples recursos:**
```bash
aws ec2 create-tags \
  --resources i-1234567890abcdef0 i-0987654321fedcba0 vol-1234567890abcdef0 \
  --tags Key=Environment,Value=production
```

**Etiquetar bucket S3:**
```bash
aws s3api put-bucket-tagging \
  --bucket my-bucket \
  --tagging 'TagSet=[
    {Key=Environment,Value=production},
    {Key=Owner,Value=team-data},
    {Key=Application,Value=data-lake}
  ]'
```

**Etiquetar base de datos RDS:**
```bash
aws rds add-tags-to-resource \
  --resource-name arn:aws:rds:us-east-1:123456789012:db:prod-mysql-db \
  --tags \
    Key=Environment,Value=production \
    Key=Owner,Value=team-backend \
    Key=BackupPolicy,Value=daily
```

---

### Terraform

#### Configuración Global de Tags

```hcl
# variables.tf
variable "common_tags" {
  description = "Tags comunes para todos los recursos"
  type        = map(string)
  default = {
    ManagedBy   = "terraform"
    Environment = "production"
    Project     = "ecommerce-platform"
    CostCenter  = "engineering"
  }
}

# main.tf
provider "aws" {
  region = "us-east-1"
  
  default_tags {
    tags = var.common_tags
  }
}
```

#### Tags en Recursos Específicos

```hcl
# EC2 Instance
resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t3.medium"
  
  tags = merge(
    var.common_tags,
    {
      Name                = "prod-web-server-01"
      Owner               = "team-backend"
      Application         = "webapp"
      DataClassification  = "confidential"
      BackupPolicy        = "daily"
      PatchGroup          = "critical"
    }
  )
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier     = "prod-mysql-db"
  engine         = "mysql"
  instance_class = "db.t3.medium"
  
  tags = merge(
    var.common_tags,
    {
      Name               = "prod-mysql-db"
      Owner              = "team-data"
      Application        = "analytics"
      DataClassification = "restricted"
      BackupPolicy       = "daily"
      Compliance         = "pci-dss"
    }
  )
}

# S3 Bucket
resource "aws_s3_bucket" "logs" {
  bucket = "prod-logs-bucket"
  
  tags = merge(
    var.common_tags,
    {
      Name               = "prod-logs-bucket"
      Owner              = "team-platform"
      Application        = "logging"
      DataClassification = "internal"
    }
  )
}

# VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = merge(
    var.common_tags,
    {
      Name  = "prod-vpc"
      Owner = "team-platform"
    }
  )
}
```

#### Tags Dinámicos

```hcl
# Generar tags automáticamente
locals {
  timestamp = formatdate("YYYY-MM-DD", timestamp())
  
  resource_tags = {
    Name        = "${var.environment}-${var.application}-${var.resource_type}"
    Environment = var.environment
    Owner       = var.owner
    Application = var.application
    CostCenter  = var.cost_center
    CreatedDate = local.timestamp
    CreatedBy   = "terraform"
  }
}

resource "aws_instance" "app" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  tags = local.resource_tags
}
```

---

### CloudFormation

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Ejemplo de recursos con tags'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues:
      - production
      - staging
      - development
  
  Owner:
    Type: String
    Default: team-backend
  
  Application:
    Type: String
    Default: webapp

Resources:
  WebServer:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !Ref LatestAmiId
      InstanceType: t3.medium
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-web-server'
        - Key: Environment
          Value: !Ref Environment
        - Key: Owner
          Value: !Ref Owner
        - Key: Application
          Value: !Ref Application
        - Key: CostCenter
          Value: engineering
        - Key: Project
          Value: ecommerce-platform
        - Key: BackupPolicy
          Value: daily
        - Key: PatchGroup
          Value: critical
  
  Database:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: !Sub '${Environment}-mysql-db'
      Engine: mysql
      DBInstanceClass: db.t3.medium
      Tags:
        - Key: Name
          Value: !Sub '${Environment}-mysql-db'
        - Key: Environment
          Value: !Ref Environment
        - Key: Owner
          Value: team-data
        - Key: Application
          Value: analytics
        - Key: DataClassification
          Value: restricted
        - Key: BackupPolicy
          Value: daily
```

---

### AWS CDK (Python)

```python
from aws_cdk import (
    Stack,
    Tags,
    aws_ec2 as ec2,
    aws_rds as rds,
    aws_s3 as s3
)
from constructs import Construct

class InfrastructureStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        
        # Tags comunes para todo el stack
        Tags.of(self).add("Environment", "production")
        Tags.of(self).add("Project", "ecommerce-platform")
        Tags.of(self).add("CostCenter", "engineering")
        Tags.of(self).add("ManagedBy", "cdk")
        
        # VPC
        vpc = ec2.Vpc(self, "MainVPC",
            cidr="10.0.0.0/16",
            max_azs=2
        )
        Tags.of(vpc).add("Name", "prod-vpc")
        Tags.of(vpc).add("Owner", "team-platform")
        
        # EC2 Instance
        instance = ec2.Instance(self, "WebServer",
            instance_type=ec2.InstanceType("t3.medium"),
            machine_image=ec2.MachineImage.latest_amazon_linux2(),
            vpc=vpc
        )
        Tags.of(instance).add("Name", "prod-web-server-01")
        Tags.of(instance).add("Owner", "team-backend")
        Tags.of(instance).add("Application", "webapp")
        Tags.of(instance).add("DataClassification", "confidential")
        Tags.of(instance).add("BackupPolicy", "daily")
        Tags.of(instance).add("PatchGroup", "critical")
        
        # S3 Bucket
        bucket = s3.Bucket(self, "LogsBucket",
            bucket_name="prod-logs-bucket"
        )
        Tags.of(bucket).add("Name", "prod-logs-bucket")
        Tags.of(bucket).add("Owner", "team-platform")
        Tags.of(bucket).add("Application", "logging")
        Tags.of(bucket).add("DataClassification", "internal")
```

📚 [Terraform AWS Provider - Tags](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/guides/resource-tagging)

---

## 5️⃣ Automatización de Tagging

### Tag Policies (AWS Organizations)

**¿Qué son?**

Las Tag Policies permiten **estandarizar tags** en toda la organización, definiendo:
- Tags obligatorios
- Valores permitidos
- Formato de valores
- Capitalización

#### Ejemplo de Tag Policy

```json
{
  "tags": {
    "Environment": {
      "tag_key": {
        "@@assign": "Environment",
        "@@operators_allowed_for_child_policies": ["@@none"]
      },
      "tag_value": {
        "@@assign": [
          "production",
          "staging",
          "development",
          "testing"
        ]
      },
      "enforced_for": {
        "@@assign": [
          "ec2:instance",
          "ec2:volume",
          "rds:db",
          "s3:bucket"
        ]
      }
    },
    "Owner": {
      "tag_key": {
        "@@assign": "Owner"
      },
      "tag_value": {
        "@@assign": [
          "team-backend",
          "team-frontend",
          "team-data",
          "team-platform"
        ]
      },
      "enforced_for": {
        "@@assign": [
          "ec2:*",
          "rds:*",
          "s3:*"
        ]
      }
    },
    "CostCenter": {
      "tag_key": {
        "@@assign": "CostCenter"
      },
      "tag_value": {
        "@@assign": [
          "engineering",
          "marketing",
          "sales",
          "operations"
        ]
      },
      "enforced_for": {
        "@@assign": ["*"]
      }
    }
  }
}
```

#### Aplicar Tag Policy

```bash
# Crear tag policy
aws organizations create-policy \
  --content file://tag-policy.json \
  --description "Política de tags obligatorios" \
  --name "mandatory-tags-policy" \
  --type TAG_POLICY

# Adjuntar a OU
aws organizations attach-policy \
  --policy-id p-12345678 \
  --target-id ou-abcd-12345678
```

---

### Service Control Policies (SCPs)

**Forzar tags en la creación de recursos:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyEC2WithoutRequiredTags",
      "Effect": "Deny",
      "Action": [
        "ec2:RunInstances",
        "ec2:CreateVolume"
      ],
      "Resource": [
        "arn:aws:ec2:*:*:instance/*",
        "arn:aws:ec2:*:*:volume/*"
      ],
      "Condition": {
        "StringNotLike": {
          "aws:RequestTag/Environment": [
            "production",
            "staging",
            "development"
          ]
        }
      }
    },
    {
      "Sid": "RequireOwnerTag",
      "Effect": "Deny",
      "Action": [
        "ec2:RunInstances",
        "rds:CreateDBInstance",
        "s3:CreateBucket"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotLike": {
          "aws:RequestTag/Owner": "*"
        }
      }
    },
    {
      "Sid": "RequireCostCenterTag",
      "Effect": "Deny",
      "Action": [
        "ec2:RunInstances",
        "rds:CreateDBInstance"
      ],
      "Resource": "*",
      "Condition": {
        "Null": {
          "aws:RequestTag/CostCenter": "true"
        }
      }
    }
  ]
}
```

---

### Lambda para Auto-Tagging

```python
"""
Lambda function para aplicar tags automáticamente a recursos nuevos
"""
import json
import boto3
from datetime import datetime

ec2 = boto3.client('ec2')
rds = boto3.client('rds')
s3 = boto3.client('s3')

def lambda_handler(event, context):
    """
    Procesa eventos de CloudTrail y aplica tags automáticos
    """
    print(f"Evento recibido: {json.dumps(event)}")
    
    # Parsear evento de CloudTrail
    detail = event['detail']
    event_name = detail['eventName']
    user_identity = detail['userIdentity']
    
    # Tags automáticos
    auto_tags = {
        'CreatedBy': user_identity.get('principalId', 'unknown'),
        'CreatedDate': datetime.now().strftime('%Y-%m-%d'),
        'ManagedBy': 'auto-tagging-lambda'
    }
    
    # Procesar según el tipo de evento
    if event_name == 'RunInstances':
        handle_ec2_instance(detail, auto_tags)
    elif event_name == 'CreateDBInstance':
        handle_rds_instance(detail, auto_tags)
    elif event_name == 'CreateBucket':
        handle_s3_bucket(detail, auto_tags)
    
    return {
        'statusCode': 200,
        'body': json.dumps('Tags aplicados exitosamente')
    }

def handle_ec2_instance(detail, auto_tags):
    """Aplica tags a instancias EC2"""
    try:
        # Extraer IDs de instancias
        instances = detail['responseElements']['instancesSet']['items']
        instance_ids = [instance['instanceId'] for instance in instances]
        
        # Aplicar tags
        tags = [{'Key': k, 'Value': v} for k, v in auto_tags.items()]
        
        ec2.create_tags(
            Resources=instance_ids,
            Tags=tags
        )
        
        print(f"Tags aplicados a instancias: {instance_ids}")
        
    except Exception as e:
        print(f"Error aplicando tags a EC2: {str(e)}")

def handle_rds_instance(detail, auto_tags):
    """Aplica tags a instancias RDS"""
    try:
        db_instance_arn = detail['responseElements']['dBInstanceArn']
        
        tags = [{'Key': k, 'Value': v} for k, v in auto_tags.items()]
        
        rds.add_tags_to_resource(
            ResourceName=db_instance_arn,
            Tags=tags
        )
        
        print(f"Tags aplicados a RDS: {db_instance_arn}")
        
    except Exception as e:
        print(f"Error aplicando tags a RDS: {str(e)}")

def handle_s3_bucket(detail, auto_tags):
    """Aplica tags a buckets S3"""
    try:
        bucket_name = detail['requestParameters']['bucketName']
        
        # Obtener tags existentes
        try:
            existing_tags = s3.get_bucket_tagging(Bucket=bucket_name)
            tag_set = existing_tags['TagSet']
        except:
            tag_set = []
        
        # Agregar nuevos tags
        for key, value in auto_tags.items():
            tag_set.append({'Key': key, 'Value': value})
        
        s3.put_bucket_tagging(
            Bucket=bucket_name,
            Tagging={'TagSet': tag_set}
        )
        
        print(f"Tags aplicados a S3: {bucket_name}")
        
    except Exception as e:
        print(f"Error aplicando tags a S3: {str(e)}")
```

#### EventBridge Rule para Lambda

```json
{
  "source": ["aws.ec2", "aws.rds", "aws.s3"],
  "detail-type": ["AWS API Call via CloudTrail"],
  "detail": {
    "eventName": [
      "RunInstances",
      "CreateDBInstance",
      "CreateBucket"
    ]
  }
}
```

---

### AWS Config Rules para Validación

```python
"""
AWS Config Rule para validar tags obligatorios
"""
import json
import boto3

config = boto3.client('config')

REQUIRED_TAGS = [
    'Environment',
    'Owner',
    'Application',
    'CostCenter',
    'Project'
]

def lambda_handler(event, context):
    """
    Evalúa si un recurso tiene todos los tags obligatorios
    """
    invoking_event = json.loads(event['invokingEvent'])
    configuration_item = invoking_event['configurationItem']
    
    resource_type = configuration_item['resourceType']
    resource_id = configuration_item['resourceId']
    tags = configuration_item.get('tags', {})
    
    # Verificar tags obligatorios
    missing_tags = []
    for required_tag in REQUIRED_TAGS:
        if required_tag not in tags:
            missing_tags.append(required_tag)
    
    # Determinar compliance
    if missing_tags:
        compliance_type = 'NON_COMPLIANT'
        annotation = f"Faltan tags obligatorios: {', '.join(missing_tags)}"
    else:
        compliance_type = 'COMPLIANT'
        annotation = "Todos los tags obligatorios están presentes"
    
    # Reportar resultado
    config.put_evaluations(
        Evaluations=[
            {
                'ComplianceResourceType': resource_type,
                'ComplianceResourceId': resource_id,
                'ComplianceType': compliance_type,
                'Annotation': annotation,
                'OrderingTimestamp': configuration_item['configurationItemCaptureTime']
            }
        ],
        ResultToken=event['resultToken']
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps(f'Evaluación completada: {compliance_type}')
    }
```

📚 [AWS Config Rules](https://docs.aws.amazon.com/config/latest/developerguide/evaluate-config.html)

---

## 6️⃣ Gestión de Costos con Tags

### Cost Allocation Tags

**Activar tags para facturación:**

1. Ir a **AWS Billing Console**
2. Navegar a **Cost Allocation Tags**
3. Seleccionar tags a activar
4. Click en **Activate**

**Nota**: Los tags tardan hasta 24 horas en aparecer en los reportes de costos.

```bash
# Activar tags via CLI
aws ce update-cost-allocation-tags-status \
  --cost-allocation-tags-status \
    TagKey=Environment,Status=Active \
    TagKey=Owner,Status=Active \
    TagKey=Application,Status=Active \
    TagKey=CostCenter,Status=Active \
    TagKey=Project,Status=Active
```

---

### Cost Explorer con Tags

#### Filtrar Costos por Tag

```python
"""
Script para obtener costos por tag usando Cost Explorer API
"""
import boto3
from datetime import datetime, timedelta

ce = boto3.client('ce')

def get_costs_by_tag(tag_key, start_date, end_date):
    """
    Obtiene costos agrupados por un tag específico
    """
    response = ce.get_cost_and_usage(
        TimePeriod={
            'Start': start_date,
            'End': end_date
        },
        Granularity='MONTHLY',
        Metrics=['UnblendedCost'],
        GroupBy=[
            {
                'Type': 'TAG',
                'Key': tag_key
            }
        ]
    )
    
    return response['ResultsByTime']

# Ejemplo: Costos por Environment
start = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
end = datetime.now().strftime('%Y-%m-%d')

costs = get_costs_by_tag('Environment', start, end)

print("Costos por Environment:")
for result in costs:
    period = result['TimePeriod']
    print(f"\nPeríodo: {period['Start']} - {period['End']}")
    
    for group in result['Groups']:
        tag_value = group['Keys'][0].split('$')[1]
        amount = group['Metrics']['UnblendedCost']['Amount']
        print(f"  {tag_value}: ${float(amount):.2f}")
```

#### Reporte de Costos por Múltiples Tags

```python
"""
Reporte detallado de costos por múltiples dimensiones
"""
import boto3
import pandas as pd
from datetime import datetime, timedelta

ce = boto3.client('ce')

def get_detailed_cost_report(start_date, end_date):
    """
    Genera reporte de costos con múltiples tags
    """
    response = ce.get_cost_and_usage(
        TimePeriod={
            'Start': start_date,
            'End': end_date
        },
        Granularity='DAILY',
        Metrics=['UnblendedCost', 'UsageQuantity'],
        GroupBy=[
            {'Type': 'TAG', 'Key': 'Environment'},
            {'Type': 'TAG', 'Key': 'Application'},
            {'Type': 'TAG', 'Key': 'CostCenter'}
        ],
        Filter={
            'Tags': {
                'Key': 'Environment',
                'Values': ['production', 'staging', 'development']
            }
        }
    )
    
    # Procesar resultados
    data = []
    for result in response['ResultsByTime']:
        date = result['TimePeriod']['Start']
        
        for group in result['Groups']:
            keys = group['Keys']
            environment = keys[0].split('$')[1] if len(keys) > 0 else 'N/A'
            application = keys[1].split('$')[1] if len(keys) > 1 else 'N/A'
            cost_center = keys[2].split('$')[1] if len(keys) > 2 else 'N/A'
            
            cost = float(group['Metrics']['UnblendedCost']['Amount'])
            
            data.append({
                'Date': date,
                'Environment': environment,
                'Application': application,
                'CostCenter': cost_center,
                'Cost': cost
            })
    
    # Crear DataFrame
    df = pd.DataFrame(data)
    
    # Análisis
    print("=== Resumen de Costos ===\n")
    
    print("Por Environment:")
    print(df.groupby('Environment')['Cost'].sum().sort_values(ascending=False))
    print()
    
    print("Por Application:")
    print(df.groupby('Application')['Cost'].sum().sort_values(ascending=False))
    print()
    
    print("Por CostCenter:")
    print(df.groupby('CostCenter')['Cost'].sum().sort_values(ascending=False))
    print()
    
    # Top 10 combinaciones más costosas
    print("Top 10 Combinaciones más Costosas:")
    top_combinations = df.groupby(['Environment', 'Application', 'CostCenter'])['Cost'].sum()
    print(top_combinations.sort_values(ascending=False).head(10))
    
    return df

# Ejecutar reporte
start = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
end = datetime.now().strftime('%Y-%m-%d')

df = get_detailed_cost_report(start, end)

# Exportar a CSV
df.to_csv('cost_report.csv', index=False)
print("\nReporte exportado a cost_report.csv")
```

---

### Presupuestos con Tags

```python
"""
Crear presupuestos basados en tags
"""
import boto3

budgets = boto3.client('budgets')

def create_budget_by_tag(account_id, budget_name, tag_key, tag_value, amount):
    """
    Crea un presupuesto para recursos con un tag específico
    """
    response = budgets.create_budget(
        AccountId=account_id,
        Budget={
            'BudgetName': budget_name,
            'BudgetLimit': {
                'Amount': str(amount),
                'Unit': 'USD'
            },
            'TimeUnit': 'MONTHLY',
            'BudgetType': 'COST',
            'CostFilters': {
                f'tag:{tag_key}': [tag_value]
            }
        },
        NotificationsWithSubscribers=[
            {
                'Notification': {
                    'NotificationType': 'ACTUAL',
                    'ComparisonOperator': 'GREATER_THAN',
                    'Threshold': 80,
                    'ThresholdType': 'PERCENTAGE'
                },
                'Subscribers': [
                    {
                        'SubscriptionType': 'EMAIL',
                        'Address': 'finance@company.com'
                    }
                ]
            },
            {
                'Notification': {
                    'NotificationType': 'FORECASTED',
                    'ComparisonOperator': 'GREATER_THAN',
                    'Threshold': 100,
                    'ThresholdType': 'PERCENTAGE'
                },
                'Subscribers': [
                    {
                        'SubscriptionType': 'EMAIL',
                        'Address': 'finance@company.com'
                    }
                ]
            }
        ]
    )
    
    print(f"Presupuesto creado: {budget_name}")
    return response

# Ejemplos
account_id = '123456789012'

# Presupuesto por Environment
create_budget_by_tag(
    account_id=account_id,
    budget_name='Production-Environment-Budget',
    tag_key='Environment',
    tag_value='production',
    amount=10000
)

# Presupuesto por Application
create_budget_by_tag(
    account_id=account_id,
    budget_name='WebApp-Budget',
    tag_key='Application',
    tag_value='webapp',
    amount=5000
)

# Presupuesto por CostCenter
create_budget_by_tag(
    account_id=account_id,
    budget_name='Engineering-Budget',
    tag_key='CostCenter',
    tag_value='engineering',
    amount=20000
)
```

---

### Optimización de Costos

#### Identificar Recursos Sin Tags

```python
"""
Script para identificar recursos sin tags obligatorios
"""
import boto3
from collections import defaultdict

ec2 = boto3.client('ec2')
rds = boto3.client('rds')
s3 = boto3.client('s3')

REQUIRED_TAGS = ['Environment', 'Owner', 'Application', 'CostCenter']

def check_ec2_instances():
    """Verifica tags en instancias EC2"""
    print("=== Instancias EC2 ===")
    
    response = ec2.describe_instances()
    
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instance_id = instance['InstanceId']
            tags = {tag['Key']: tag['Value'] for tag in instance.get('Tags', [])}
            
            missing_tags = [tag for tag in REQUIRED_TAGS if tag not in tags]
            
            if missing_tags:
                print(f"❌ {instance_id}: Faltan tags: {', '.join(missing_tags)}")
            else:
                print(f"✅ {instance_id}: Todos los tags presentes")

def check_rds_instances():
    """Verifica tags en instancias RDS"""
    print("\n=== Instancias RDS ===")
    
    response = rds.describe_db_instances()
    
    for db_instance in response['DBInstances']:
        db_id = db_instance['DBInstanceIdentifier']
        arn = db_instance['DBInstanceArn']
        
        tags_response = rds.list_tags_for_resource(ResourceName=arn)
        tags = {tag['Key']: tag['Value'] for tag in tags_response['TagList']}
        
        missing_tags = [tag for tag in REQUIRED_TAGS if tag not in tags]
        
        if missing_tags:
            print(f"❌ {db_id}: Faltan tags: {', '.join(missing_tags)}")
        else:
            print(f"✅ {db_id}: Todos los tags presentes")

def check_s3_buckets():
    """Verifica tags en buckets S3"""
    print("\n=== Buckets S3 ===")
    
    response = s3.list_buckets()
    
    for bucket in response['Buckets']:
        bucket_name = bucket['Name']
        
        try:
            tags_response = s3.get_bucket_tagging(Bucket=bucket_name)
            tags = {tag['Key']: tag['Value'] for tag in tags_response['TagSet']}
        except:
            tags = {}
        
        missing_tags = [tag for tag in REQUIRED_TAGS if tag not in tags]
        
        if missing_tags:
            print(f"❌ {bucket_name}: Faltan tags: {', '.join(missing_tags)}")
        else:
            print(f"✅ {bucket_name}: Todos los tags presentes")

# Ejecutar verificaciones
check_ec2_instances()
check_rds_instances()
check_s3_buckets()
```

#### Recursos No Utilizados por Tag

```python
"""
Identificar recursos no utilizados para optimización de costos
"""
import boto3
from datetime import datetime, timedelta

ec2 = boto3.client('ec2')
cloudwatch = boto3.client('cloudwatch')

def find_idle_instances(days=7):
    """
    Encuentra instancias con baja utilización
    """
    print(f"Buscando instancias con baja utilización (últimos {days} días)...")
    
    response = ec2.describe_instances(
        Filters=[
            {'Name': 'instance-state-name', 'Values': ['running']}
        ]
    )
    
    idle_instances = []
    
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instance_id = instance['InstanceId']
            tags = {tag['Key']: tag['Value'] for tag in instance.get('Tags', [])}
            
            # Obtener métricas de CPU
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(days=days)
            
            cpu_metrics = cloudwatch.get_metric_statistics(
                Namespace='AWS/EC2',
                MetricName='CPUUtilization',
                Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
                StartTime=start_time,
                EndTime=end_time,
                Period=3600,
                Statistics=['Average']
            )
            
            if cpu_metrics['Datapoints']:
                avg_cpu = sum(dp['Average'] for dp in cpu_metrics['Datapoints']) / len(cpu_metrics['Datapoints'])
                
                if avg_cpu < 5:  # CPU promedio menor a 5%
                    idle_instances.append({
                        'InstanceId': instance_id,
                        'InstanceType': instance['InstanceType'],
                        'AvgCPU': avg_cpu,
                        'Environment': tags.get('Environment', 'N/A'),
                        'Owner': tags.get('Owner', 'N/A'),
                        'Application': tags.get('Application', 'N/A')
                    })
    
    # Mostrar resultados
    print(f"\nEncontradas {len(idle_instances)} instancias con baja utilización:\n")
    
    for instance in idle_instances:
        print(f"Instance: {instance['InstanceId']}")
        print(f"  Type: {instance['InstanceType']}")
        print(f"  Avg CPU: {instance['AvgCPU']:.2f}%")
        print(f"  Environment: {instance['Environment']}")
        print(f"  Owner: {instance['Owner']}")
        print(f"  Application: {instance['Application']}")
        print()
    
    return idle_instances

# Ejecutar análisis
idle = find_idle_instances(days=7)

# Generar reporte
if idle:
    print("Recomendaciones:")
    print("- Considerar detener o terminar estas instancias")
    print("- Contactar a los owners para validar si son necesarias")
    print("- Evaluar cambio a instancias más pequeñas")
```

📚 [Cost Allocation Tags](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html)

---

## 7️⃣ Control de Acceso Basado en Tags (ABAC)

### ¿Qué es ABAC?

**Attribute-Based Access Control (ABAC)** permite controlar el acceso a recursos basándose en tags, en lugar de crear políticas específicas para cada recurso.

### Ventajas de ABAC

- ✅ **Escalabilidad**: Una política para miles de recursos
- ✅ **Flexibilidad**: Permisos dinámicos basados en atributos
- ✅ **Mantenimiento**: Menos políticas que gestionar
- ✅ **Seguridad**: Segregación automática por tags

---

### Ejemplos de Políticas ABAC

#### 1. Acceso por Environment

**Permitir acceso solo a recursos del mismo entorno:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAccessToSameEnvironment",
      "Effect": "Allow",
      "Action": [
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:RebootInstances",
        "ec2:DescribeInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ec2:ResourceTag/Environment": "${aws:PrincipalTag/Environment}"
        }
      }
    }
  ]
}
```

**Uso:**
- Usuario con tag `Environment: development` solo puede gestionar instancias con `Environment: development`
- Usuario con tag `Environment: production` solo puede gestionar instancias con `Environment: production`

---

#### 2. Acceso por Owner

**Permitir acceso solo a recursos del mismo equipo:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAccessToOwnedResources",
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "rds:*",
        "s3:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:ResourceTag/Owner": "${aws:PrincipalTag/Owner}"
        }
      }
    }
  ]
}
```

**Uso:**
- Usuario con tag `Owner: team-backend` solo puede gestionar recursos con `Owner: team-backend`
- Segregación automática entre equipos

---

#### 3. Acceso por Project

**Permitir acceso solo a recursos del mismo proyecto:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAccessToProjectResources",
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "rds:*",
        "elasticloadbalancing:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:ResourceTag/Project": "${aws:PrincipalTag/Project}"
        }
      }
    },
    {
      "Sid": "RequireProjectTagOnCreate",
      "Effect": "Allow",
      "Action": [
        "ec2:RunInstances",
        "rds:CreateDBInstance"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestTag/Project": "${aws:PrincipalTag/Project}"
        }
      }
    }
  ]
}
```

---

#### 4. Política Combinada (Multi-Atributo)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAccessBasedOnMultipleTags",
      "Effect": "Allow",
      "Action": [
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:RebootInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ec2:ResourceTag/Environment": "${aws:PrincipalTag/Environment}",
          "ec2:ResourceTag/Owner": "${aws:PrincipalTag/Owner}"
        }
      }
    },
    {
      "Sid": "DenyProductionAccess",
      "Effect": "Deny",
      "Action": [
        "ec2:TerminateInstances",
        "rds:DeleteDBInstance"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:ResourceTag/Environment": "production"
        },
        "StringNotEquals": {
          "aws:PrincipalTag/Role": "admin"
        }
      }
    }
  ]
}
```

---

### Asignar Tags a Usuarios IAM

```bash
# Asignar tags a usuario IAM
aws iam tag-user \
  --user-name john.doe \
  --tags \
    Key=Environment,Value=development \
    Key=Owner,Value=team-backend \
    Key=Project,Value=webapp \
    Key=Role,Value=developer

# Asignar tags a role IAM
aws iam tag-role \
  --role-name developer-role \
  --tags \
    Key=Environment,Value=development \
    Key=Owner,Value=team-backend
```

```hcl
# Terraform: Usuario con tags
resource "aws_iam_user" "developer" {
  name = "john.doe"
  
  tags = {
    Environment = "development"
    Owner       = "team-backend"
    Project     = "webapp"
    Role        = "developer"
  }
}

# Terraform: Role con tags
resource "aws_iam_role" "developer" {
  name = "developer-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
  
  tags = {
    Environment = "development"
    Owner       = "team-backend"
  }
}
```

📚 [ABAC for AWS](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction_attribute-based-access-control.html)

---

## 8️⃣ Auditoría y Compliance

### AWS Config para Auditoría de Tags

#### Regla: Verificar Tags Obligatorios

```json
{
  "ConfigRuleName": "required-tags",
  "Description": "Verifica que los recursos tengan tags obligatorios",
  "Source": {
    "Owner": "AWS",
    "SourceIdentifier": "REQUIRED_TAGS"
  },
  "InputParameters": {
    "tag1Key": "Environment",
    "tag2Key": "Owner",
    "tag3Key": "Application",
    "tag4Key": "CostCenter",
    "tag5Key": "Project"
  },
  "Scope": {
    "ComplianceResourceTypes": [
      "AWS::EC2::Instance",
      "AWS::EC2::Volume",
      "AWS::RDS::DBInstance",
      "AWS::S3::Bucket",
      "AWS::Lambda::Function"
    ]
  }
}
```

```bash
# Crear regla de Config
aws configservice put-config-rule \
  --config-rule file://required-tags-rule.json
```

---

### Tag Editor

**Buscar recursos sin tags:**

```bash
# Buscar instancias EC2 sin tag Environment
aws resourcegroupstaggingapi get-resources \
  --resource-type-filters "ec2:instance" \
  --tag-filters Key=Environment

# Buscar todos los recursos sin tags
aws resourcegroupstaggingapi get-resources \
  --resource-type-filters "ec2" "rds" "s3" \
  | jq '.ResourceTagMappingList[] | select(.Tags | length == 0)'
```

**Aplicar tags masivamente:**

```bash
# Obtener recursos sin tag Environment
RESOURCES=$(aws resourcegroupstaggingapi get-resources \
  --resource-type-filters "ec2:instance" \
  --query 'ResourceTagMappingList[?!Tags[?Key==`Environment`]].ResourceARN' \
  --output text)

# Aplicar tag a todos
for arn in $RESOURCES; do
  aws resourcegroupstaggingapi tag-resources \
    --resource-arn-list "$arn" \
    --tags Environment=development
done
```

---

### Reporte de Compliance

```python
"""
Generar reporte de compliance de tags
"""
import boto3
import json
from datetime import datetime

config = boto3.client('config')
resourcegroupstaggingapi = boto3.client('resourcegroupstaggingapi')

REQUIRED_TAGS = ['Environment', 'Owner', 'Application', 'CostCenter', 'Project']

def generate_compliance_report():
    """
    Genera reporte de compliance de tags
    """
    print("=== Reporte de Compliance de Tags ===")
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Obtener todos los recursos
    paginator = resourcegroupstaggingapi.get_paginator('get_resources')
    
    total_resources = 0
    compliant_resources = 0
    non_compliant_resources = 0
    
    compliance_by_type = {}
    missing_tags_summary = {tag: 0 for tag in REQUIRED_TAGS}
    
    for page in paginator.paginate():
        for resource in page['ResourceTagMappingList']:
            total_resources += 1
            
            resource_arn = resource['ResourceARN']
            resource_type = resource_arn.split(':')[2]
            tags = {tag['Key']: tag['Value'] for tag in resource.get('Tags', [])}
            
            # Verificar tags obligatorios
            missing_tags = [tag for tag in REQUIRED_TAGS if tag not in tags]
            
            if not missing_tags:
                compliant_resources += 1
                status = 'COMPLIANT'
            else:
                non_compliant_resources += 1
                status = 'NON_COMPLIANT'
                
                # Contar tags faltantes
                for tag in missing_tags:
                    missing_tags_summary[tag] += 1
            
            # Agrupar por tipo de recurso
            if resource_type not in compliance_by_type:
                compliance_by_type[resource_type] = {
                    'total': 0,
                    'compliant': 0,
                    'non_compliant': 0
                }
            
            compliance_by_type[resource_type]['total'] += 1
            if status == 'COMPLIANT':
                compliance_by_type[resource_type]['compliant'] += 1
            else:
                compliance_by_type[resource_type]['non_compliant'] += 1
    
    # Imprimir resumen
    print(f"Total de recursos: {total_resources}")
    print(f"Recursos compliant: {compliant_resources} ({compliant_resources/total_resources*100:.1f}%)")
    print(f"Recursos non-compliant: {non_compliant_resources} ({non_compliant_resources/total_resources*100:.1f}%)")
    print()
    
    print("Compliance por tipo de recurso:")
    for resource_type, stats in sorted(compliance_by_type.items()):
        compliance_rate = stats['compliant'] / stats['total'] * 100
        print(f"  {resource_type}:")
        print(f"    Total: {stats['total']}")
        print(f"    Compliant: {stats['compliant']} ({compliance_rate:.1f}%)")
        print(f"    Non-compliant: {stats['non_compliant']}")
    print()
    
    print("Tags más frecuentemente faltantes:")
    for tag, count in sorted(missing_tags_summary.items(), key=lambda x: x[1], reverse=True):
        if count > 0:
            print(f"  {tag}: {count} recursos")
    
    # Exportar a JSON
    report = {
        'generated_at': datetime.now().isoformat(),
        'summary': {
            'total_resources': total_resources,
            'compliant_resources': compliant_resources,
            'non_compliant_resources': non_compliant_resources,
            'compliance_rate': compliant_resources / total_resources * 100
        },
        'by_resource_type': compliance_by_type,
        'missing_tags_summary': missing_tags_summary
    }
    
    with open('tag_compliance_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\nReporte exportado a tag_compliance_report.json")

# Generar reporte
generate_compliance_report()
```

---

### Dashboard de Compliance

```python
"""
Crear dashboard de CloudWatch para compliance de tags
"""
import boto3
import json

cloudwatch = boto3.client('cloudwatch')

dashboard_body = {
    "widgets": [
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["AWS/Config", "ComplianceScore", {"stat": "Average"}]
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-east-1",
                "title": "Tag Compliance Score",
                "yAxis": {
                    "left": {
                        "min": 0,
                        "max": 100
                    }
                }
            }
        },
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["AWS/Config", "CompliantResourceCount", {"label": "Compliant"}],
                    [".", "NonCompliantResourceCount", {"label": "Non-Compliant"}]
                ],
                "period": 300,
                "stat": "Sum",
                "region": "us-east-1",
                "title": "Resource Compliance Status"
            }
        }
    ]
}

response = cloudwatch.put_dashboard(
    DashboardName='Tag-Compliance-Dashboard',
    DashboardBody=json.dumps(dashboard_body)
)

print("Dashboard creado exitosamente")
```

📚 [AWS Config Compliance](https://docs.aws.amazon.com/config/latest/developerguide/evaluate-config.html)

---

## 9️⃣ Automatización Avanzada

### Programación de Encendido/Apagado

```python
"""
Lambda para encender/apagar instancias basado en tags
"""
import boto3
from datetime import datetime

ec2 = boto3.client('ec2')

def lambda_handler(event, context):
    """
    Enciende o apaga instancias según tag Schedule
    
    Tag Schedule valores:
    - 24x7: Siempre encendida
    - business-hours: 8am-6pm lunes-viernes
    - nights-weekends: 6pm-8am y fines de semana
    - custom: Horario personalizado
    """
    
    # Determinar acción (start o stop)
    action = event.get('action', 'stop')  # start o stop
    
    # Obtener día y hora actual
    now = datetime.now()
    current_hour = now.hour
    current_day = now.weekday()  # 0=Lunes, 6=Domingo
    
    # Filtros según acción
    if action == 'stop':
        # Buscar instancias running con Schedule != 24x7
        filters = [
            {'Name': 'instance-state-name', 'Values': ['running']},
            {'Name': 'tag:Schedule', 'Values': ['business-hours', 'nights-weekends']}
        ]
    else:  # start
        # Buscar instancias stopped con Schedule
        filters = [
            {'Name': 'instance-state-name', 'Values': ['stopped']},
            {'Name': 'tag:Schedule', 'Values': ['business-hours', 'nights-weekends']}
        ]
    
    response = ec2.describe_instances(Filters=filters)
    
    instances_to_process = []
    
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instance_id = instance['InstanceId']
            tags = {tag['Key']: tag['Value'] for tag in instance.get('Tags', [])}
            schedule = tags.get('Schedule', '')
            
            should_process = False
            
            # Lógica de horarios
            if schedule == 'business-hours':
                # 8am-6pm lunes-viernes
                if action == 'start':
                    should_process = (current_day < 5 and current_hour == 8)
                else:  # stop
                    should_process = (current_day < 5 and current_hour == 18) or (current_day >= 5)
            
            elif schedule == 'nights-weekends':
                # 6pm-8am y fines de semana
                if action == 'start':
                    should_process = (current_hour == 18) or (current_day >= 5 and current_hour == 0)
                else:  # stop
                    should_process = (current_hour == 8 and current_day < 5)
            
            if should_process:
                instances_to_process.append({
                    'id': instance_id,
                    'name': tags.get('Name', 'N/A'),
                    'environment': tags.get('Environment', 'N/A'),
                    'owner': tags.get('Owner', 'N/A')
                })
    
    # Ejecutar acción
    if instances_to_process:
        instance_ids = [i['id'] for i in instances_to_process]
        
        if action == 'start':
            ec2.start_instances(InstanceIds=instance_ids)
            print(f"Instancias iniciadas: {len(instance_ids)}")
        else:
            ec2.stop_instances(InstanceIds=instance_ids)
            print(f"Instancias detenidas: {len(instance_ids)}")
        
        # Log de instancias procesadas
        for instance in instances_to_process:
            print(f"  {action.upper()}: {instance['id']} - {instance['name']} ({instance['environment']})")
    else:
        print(f"No hay instancias para {action}")
    
    return {
        'statusCode': 200,
        'body': f'{len(instances_to_process)} instancias procesadas'
    }
```

#### EventBridge Rules para Programación

```json
{
  "ScheduleExpression": "cron(0 8 ? * MON-FRI *)",
  "Description": "Encender instancias business-hours a las 8am",
  "State": "ENABLED",
  "Targets": [
    {
      "Arn": "arn:aws:lambda:us-east-1:123456789012:function:instance-scheduler",
      "Input": "{\"action\": \"start\"}"
    }
  ]
}
```

```json
{
  "ScheduleExpression": "cron(0 18 ? * MON-FRI *)",
  "Description": "Apagar instancias business-hours a las 6pm",
  "State": "ENABLED",
  "Targets": [
    {
      "Arn": "arn:aws:lambda:us-east-1:123456789012:function:instance-scheduler",
      "Input": "{\"action\": \"stop\"}"
    }
  ]
}
```

---

### Backup Automático por Tags

```python
"""
Lambda para crear backups basados en tag BackupPolicy
"""
import boto3
from datetime import datetime

ec2 = boto3.client('ec2')

def lambda_handler(event, context):
    """
    Crea snapshots de volúmenes según tag BackupPolicy
    
    BackupPolicy valores:
    - daily: Backup diario, retención 7 días
    - weekly: Backup semanal, retención 30 días
    - monthly: Backup mensual, retención 365 días
    """
    
    # Obtener volúmenes con BackupPolicy
    response = ec2.describe_volumes(
        Filters=[
            {'Name': 'tag-key', 'Values': ['BackupPolicy']}
        ]
    )
    
    snapshots_created = []
    
    for volume in response['Volumes']:
        volume_id = volume['VolumeId']
        tags = {tag['Key']: tag['Value'] for tag in volume.get('Tags', [])}
        
        backup_policy = tags.get('BackupPolicy', 'none')
        
        if backup_policy == 'none':
            continue
        
        # Determinar retención
        retention_days = {
            'daily': 7,
            'weekly': 30,
            'monthly': 365
        }.get(backup_policy, 7)
        
        # Crear snapshot
        snapshot = ec2.create_snapshot(
            VolumeId=volume_id,
            Description=f"Automated backup - {backup_policy} - {datetime.now().strftime('%Y-%m-%d')}"
        )
        
        snapshot_id = snapshot['SnapshotId']
        
        # Copiar tags del volumen al snapshot
        snapshot_tags = [
            {'Key': 'Name', 'Value': f"{tags.get('Name', volume_id)}-backup"},
            {'Key': 'BackupPolicy', 'Value': backup_policy},
            {'Key': 'RetentionDays', 'Value': str(retention_days)},
            {'Key': 'CreatedBy', 'Value': 'automated-backup'},
            {'Key': 'CreatedDate', 'Value': datetime.now().strftime('%Y-%m-%d')},
            {'Key': 'SourceVolume', 'Value': volume_id}
        ]
        
        # Copiar tags adicionales
        for key in ['Environment', 'Owner', 'Application', 'CostCenter']:
            if key in tags:
                snapshot_tags.append({'Key': key, 'Value': tags[key]})
        
        ec2.create_tags(
            Resources=[snapshot_id],
            Tags=snapshot_tags
        )
        
        snapshots_created.append({
            'snapshot_id': snapshot_id,
            'volume_id': volume_id,
            'policy': backup_policy,
            'retention': retention_days
        })
        
        print(f"Snapshot creado: {snapshot_id} para volumen {volume_id} ({backup_policy})")
    
    # Limpiar snapshots antiguos
    cleanup_old_snapshots()
    
    return {
        'statusCode': 200,
        'body': f'{len(snapshots_created)} snapshots creados'
    }

def cleanup_old_snapshots():
    """
    Elimina snapshots que exceden el período de retención
    """
    from datetime import timedelta
    
    response = ec2.describe_snapshots(
        OwnerIds=['self'],
        Filters=[
            {'Name': 'tag:CreatedBy', 'Values': ['automated-backup']}
        ]
    )
    
    for snapshot in response['Snapshots']:
        snapshot_id = snapshot['SnapshotId']
        tags = {tag['Key']: tag['Value'] for tag in snapshot.get('Tags', [])}
        
        retention_days = int(tags.get('RetentionDays', 7))
        created_date = datetime.strptime(tags.get('CreatedDate', ''), '%Y-%m-%d')
        
        age_days = (datetime.now() - created_date).days
        
        if age_days > retention_days:
            ec2.delete_snapshot(SnapshotId=snapshot_id)
            print(f"Snapshot eliminado: {snapshot_id} (edad: {age_days} días)")
```

---

### Notificaciones por Tags

```python
"""
Lambda para enviar notificaciones basadas en tags
"""
import boto3
import json

sns = boto3.client('sns')
ec2 = boto3.client('ec2')

# Mapeo de owners a topics SNS
OWNER_TOPICS = {
    'team-backend': 'arn:aws:sns:us-east-1:123456789012:team-backend-alerts',
    'team-frontend': 'arn:aws:sns:us-east-1:123456789012:team-frontend-alerts',
    'team-data': 'arn:aws:sns:us-east-1:123456789012:team-data-alerts',
}

def lambda_handler(event, context):
    """
    Envía notificaciones al equipo owner cuando hay eventos en sus recursos
    """
    
    # Parsear evento de CloudWatch
    detail = event['detail']
    event_name = detail['eventName']
    
    # Obtener información del recurso
    if event_name == 'RunInstances':
        instances = detail['responseElements']['instancesSet']['items']
        
        for instance in instances:
            instance_id = instance['instanceId']
            
            # Obtener tags de la instancia
            response = ec2.describe_instances(InstanceIds=[instance_id])
            tags = {}
            
            for reservation in response['Reservations']:
                for inst in reservation['Instances']:
                    tags = {tag['Key']: tag['Value'] for tag in inst.get('Tags', [])}
            
            owner = tags.get('Owner', 'unknown')
            environment = tags.get('Environment', 'unknown')
            application = tags.get('Application', 'unknown')
            
            # Enviar notificación al owner
            if owner in OWNER_TOPICS:
                message = f"""
Nueva instancia EC2 creada:

Instance ID: {instance_id}
Environment: {environment}
Application: {application}
Owner: {owner}

Por favor, verifica que la instancia tenga todos los tags obligatorios.
                """
                
                sns.publish(
                    TopicArn=OWNER_TOPICS[owner],
                    Subject=f'Nueva instancia EC2 creada - {instance_id}',
                    Message=message
                )
                
                print(f"Notificación enviada a {owner} para instancia {instance_id}")
    
    return {
        'statusCode': 200,
        'body': 'Notificaciones enviadas'
    }
```

---

### Resource Groups por Tags

```python
"""
Crear Resource Groups basados en tags
"""
import boto3

resource_groups = boto3.client('resource-groups')

def create_resource_group(name, description, tag_filters):
    """
    Crea un Resource Group basado en tags
    """
    response = resource_groups.create_group(
        Name=name,
        Description=description,
        ResourceQuery={
            'Type': 'TAG_FILTERS_1_0',
            'Query': json.dumps({
                'ResourceTypeFilters': ['AWS::AllSupported'],
                'TagFilters': tag_filters
            })
        },
        Tags={
            'ManagedBy': 'automation',
            'CreatedDate': datetime.now().strftime('%Y-%m-%d')
        }
    )
    
    print(f"Resource Group creado: {name}")
    return response

# Ejemplos de Resource Groups

# Por Environment
create_resource_group(
    name='production-resources',
    description='Todos los recursos de producción',
    tag_filters=[
        {
            'Key': 'Environment',
            'Values': ['production']
        }
    ]
)

# Por Application
create_resource_group(
    name='webapp-resources',
    description='Recursos de la aplicación web',
    tag_filters=[
        {
            'Key': 'Application',
            'Values': ['webapp']
        }
    ]
)

# Por Owner
create_resource_group(
    name='team-backend-resources',
    description='Recursos del equipo backend',
    tag_filters=[
        {
            'Key': 'Owner',
            'Values': ['team-backend']
        }
    ]
)

# Combinación de tags
create_resource_group(
    name='prod-webapp-backend',
    description='Recursos de webapp en producción del equipo backend',
    tag_filters=[
        {
            'Key': 'Environment',
            'Values': ['production']
        },
        {
            'Key': 'Application',
            'Values': ['webapp']
        },
        {
            'Key': 'Owner',
            'Values': ['team-backend']
        }
    ]
)
```

📚 [AWS Resource Groups](https://docs.aws.amazon.com/ARG/latest/userguide/resource-groups.html)

---

## 🔟 Mejores Prácticas y Recomendaciones

### Checklist de Implementación

#### Fase 1: Planificación (Semana 1)

- [ ] **Definir estrategia de tagging** para la organización
- [ ] **Identificar tags obligatorios** y recomendados
- [ ] **Establecer nomenclatura** y convenciones
- [ ] **Documentar política de tagging**
- [ ] **Obtener aprobación** de stakeholders
- [ ] **Definir responsables** de cada tag

#### Fase 2: Implementación (Semana 2-3)

- [ ] **Crear Tag Policies** en AWS Organizations
- [ ] **Implementar SCPs** para forzar tags
- [ ] **Configurar AWS Config rules** para validación
- [ ] **Activar Cost Allocation Tags**
- [ ] **Crear Lambda de auto-tagging**
- [ ] **Configurar EventBridge rules**

#### Fase 3: Migración (Semana 4-6)

- [ ] **Auditar recursos existentes**
- [ ] **Identificar recursos sin tags**
- [ ] **Aplicar tags a recursos existentes**
- [ ] **Validar compliance**
- [ ] **Corregir inconsistencias**
- [ ] **Documentar excepciones**

#### Fase 4: Automatización (Mes 2)

- [ ] **Implementar auto-tagging** en pipelines CI/CD
- [ ] **Configurar programación** de encendido/apagado
- [ ] **Automatizar backups** por tags
- [ ] **Implementar ABAC** para control de acceso
- [ ] **Crear Resource Groups**
- [ ] **Configurar notificaciones**

#### Fase 5: Monitoreo (Continuo)

- [ ] **Revisar compliance** semanalmente
- [ ] **Generar reportes** de costos mensuales
- [ ] **Auditar nuevos recursos**
- [ ] **Actualizar documentación**
- [ ] **Capacitar equipos**
- [ ] **Optimizar estrategia**

---

### Errores Comunes a Evitar

#### ❌ 1. Demasiados Tags Obligatorios

**Problema**: Requerir 15+ tags hace que sea difícil de cumplir

**Solución**: Limitar a 5-7 tags obligatorios esenciales

---

#### ❌ 2. Nomenclatura Inconsistente

**Problema**: `environment`, `Environment`, `env`, `ENV`

**Solución**: Definir y documentar convención clara (PascalCase recomendado)

---

#### ❌ 3. Valores No Estandarizados

**Problema**: `prod`, `production`, `PROD`, `prd`

**Solución**: Usar Tag Policies para definir valores permitidos

---

#### ❌ 4. No Activar Cost Allocation Tags

**Problema**: Tags no aparecen en reportes de costos

**Solución**: Activar tags en Billing Console

---

#### ❌ 5. Tags Solo en Recursos Nuevos

**Problema**: Recursos existentes sin tags

**Solución**: Auditar y etiquetar recursos existentes

---

#### ❌ 6. No Automatizar

**Problema**: Depender de etiquetado manual

**Solución**: Implementar auto-tagging y validación automática

---

#### ❌ 7. Ignorar Compliance

**Problema**: No monitorear cumplimiento de política

**Solución**: AWS Config rules y reportes regulares

---

### Recomendaciones Finales

#### 1. Simplicidad

- ✅ Mantén la estrategia simple y práctica
- ✅ Menos tags obligatorios = mayor cumplimiento
- ✅ Nombres descriptivos y claros

#### 2. Consistencia

- ✅ Usa siempre el mismo formato
- ✅ Documenta y comunica la estrategia
- ✅ Capacita a los equipos

#### 3. Automatización

- ✅ Automatiza todo lo posible
- ✅ Valida tags en pipelines CI/CD
- ✅ Auto-remediation cuando sea posible

#### 4. Monitoreo

- ✅ Revisa compliance regularmente
- ✅ Genera reportes de costos
- ✅ Audita recursos nuevos

#### 5. Evolución

- ✅ Revisa la estrategia trimestralmente
- ✅ Adapta según necesidades
- ✅ Incorpora feedback de equipos

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [Tagging AWS Resources](https://docs.aws.amazon.com/general/latest/gr/aws_tagging.html)
- [Tagging Best Practices](https://docs.aws.amazon.com/whitepapers/latest/tagging-best-practices/tagging-best-practices.html)
- [Cost Allocation Tags](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html)
- [Tag Policies](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_tag-policies.html)
- [ABAC for AWS](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction_attribute-based-access-control.html)

### Herramientas

- [AWS Tag Editor](https://docs.aws.amazon.com/ARG/latest/userguide/tag-editor.html)
- [AWS Resource Groups](https://docs.aws.amazon.com/ARG/latest/userguide/resource-groups.html)
- [AWS Config](https://docs.aws.amazon.com/config/)
- [AWS Cost Explorer](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/)

### Scripts y Automatización

- [AWS Tagging Strategies GitHub](https://github.com/aws-samples/aws-tagging-strategies)
- [Tag Compliance Checker](https://github.com/aws-samples/tag-compliance-checker)
- [Auto Tagging Lambda](https://github.com/aws-samples/aws-lambda-auto-tag)

---

## 📝 Plantilla de Política de Tagging

```markdown
# Política de Tagging - [Nombre de la Organización]

## Versión
1.0 - Febrero 2026

## Objetivo
Establecer una estrategia consistente de etiquetado de recursos en AWS.

## Alcance
Esta política aplica a todos los recursos de AWS en todas las cuentas.

## Tags Obligatorios

| Tag | Descripción | Valores Permitidos | Ejemplo |
|-----|-------------|-------------------|---------|
| Environment | Entorno de ejecución | production, staging, development, testing | production |
| Owner | Equipo responsable | team-backend, team-frontend, team-data | team-backend |
| Application | Nombre de la aplicación | [nombre-aplicacion] | webapp |
| CostCenter | Centro de costos | engineering, marketing, sales | engineering |
| Project | Proyecto específico | [nombre-proyecto] | migration-2024 |

## Tags Recomendados

| Tag | Descripción | Ejemplo |
|-----|-------------|---------|
| Name | Nombre descriptivo | prod-web-server-01 |
| DataClassification | Nivel de sensibilidad | confidential |
| BackupPolicy | Política de backup | daily |
| PatchGroup | Grupo de parches | critical |

## Convenciones

- **Claves**: PascalCase (Environment, CostCenter)
- **Valores**: lowercase-kebab-case (production, team-backend)
- **Longitud máxima**: 128 caracteres (clave), 256 caracteres (valor)

## Enforcement

- Tag Policies en AWS Organizations
- Service Control Policies (SCPs)
- AWS Config Rules
- Auto-tagging Lambda

## Excepciones

Las excepciones deben ser aprobadas por [Responsable] y documentadas en [Sistema].

## Revisión

Esta política será revisada trimestralmente.

## Contacto

Para preguntas: [email@company.com]
```

---

**Versión**: 1.0  
**Última actualización**: Febrero 2026  
**Próxima revisión**: Mayo 2026

---

*Esta guía debe adaptarse a los requisitos específicos de su organización. Para implementación técnica detallada, consulte con su equipo de arquitectos de nube.*
