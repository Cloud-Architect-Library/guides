---
sidebar_label: "AWS Secrets Manager"
sidebar_position: 4
---

<div align="center">

# 🔐 AWS Secrets Manager - Gestión Segura de Credenciales

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Security](https://img.shields.io/badge/Security-DD0031?style=for-the-badge&logo=security&logoColor=white)

</div>

## 📋 Introducción

AWS Secrets Manager es un servicio que permite **almacenar, rotar y gestionar credenciales de forma segura**. Elimina la necesidad de hardcodear credenciales en el código o archivos de configuración.

**Objetivo**: Implementar gestión segura de credenciales para aplicaciones que se conectan a bases de datos y otros servicios.

---

## 1️⃣ ¿Qué es AWS Secrets Manager?

### Características Principales

- 🔐 **Almacenamiento cifrado** de credenciales con AWS KMS
- 🔄 **Rotación automática** de secretos sin downtime
- 🔗 **Integración nativa** con RDS, DocumentDB, Redshift
- 📊 **Auditoría completa** con CloudTrail
- 🎯 **Control de acceso granular** con IAM
- 🌍 **Replicación multi-región** para alta disponibilidad

### ¿Cuándo Usar Secrets Manager?

✅ **Usar Secrets Manager para:**
- Credenciales de bases de datos (RDS, Aurora, Redshift)
- API keys de terceros
- Tokens de autenticación
- Certificados y claves privadas
- Cualquier secreto que requiera rotación automática

❌ **No usar para:**
- Configuración de aplicación (usar Parameter Store)
- Datos públicos o no sensibles
- Secretos que cambian muy frecuentemente (> 1 vez/hora)

### Secrets Manager vs Parameter Store

| Característica | Secrets Manager | Parameter Store |
|----------------|-----------------|-----------------|
| **Rotación automática** | ✅ Sí | ❌ No |
| **Integración con RDS** | ✅ Nativa | ⚠️ Manual |
| **Costo** | $0.40/secreto/mes + $0.05/10K llamadas | Gratis (Standard) |
| **Cifrado** | ✅ Obligatorio | ⚠️ Opcional |
| **Versionado** | ✅ Automático | ✅ Sí |
| **Uso recomendado** | Credenciales críticas | Configuración de apps |

📚 [Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)

---

## 2️⃣ Caso de Uso: EC2 conectándose a RDS

### Arquitectura de la Solución

```
┌─────────────────────────────────────────────────────────┐
│                      VPC: 10.0.0.0/16                   │
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │  Private Subnet  │         │  Private Subnet  │    │
│  │   10.0.10.0/24   │         │   10.0.20.0/24   │    │
│  │                  │         │                  │    │
│  │  ┌────────────┐  │         │  ┌────────────┐  │    │
│  │  │            │  │         │  │            │  │    │
│  │  │  EC2       │──┼─────────┼─▶│  RDS       │  │    │
│  │  │  Instance  │  │         │  │  MySQL     │  │    │
│  │  │            │  │         │  │            │  │    │
│  │  └─────┬──────┘  │         │  └────────────┘  │    │
│  │        │         │         │                  │    │
│  └────────┼─────────┘         └──────────────────┘    │
│           │                                            │
└───────────┼────────────────────────────────────────────┘
            │
            │ IAM Role
            │ GetSecretValue
            ▼
    ┌───────────────────┐
    │  Secrets Manager  │
    │                   │
    │  Secret:          │
    │  prod/db/mysql    │
    │  - username       │
    │  - password       │
    │  - host           │
    │  - port           │
    │  - dbname         │
    └───────────────────┘
```

### Flujo de Conexión

1. **EC2 solicita** el secreto a Secrets Manager usando IAM Role
2. **Secrets Manager** valida permisos y devuelve credenciales cifradas
3. **EC2 descifra** las credenciales usando KMS
4. **EC2 se conecta** a RDS usando las credenciales obtenidas
5. **CloudTrail registra** todas las operaciones para auditoría

---

## 3️⃣ Implementación Paso a Paso

### Paso 1: Crear la Base de Datos RDS

#### Opción A: Usando la Consola de AWS

1. Navegar a **RDS Console**
2. Click en **Create database**
3. Configurar:
   - Engine: MySQL 8.0
   - Template: Production
   - DB instance identifier: `prod-mysql-db`
   - Master username: `admin`
   - ✅ **Manage master credentials in AWS Secrets Manager**
   - VPC: Seleccionar VPC privada
   - Subnet group: Private subnets
   - Security group: `rds-sg`

#### Opción B: Usando AWS CLI

```bash
# Crear el secreto primero
aws secretsmanager create-secret \
  --name prod/db/mysql \
  --description "Credenciales para base de datos MySQL de producción" \
  --secret-string '{
    "username": "admin",
    "password": "ChangeMe123!TempPassword",
    "engine": "mysql",
    "host": "prod-mysql-db.cluster-xxxxx.us-east-1.rds.amazonaws.com",
    "port": 3306,
    "dbname": "production"
  }' \
  --tags Key=Environment,Value=production Key=Application,Value=webapp

# Crear la instancia RDS
aws rds create-db-instance \
  --db-instance-identifier prod-mysql-db \
  --db-instance-class db.t3.medium \
  --engine mysql \
  --engine-version 8.0.35 \
  --master-username admin \
  --manage-master-user-password \
  --master-user-secret-kms-key-id arn:aws:kms:us-east-1:123456789012:key/abcd1234 \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --vpc-security-group-ids sg-0123456789abcdef0 \
  --db-subnet-group-name private-db-subnet-group \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --enable-cloudwatch-logs-exports '["error","general","slowquery"]' \
  --deletion-protection \
  --tags Key=Environment,Value=production Key=Application,Value=webapp
```

#### Opción C: Usando Terraform

```hcl
# secrets.tf
resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "prod/db/mysql"
  description = "Credenciales para base de datos MySQL de producción"
  
  kms_key_id = aws_kms_key.secrets.id
  
  tags = {
    Environment = "production"
    Application = "webapp"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "admin"
    password = random_password.db_password.result
    engine   = "mysql"
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    dbname   = "production"
  })
}

# Generar password seguro
resource "random_password" "db_password" {
  length  = 32
  special = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# rds.tf
resource "aws_db_instance" "main" {
  identifier     = "prod-mysql-db"
  engine         = "mysql"
  engine_version = "8.0.35"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.rds.arn
  
  db_name  = "production"
  username = "admin"
  password = random_password.db_password.result
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.private.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  enabled_cloudwatch_logs_exports = ["error", "general", "slowquery"]
  
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "prod-mysql-db-final-snapshot"
  
  tags = {
    Environment = "production"
    Application = "webapp"
  }
}
```

📚 [RDS with Secrets Manager](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-secrets-manager.html)

---

### Paso 2: Configurar Security Groups

```hcl
# Security Group para RDS
resource "aws_security_group" "rds" {
  name        = "rds-mysql-sg"
  description = "Security group para RDS MySQL"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description     = "MySQL desde instancias EC2"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_app.id]
  }
  
  egress {
    description = "Permitir todo el tráfico saliente"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "rds-mysql-sg"
  }
}

# Security Group para EC2
resource "aws_security_group" "ec2_app" {
  name        = "ec2-app-sg"
  description = "Security group para instancias EC2 de aplicación"
  vpc_id      = aws_vpc.main.id
  
  egress {
    description = "Permitir todo el tráfico saliente"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "ec2-app-sg"
  }
}
```

---

### Paso 3: Crear IAM Role para EC2

```hcl
# IAM Role para EC2
resource "aws_iam_role" "ec2_app" {
  name = "ec2-app-role"
  
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
    Name = "ec2-app-role"
  }
}

# Política para acceder a Secrets Manager
resource "aws_iam_role_policy" "secrets_access" {
  name = "secrets-manager-access"
  role = aws_iam_role.ec2_app.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_secretsmanager_secret.db_credentials.arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.secrets.arn
        Condition = {
          StringEquals = {
            "kms:ViaService" = "secretsmanager.us-east-1.amazonaws.com"
          }
        }
      }
    ]
  })
}

# Instance Profile
resource "aws_iam_instance_profile" "ec2_app" {
  name = "ec2-app-profile"
  role = aws_iam_role.ec2_app.name
}
```

#### Política IAM con Restricciones Adicionales

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "GetSecretValueWithConditions",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:prod/db/*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "us-east-1",
          "secretsmanager:VersionStage": "AWSCURRENT"
        },
        "IpAddress": {
          "aws:SourceIp": "10.0.0.0/16"
        }
      }
    },
    {
      "Sid": "DecryptSecrets",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:us-east-1:123456789012:key/abcd1234-5678-90ab-cdef-1234567890ab",
      "Condition": {
        "StringEquals": {
          "kms:ViaService": "secretsmanager.us-east-1.amazonaws.com"
        }
      }
    }
  ]
}
```

📚 [IAM Policies for Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access.html)

---

### Paso 4: Lanzar Instancia EC2

```hcl
# Launch Template para EC2
resource "aws_launch_template" "app" {
  name_prefix   = "app-server-"
  image_id      = data.aws_ami.amazon_linux_2.id
  instance_type = "t3.medium"
  
  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_app.name
  }
  
  vpc_security_group_ids = [aws_security_group.ec2_app.id]
  
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }
  
  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = 30
      volume_type = "gp3"
      encrypted   = true
      kms_key_id  = aws_kms_key.ebs.arn
    }
  }
  
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    secret_name = aws_secretsmanager_secret.db_credentials.name
    region      = var.aws_region
  }))
  
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "app-server"
      Environment = "production"
      Application = "webapp"
    }
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "app" {
  name                = "app-asg"
  vpc_zone_identifier = aws_subnet.private[*].id
  min_size            = 2
  max_size            = 6
  desired_capacity    = 2
  
  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }
  
  health_check_type         = "ELB"
  health_check_grace_period = 300
  
  tag {
    key                 = "Name"
    value               = "app-server"
    propagate_at_launch = true
  }
}
```

---

### Paso 5: Código de Aplicación en EC2

#### Python (Boto3)

```python
#!/usr/bin/env python3
"""
Aplicación Python que se conecta a RDS usando Secrets Manager
"""
import json
import boto3
import pymysql
from botocore.exceptions import ClientError

def get_secret(secret_name, region_name="us-east-1"):
    """
    Obtiene un secreto desde AWS Secrets Manager
    
    Args:
        secret_name: Nombre del secreto en Secrets Manager
        region_name: Región de AWS
        
    Returns:
        dict: Diccionario con las credenciales
    """
    # Crear cliente de Secrets Manager
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        # Manejar errores específicos
        if e.response['Error']['Code'] == 'DecryptionFailureException':
            raise Exception("No se pudo descifrar el secreto") from e
        elif e.response['Error']['Code'] == 'InternalServiceErrorException':
            raise Exception("Error interno del servicio") from e
        elif e.response['Error']['Code'] == 'InvalidParameterException':
            raise Exception("Parámetro inválido") from e
        elif e.response['Error']['Code'] == 'InvalidRequestException':
            raise Exception("Solicitud inválida") from e
        elif e.response['Error']['Code'] == 'ResourceNotFoundException':
            raise Exception(f"Secreto '{secret_name}' no encontrado") from e
        else:
            raise
    
    # Parsear el secreto
    secret = json.loads(get_secret_value_response['SecretString'])
    return secret

def get_db_connection(secret_name):
    """
    Crea una conexión a la base de datos usando credenciales de Secrets Manager
    
    Args:
        secret_name: Nombre del secreto
        
    Returns:
        pymysql.Connection: Conexión a la base de datos
    """
    # Obtener credenciales
    credentials = get_secret(secret_name)
    
    # Conectar a la base de datos
    connection = pymysql.connect(
        host=credentials['host'],
        user=credentials['username'],
        password=credentials['password'],
        database=credentials['dbname'],
        port=credentials['port'],
        connect_timeout=5,
        cursorclass=pymysql.cursors.DictCursor
    )
    
    return connection

def main():
    """Función principal"""
    secret_name = "prod/db/mysql"
    
    try:
        # Obtener conexión
        print(f"Conectando a la base de datos usando secreto: {secret_name}")
        connection = get_db_connection(secret_name)
        
        # Ejecutar query de prueba
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            result = cursor.fetchone()
            print(f"Versión de MySQL: {result['VERSION()']}")
            
            # Crear tabla de ejemplo
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Insertar datos de ejemplo
            cursor.execute("""
                INSERT INTO users (username, email) 
                VALUES (%s, %s)
            """, ('john_doe', 'john@example.com'))
            
            connection.commit()
            print("Datos insertados correctamente")
            
            # Consultar datos
            cursor.execute("SELECT * FROM users")
            users = cursor.fetchall()
            print(f"Usuarios en la base de datos: {len(users)}")
            for user in users:
                print(f"  - {user['username']} ({user['email']})")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise
    finally:
        if 'connection' in locals():
            connection.close()
            print("Conexión cerrada")

if __name__ == "__main__":
    main()
```

#### Node.js

```javascript
/**
 * Aplicación Node.js que se conecta a RDS usando Secrets Manager
 */
const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

// Configurar región
AWS.config.update({ region: 'us-east-1' });

/**
 * Obtiene un secreto desde AWS Secrets Manager
 * @param {string} secretName - Nombre del secreto
 * @returns {Promise<Object>} - Credenciales
 */
async function getSecret(secretName) {
    const client = new AWS.SecretsManager();
    
    try {
        const data = await client.getSecretValue({ SecretId: secretName }).promise();
        
        if ('SecretString' in data) {
            return JSON.parse(data.SecretString);
        } else {
            // Secreto binario
            const buff = Buffer.from(data.SecretBinary, 'base64');
            return JSON.parse(buff.toString('ascii'));
        }
    } catch (err) {
        console.error('Error obteniendo secreto:', err);
        
        if (err.code === 'DecryptionFailureException') {
            throw new Error('No se pudo descifrar el secreto');
        } else if (err.code === 'InternalServiceErrorException') {
            throw new Error('Error interno del servicio');
        } else if (err.code === 'InvalidParameterException') {
            throw new Error('Parámetro inválido');
        } else if (err.code === 'InvalidRequestException') {
            throw new Error('Solicitud inválida');
        } else if (err.code === 'ResourceNotFoundException') {
            throw new Error(`Secreto '${secretName}' no encontrado`);
        }
        
        throw err;
    }
}

/**
 * Crea una conexión a la base de datos
 * @param {string} secretName - Nombre del secreto
 * @returns {Promise<Connection>} - Conexión a MySQL
 */
async function getDbConnection(secretName) {
    // Obtener credenciales
    const credentials = await getSecret(secretName);
    
    // Crear conexión
    const connection = await mysql.createConnection({
        host: credentials.host,
        user: credentials.username,
        password: credentials.password,
        database: credentials.dbname,
        port: credentials.port,
        connectTimeout: 5000
    });
    
    return connection;
}

/**
 * Función principal
 */
async function main() {
    const secretName = 'prod/db/mysql';
    let connection;
    
    try {
        console.log(`Conectando a la base de datos usando secreto: ${secretName}`);
        connection = await getDbConnection(secretName);
        
        // Query de prueba
        const [rows] = await connection.execute('SELECT VERSION() as version');
        console.log(`Versión de MySQL: ${rows[0].version}`);
        
        // Crear tabla
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Insertar datos
        await connection.execute(
            'INSERT INTO users (username, email) VALUES (?, ?)',
            ['jane_doe', 'jane@example.com']
        );
        console.log('Datos insertados correctamente');
        
        // Consultar datos
        const [users] = await connection.execute('SELECT * FROM users');
        console.log(`Usuarios en la base de datos: ${users.length}`);
        users.forEach(user => {
            console.log(`  - ${user.username} (${user.email})`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('Conexión cerrada');
        }
    }
}

// Ejecutar
main().catch(console.error);
```

#### Java (Spring Boot)

```java
package com.example.app.config;

import com.amazonaws.services.secretsmanager.AWSSecretsManager;
import com.amazonaws.services.secretsmanager.AWSSecretsManagerClientBuilder;
import com.amazonaws.services.secretsmanager.model.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {
    
    @Value("${aws.secretsmanager.secret-name}")
    private String secretName;
    
    @Value("${aws.region}")
    private String region;
    
    /**
     * Obtiene credenciales desde Secrets Manager
     */
    private JsonNode getSecret() {
        AWSSecretsManager client = AWSSecretsManagerClientBuilder
            .standard()
            .withRegion(region)
            .build();
        
        GetSecretValueRequest getSecretValueRequest = new GetSecretValueRequest()
            .withSecretId(secretName);
        
        GetSecretValueResult getSecretValueResult;
        
        try {
            getSecretValueResult = client.getSecretValue(getSecretValueRequest);
        } catch (DecryptionFailureException e) {
            throw new RuntimeException("No se pudo descifrar el secreto", e);
        } catch (InternalServiceErrorException e) {
            throw new RuntimeException("Error interno del servicio", e);
        } catch (InvalidParameterException e) {
            throw new RuntimeException("Parámetro inválido", e);
        } catch (InvalidRequestException e) {
            throw new RuntimeException("Solicitud inválida", e);
        } catch (ResourceNotFoundException e) {
            throw new RuntimeException("Secreto no encontrado: " + secretName, e);
        }
        
        String secret = getSecretValueResult.getSecretString();
        
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readTree(secret);
        } catch (Exception e) {
            throw new RuntimeException("Error parseando secreto", e);
        }
    }
    
    /**
     * Configura el DataSource con credenciales de Secrets Manager
     */
    @Bean
    public DataSource dataSource() {
        JsonNode credentials = getSecret();
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(String.format(
            "jdbc:mysql://%s:%d/%s",
            credentials.get("host").asText(),
            credentials.get("port").asInt(),
            credentials.get("dbname").asText()
        ));
        config.setUsername(credentials.get("username").asText());
        config.setPassword(credentials.get("password").asText());
        
        // Configuración del pool
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        
        // Propiedades adicionales
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("useServerPrepStmts", "true");
        config.addDataSourceProperty("useLocalSessionState", "true");
        config.addDataSourceProperty("rewriteBatchedStatements", "true");
        config.addDataSourceProperty("cacheResultSetMetadata", "true");
        config.addDataSourceProperty("cacheServerConfiguration", "true");
        config.addDataSourceProperty("elideSetAutoCommits", "true");
        config.addDataSourceProperty("maintainTimeStats", "false");
        
        return new HikariDataSource(config);
    }
}
```

```properties
# application.properties
aws.secretsmanager.secret-name=prod/db/mysql
aws.region=us-east-1

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true
```

📚 [AWS SDK Documentation](https://aws.amazon.com/sdk-for-python/)

---

## 4️⃣ Rotación Automática de Credenciales

### ¿Por Qué Rotar Credenciales?

- 🔒 **Reduce el riesgo** de credenciales comprometidas
- ⏰ **Cumplimiento** con políticas de seguridad (PCI-DSS, HIPAA)
- 🔄 **Automatización** sin downtime de aplicación
- 📊 **Auditoría** de cambios de credenciales

### Tipos de Rotación

#### 1. Rotación Automática (Recomendado)

**Para servicios soportados nativamente:**
- Amazon RDS (MySQL, PostgreSQL, Oracle, SQL Server)
- Amazon DocumentDB
- Amazon Redshift

```bash
# Habilitar rotación automática para RDS
aws secretsmanager rotate-secret \
  --secret-id prod/db/mysql \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789012:function:SecretsManagerRDSMySQLRotation \
  --rotation-rules AutomaticallyAfterDays=30
```

```hcl
# Terraform: Rotación automática
resource "aws_secretsmanager_secret_rotation" "db_credentials" {
  secret_id           = aws_secretsmanager_secret.db_credentials.id
  rotation_lambda_arn = aws_lambda_function.rotate_secret.arn
  
  rotation_rules {
    automatically_after_days = 30
  }
}

# Lambda para rotación (AWS proporciona funciones predefinidas)
resource "aws_lambda_function" "rotate_secret" {
  filename      = "rotation-function.zip"
  function_name = "SecretsManagerRDSMySQLRotation"
  role          = aws_iam_role.rotation_lambda.arn
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.11"
  timeout       = 30
  
  environment {
    variables = {
      SECRETS_MANAGER_ENDPOINT = "https://secretsmanager.us-east-1.amazonaws.com"
    }
  }
}
```

#### 2. Rotación Manual

```bash
# Actualizar secreto manualmente
aws secretsmanager update-secret \
  --secret-id prod/db/mysql \
  --secret-string '{
    "username": "admin",
    "password": "NewSecurePassword456!",
    "engine": "mysql",
    "host": "prod-mysql-db.cluster-xxxxx.us-east-1.rds.amazonaws.com",
    "port": 3306,
    "dbname": "production"
  }'
```

### Estrategias de Rotación

#### Estrategia 1: Single User (Usuario Único)

**Proceso:**
1. Cambiar la contraseña del usuario existente
2. Actualizar el secreto en Secrets Manager
3. Las aplicaciones obtienen la nueva contraseña automáticamente

**Ventajas:**
- ✅ Simple de implementar
- ✅ Un solo usuario en la base de datos

**Desventajas:**
- ⚠️ Posible downtime durante la rotación
- ⚠️ Requiere reinicio de conexiones

#### Estrategia 2: Alternating Users (Usuarios Alternados)

**Proceso:**
1. Crear un segundo usuario (user_A y user_B)
2. Rotar entre ambos usuarios
3. Cuando se rota, se cambia la contraseña del usuario inactivo
4. Se actualiza el secreto para usar el usuario recién rotado

**Ventajas:**
- ✅ Sin downtime
- ✅ Rollback fácil

**Desventajas:**
- ⚠️ Requiere dos usuarios en la base de datos
- ⚠️ Más complejo de configurar

### Función Lambda de Rotación Personalizada

```python
"""
Lambda function para rotación de secretos de RDS MySQL
"""
import json
import boto3
import pymysql
import os
from botocore.exceptions import ClientError

# Clientes de AWS
secrets_client = boto3.client('secretsmanager')
rds_client = boto3.client('rds')

def lambda_handler(event, context):
    """
    Handler principal de la función Lambda
    """
    arn = event['SecretId']
    token = event['ClientRequestToken']
    step = event['Step']
    
    # Obtener metadata del secreto
    metadata = secrets_client.describe_secret(SecretId=arn)
    
    if not metadata['RotationEnabled']:
        raise ValueError(f"Secret {arn} no tiene rotación habilitada")
    
    # Ejecutar el paso correspondiente
    if step == "createSecret":
        create_secret(secrets_client, arn, token)
    elif step == "setSecret":
        set_secret(secrets_client, arn, token)
    elif step == "testSecret":
        test_secret(secrets_client, arn, token)
    elif step == "finishSecret":
        finish_secret(secrets_client, arn, token)
    else:
        raise ValueError(f"Paso inválido: {step}")

def create_secret(service_client, arn, token):
    """
    Paso 1: Crear nueva versión del secreto con nueva contraseña
    """
    # Obtener secreto actual
    current_dict = get_secret_dict(service_client, arn, "AWSCURRENT")
    
    # Verificar si ya existe la versión pendiente
    try:
        get_secret_dict(service_client, arn, "AWSPENDING", token)
        print("createSecret: Versión pendiente ya existe")
        return
    except service_client.exceptions.ResourceNotFoundException:
        pass
    
    # Generar nueva contraseña
    passwd = service_client.get_random_password(
        ExcludeCharacters='/@"\'\\'
    )
    current_dict['password'] = passwd['RandomPassword']
    
    # Crear nueva versión del secreto
    service_client.put_secret_value(
        SecretId=arn,
        ClientRequestToken=token,
        SecretString=json.dumps(current_dict),
        VersionStages=['AWSPENDING']
    )
    
    print("createSecret: Nueva versión creada exitosamente")

def set_secret(service_client, arn, token):
    """
    Paso 2: Cambiar la contraseña en la base de datos
    """
    # Obtener secretos
    pending_dict = get_secret_dict(service_client, arn, "AWSPENDING", token)
    current_dict = get_secret_dict(service_client, arn, "AWSCURRENT")
    
    # Conectar con credenciales actuales
    conn = get_connection(current_dict)
    
    try:
        with conn.cursor() as cursor:
            # Cambiar contraseña del usuario
            alter_user_sql = f"ALTER USER '{pending_dict['username']}'@'%' IDENTIFIED BY '{pending_dict['password']}'"
            cursor.execute(alter_user_sql)
            conn.commit()
            
            print(f"setSecret: Contraseña actualizada para {pending_dict['username']}")
    finally:
        conn.close()

def test_secret(service_client, arn, token):
    """
    Paso 3: Probar que las nuevas credenciales funcionan
    """
    # Obtener secreto pendiente
    pending_dict = get_secret_dict(service_client, arn, "AWSPENDING", token)
    
    # Intentar conectar con nuevas credenciales
    conn = get_connection(pending_dict)
    
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            if result[0] != 1:
                raise ValueError("Test query falló")
            
            print("testSecret: Nuevas credenciales validadas exitosamente")
    finally:
        conn.close()

def finish_secret(service_client, arn, token):
    """
    Paso 4: Finalizar rotación moviendo AWSCURRENT a la nueva versión
    """
    # Obtener metadata
    metadata = service_client.describe_secret(SecretId=arn)
    current_version = None
    
    for version in metadata["VersionIdsToStages"]:
        if "AWSCURRENT" in metadata["VersionIdsToStages"][version]:
            if version == token:
                print("finishSecret: Versión ya marcada como AWSCURRENT")
                return
            current_version = version
            break
    
    # Actualizar version stages
    service_client.update_secret_version_stage(
        SecretId=arn,
        VersionStage="AWSCURRENT",
        MoveToVersionId=token,
        RemoveFromVersionId=current_version
    )
    
    print("finishSecret: Rotación completada exitosamente")

def get_connection(secret_dict):
    """
    Crea conexión a MySQL
    """
    return pymysql.connect(
        host=secret_dict['host'],
        user=secret_dict['username'],
        password=secret_dict['password'],
        database=secret_dict.get('dbname', 'mysql'),
        port=secret_dict.get('port', 3306),
        connect_timeout=5
    )

def get_secret_dict(service_client, arn, stage, token=None):
    """
    Obtiene el secreto como diccionario
    """
    required_fields = ['host', 'username', 'password']
    
    # Obtener secreto
    if token:
        secret = service_client.get_secret_value(
            SecretId=arn,
            VersionId=token,
            VersionStage=stage
        )
    else:
        secret = service_client.get_secret_value(
            SecretId=arn,
            VersionStage=stage
        )
    
    plaintext = secret['SecretString']
    secret_dict = json.loads(plaintext)
    
    # Validar campos requeridos
    for field in required_fields:
        if field not in secret_dict:
            raise KeyError(f"Campo requerido '{field}' no encontrado en el secreto")
    
    return secret_dict
```

### IAM Role para Lambda de Rotación

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:DescribeSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:PutSecretValue",
        "secretsmanager:UpdateSecretVersionStage"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:prod/db/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetRandomPassword"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:CreateNetworkInterface",
        "ec2:DeleteNetworkInterface",
        "ec2:DescribeNetworkInterfaces"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

📚 [Rotating Secrets](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html)

---

## 5️⃣ Mejores Prácticas

### Gestión de Secretos

#### 1. Nomenclatura Consistente

```
Patrón recomendado: <environment>/<service>/<resource>

Ejemplos:
✅ prod/db/mysql
✅ prod/api/stripe-key
✅ staging/db/postgres
✅ dev/cache/redis

❌ mysql-password
❌ database_credentials
❌ prod-secret-1
```

#### 2. Uso de Tags

```hcl
resource "aws_secretsmanager_secret" "example" {
  name = "prod/db/mysql"
  
  tags = {
    Environment        = "production"
    Application        = "webapp"
    Owner              = "team-backend"
    CostCenter         = "engineering"
    DataClassification = "confidential"
    BackupPolicy       = "daily"
    ComplianceScope    = "pci-dss"
  }
}
```

#### 3. Versionado de Secretos

```bash
# Listar versiones de un secreto
aws secretsmanager list-secret-version-ids \
  --secret-id prod/db/mysql

# Obtener versión específica
aws secretsmanager get-secret-value \
  --secret-id prod/db/mysql \
  --version-id 00000000-0000-0000-0000-000000000001

# Obtener versión anterior (rollback)
aws secretsmanager get-secret-value \
  --secret-id prod/db/mysql \
  --version-stage AWSPREVIOUS
```

#### 4. Estructura del Secreto

**✅ Buena práctica - JSON estructurado:**
```json
{
  "username": "admin",
  "password": "SecurePassword123!",
  "engine": "mysql",
  "host": "prod-mysql-db.cluster-xxxxx.us-east-1.rds.amazonaws.com",
  "port": 3306,
  "dbname": "production",
  "dbClusterIdentifier": "prod-mysql-cluster",
  "ssl": true,
  "connectionTimeout": 5000
}
```

**❌ Mala práctica - String simple:**
```
admin:SecurePassword123!@prod-mysql-db.cluster-xxxxx.us-east-1.rds.amazonaws.com:3306/production
```

---

### Seguridad

#### 1. Cifrado con KMS

```hcl
# Crear KMS key dedicada para Secrets Manager
resource "aws_kms_key" "secrets" {
  description             = "KMS key para Secrets Manager"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  
  tags = {
    Name = "secrets-manager-key"
  }
}

resource "aws_kms_alias" "secrets" {
  name          = "alias/secrets-manager"
  target_key_id = aws_kms_key.secrets.key_id
}

# Política de la KMS key
resource "aws_kms_key_policy" "secrets" {
  key_id = aws_kms_key.secrets.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::123456789012:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow Secrets Manager to use the key"
        Effect = "Allow"
        Principal = {
          Service = "secretsmanager.amazonaws.com"
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = "*"
      },
      {
        Sid    = "Allow EC2 instances to decrypt"
        Effect = "Allow"
        Principal = {
          AWS = aws_iam_role.ec2_app.arn
        }
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "kms:ViaService" = "secretsmanager.us-east-1.amazonaws.com"
          }
        }
      }
    ]
  })
}

# Usar KMS key en el secreto
resource "aws_secretsmanager_secret" "db_credentials" {
  name       = "prod/db/mysql"
  kms_key_id = aws_kms_key.secrets.id
}
```

#### 2. Políticas de Recursos

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:role/ec2-app-role"
      },
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "secretsmanager:VersionStage": "AWSCURRENT"
        },
        "IpAddress": {
          "aws:SourceIp": "10.0.0.0/16"
        }
      }
    },
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "secretsmanager:DeleteSecret",
      "Resource": "*"
    }
  ]
}
```

#### 3. VPC Endpoints

```hcl
# VPC Endpoint para Secrets Manager
resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.us-east-1.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  
  private_dns_enabled = true
  
  tags = {
    Name = "secretsmanager-endpoint"
  }
}

# Security Group para VPC Endpoint
resource "aws_security_group" "vpc_endpoints" {
  name        = "vpc-endpoints-sg"
  description = "Security group para VPC endpoints"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description     = "HTTPS desde instancias EC2"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_app.id]
  }
  
  tags = {
    Name = "vpc-endpoints-sg"
  }
}
```

**Beneficios de VPC Endpoints:**
- 🔒 Tráfico no sale de la VPC
- 💰 Reduce costos de transferencia de datos
- 🚀 Mejor rendimiento
- 🛡️ Mayor seguridad

---

### Monitoreo y Auditoría

#### 1. CloudWatch Alarms

```hcl
# Alarma para accesos no autorizados
resource "aws_cloudwatch_metric_alarm" "unauthorized_access" {
  alarm_name          = "secrets-manager-unauthorized-access"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "UnauthorizedAccess"
  namespace           = "AWS/SecretsManager"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "Alerta cuando hay intentos de acceso no autorizados"
  alarm_actions       = [aws_sns_topic.security_alerts.arn]
  
  dimensions = {
    SecretId = aws_secretsmanager_secret.db_credentials.id
  }
}
```

#### 2. CloudTrail Monitoring

```python
"""
Lambda para monitorear eventos de Secrets Manager en CloudTrail
"""
import json
import boto3

sns = boto3.client('sns')
SNS_TOPIC_ARN = 'arn:aws:sns:us-east-1:123456789012:security-alerts'

# Eventos críticos a monitorear
CRITICAL_EVENTS = [
    'DeleteSecret',
    'PutSecretValue',
    'UpdateSecret',
    'RestoreSecret',
    'RemoveRegionsFromReplication'
]

def lambda_handler(event, context):
    """
    Procesa eventos de CloudTrail
    """
    for record in event['Records']:
        # Parsear mensaje de CloudTrail
        message = json.loads(record['Sns']['Message'])
        detail = message['detail']
        
        event_name = detail['eventName']
        user_identity = detail['userIdentity']
        source_ip = detail['sourceIPAddress']
        
        # Verificar si es un evento crítico
        if event_name in CRITICAL_EVENTS:
            # Extraer información del secreto
            secret_id = None
            if 'requestParameters' in detail:
                secret_id = detail['requestParameters'].get('secretId')
            
            # Enviar alerta
            alert_message = f"""
            🚨 ALERTA DE SEGURIDAD - Secrets Manager
            
            Evento: {event_name}
            Secreto: {secret_id}
            Usuario: {user_identity.get('principalId', 'Unknown')}
            IP Origen: {source_ip}
            Región: {detail['awsRegion']}
            Timestamp: {detail['eventTime']}
            
            Detalles completos:
            {json.dumps(detail, indent=2)}
            """
            
            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Subject=f'Alerta: {event_name} en Secrets Manager',
                Message=alert_message
            )
            
            print(f"Alerta enviada para evento: {event_name}")
    
    return {
        'statusCode': 200,
        'body': 'Eventos procesados'
    }
```

#### 3. EventBridge Rules

```hcl
# Regla de EventBridge para cambios en secretos
resource "aws_cloudwatch_event_rule" "secrets_changes" {
  name        = "secrets-manager-changes"
  description = "Captura cambios en Secrets Manager"
  
  event_pattern = jsonencode({
    source      = ["aws.secretsmanager"]
    detail-type = ["AWS API Call via CloudTrail"]
    detail = {
      eventName = [
        "PutSecretValue",
        "UpdateSecret",
        "DeleteSecret",
        "RestoreSecret",
        "RotateSecret"
      ]
    }
  })
}

resource "aws_cloudwatch_event_target" "lambda" {
  rule      = aws_cloudwatch_event_rule.secrets_changes.name
  target_id = "SendToLambda"
  arn       = aws_lambda_function.secrets_monitor.arn
}
```

#### 4. Dashboard de CloudWatch

```python
"""
Script para crear dashboard de Secrets Manager
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
                    ["AWS/SecretsManager", "GetSecretValue", {"stat": "Sum"}],
                    [".", "RotateSecret", {"stat": "Sum"}],
                    [".", "PutSecretValue", {"stat": "Sum"}]
                ],
                "period": 300,
                "stat": "Sum",
                "region": "us-east-1",
                "title": "Secrets Manager API Calls",
                "yAxis": {
                    "left": {
                        "min": 0
                    }
                }
            }
        },
        {
            "type": "log",
            "properties": {
                "query": """
                    SOURCE '/aws/lambda/secrets-rotation'
                    | fields @timestamp, @message
                    | filter @message like /ERROR/
                    | sort @timestamp desc
                    | limit 20
                """,
                "region": "us-east-1",
                "title": "Rotation Errors"
            }
        }
    ]
}

response = cloudwatch.put_dashboard(
    DashboardName='SecretsManager-Monitoring',
    DashboardBody=json.dumps(dashboard_body)
)

print(f"Dashboard creado: {response['DashboardValidationMessages']}")
```

📚 [Monitoring Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/monitoring.html)

---

## 6️⃣ Optimización de Costos

### Estructura de Costos

| Componente | Costo |
|------------|-------|
| **Secreto almacenado** | $0.40/mes por secreto |
| **API calls** | $0.05 por 10,000 llamadas |
| **Rotación** | Sin costo adicional (usa Lambda) |
| **Replicación** | $0.40/mes por réplica |

### Estrategias de Optimización

#### 1. Caché de Secretos

**❌ Sin caché - Costoso:**
```python
# Cada request obtiene el secreto (muchas llamadas API)
def handle_request():
    secret = get_secret('prod/db/mysql')  # API call
    connection = connect_db(secret)
    # ... proceso
```

**✅ Con caché - Optimizado:**
```python
import time
from functools import lru_cache

# Caché con TTL
class SecretCache:
    def __init__(self, ttl=300):  # 5 minutos
        self.cache = {}
        self.ttl = ttl
    
    def get_secret(self, secret_name):
        now = time.time()
        
        # Verificar si está en caché y no ha expirado
        if secret_name in self.cache:
            secret, timestamp = self.cache[secret_name]
            if now - timestamp < self.ttl:
                print(f"Usando secreto desde caché: {secret_name}")
                return secret
        
        # Obtener desde Secrets Manager
        print(f"Obteniendo secreto desde API: {secret_name}")
        secret = get_secret_from_api(secret_name)
        self.cache[secret_name] = (secret, now)
        
        return secret

# Uso
cache = SecretCache(ttl=300)

def handle_request():
    secret = cache.get_secret('prod/db/mysql')  # Solo 1 API call cada 5 min
    connection = connect_db(secret)
    # ... proceso
```

#### 2. AWS Secrets Manager Caching Library

**Python:**
```python
from aws_secretsmanager_caching import SecretCache, SecretCacheConfig

# Configurar caché
cache_config = SecretCacheConfig(
    max_cache_size=100,
    secret_refresh_interval=3600,  # 1 hora
    secret_version_stage='AWSCURRENT'
)

cache = SecretCache(config=cache_config)

def get_db_connection():
    # Obtiene desde caché automáticamente
    secret_json = cache.get_secret_string('prod/db/mysql')
    credentials = json.loads(secret_json)
    
    return pymysql.connect(
        host=credentials['host'],
        user=credentials['username'],
        password=credentials['password'],
        database=credentials['dbname']
    )
```

**Java:**
```java
import com.amazonaws.secretsmanager.caching.SecretCache;

public class DatabaseConnection {
    private static final SecretCache cache = new SecretCache();
    
    public Connection getConnection() throws Exception {
        // Obtiene desde caché automáticamente
        String secretString = cache.getSecretString("prod/db/mysql");
        JsonNode credentials = new ObjectMapper().readTree(secretString);
        
        return DriverManager.getConnection(
            String.format("jdbc:mysql://%s:%d/%s",
                credentials.get("host").asText(),
                credentials.get("port").asInt(),
                credentials.get("dbname").asText()
            ),
            credentials.get("username").asText(),
            credentials.get("password").asText()
        );
    }
}
```

#### 3. Consolidación de Secretos

**❌ Múltiples secretos - Más costoso:**
```
prod/db/mysql/username     → $0.40/mes
prod/db/mysql/password     → $0.40/mes
prod/db/mysql/host         → $0.40/mes
prod/db/mysql/port         → $0.40/mes
Total: $1.60/mes
```

**✅ Secreto consolidado - Más económico:**
```json
prod/db/mysql → $0.40/mes
{
  "username": "admin",
  "password": "SecurePassword123!",
  "host": "prod-mysql-db.cluster-xxxxx.us-east-1.rds.amazonaws.com",
  "port": 3306,
  "dbname": "production"
}
```

#### 4. Usar Parameter Store para Configuración

**Separar secretos de configuración:**

```
Secrets Manager (datos sensibles):
✅ prod/db/mysql/credentials → $0.40/mes

Parameter Store (configuración):
✅ /prod/db/mysql/connection-pool-size → Gratis
✅ /prod/db/mysql/timeout → Gratis
✅ /prod/db/mysql/max-connections → Gratis
```

### Calculadora de Costos

```python
def calculate_secrets_manager_cost(
    num_secrets,
    api_calls_per_month,
    num_replicas=0
):
    """
    Calcula el costo mensual de Secrets Manager
    
    Args:
        num_secrets: Número de secretos
        api_calls_per_month: Llamadas API por mes
        num_replicas: Número de réplicas por secreto
    
    Returns:
        dict: Desglose de costos
    """
    # Costos
    COST_PER_SECRET = 0.40
    COST_PER_10K_CALLS = 0.05
    COST_PER_REPLICA = 0.40
    
    # Cálculos
    storage_cost = num_secrets * COST_PER_SECRET
    api_cost = (api_calls_per_month / 10000) * COST_PER_10K_CALLS
    replica_cost = num_secrets * num_replicas * COST_PER_REPLICA
    
    total_cost = storage_cost + api_cost + replica_cost
    
    return {
        'storage_cost': round(storage_cost, 2),
        'api_cost': round(api_cost, 2),
        'replica_cost': round(replica_cost, 2),
        'total_monthly_cost': round(total_cost, 2)
    }

# Ejemplo
costs = calculate_secrets_manager_cost(
    num_secrets=10,
    api_calls_per_month=1000000,  # 1M llamadas
    num_replicas=1
)

print(f"""
Desglose de Costos Mensuales:
- Almacenamiento: ${costs['storage_cost']}
- API Calls: ${costs['api_cost']}
- Réplicas: ${costs['replica_cost']}
- TOTAL: ${costs['total_monthly_cost']}
""")

# Output:
# Desglose de Costos Mensuales:
# - Almacenamiento: $4.00
# - API Calls: $5.00
# - Réplicas: $4.00
# - TOTAL: $13.00
```

---

## 7️⃣ Troubleshooting

### Problemas Comunes

#### 1. Error: AccessDeniedException

**Síntoma:**
```
botocore.exceptions.ClientError: An error occurred (AccessDeniedException) 
when calling the GetSecretValue operation: User is not authorized to 
perform: secretsmanager:GetSecretValue on resource: prod/db/mysql
```

**Soluciones:**

✅ **Verificar IAM Policy:**
```bash
# Ver políticas del role
aws iam list-attached-role-policies --role-name ec2-app-role

# Ver política inline
aws iam get-role-policy --role-name ec2-app-role --policy-name secrets-access
```

✅ **Verificar Resource Policy del secreto:**
```bash
aws secretsmanager get-resource-policy --secret-id prod/db/mysql
```

✅ **Verificar permisos de KMS:**
```bash
aws kms get-key-policy --key-id alias/secrets-manager --policy-name default
```

#### 2. Error: ResourceNotFoundException

**Síntoma:**
```
ResourceNotFoundException: Secrets Manager can't find the specified secret.
```

**Soluciones:**

✅ **Verificar nombre del secreto:**
```bash
# Listar secretos
aws secretsmanager list-secrets

# Buscar por nombre
aws secretsmanager list-secrets --filters Key=name,Values=prod/db/mysql
```

✅ **Verificar región:**
```python
# Especificar región explícitamente
client = boto3.client('secretsmanager', region_name='us-east-1')
```

#### 3. Error: DecryptionFailure

**Síntoma:**
```
DecryptionFailureException: Secrets Manager can't decrypt the protected 
secret text using the provided KMS key.
```

**Soluciones:**

✅ **Verificar permisos de KMS:**
```json
{
  "Effect": "Allow",
  "Action": [
    "kms:Decrypt",
    "kms:DescribeKey"
  ],
  "Resource": "arn:aws:kms:us-east-1:123456789012:key/abcd1234",
  "Condition": {
    "StringEquals": {
      "kms:ViaService": "secretsmanager.us-east-1.amazonaws.com"
    }
  }
}
```

✅ **Verificar estado de la KMS key:**
```bash
aws kms describe-key --key-id alias/secrets-manager
```

#### 4. Conexión a RDS Falla

**Síntoma:**
```
pymysql.err.OperationalError: (2003, "Can't connect to MySQL server")
```

**Checklist de troubleshooting:**

- [ ] **Security Groups**: ¿EC2 puede conectarse al puerto 3306 de RDS?
- [ ] **Network ACLs**: ¿Permiten tráfico en ambas direcciones?
- [ ] **Subnets**: ¿EC2 y RDS están en subnets con routing correcto?
- [ ] **DNS**: ¿El hostname de RDS resuelve correctamente?
- [ ] **Credenciales**: ¿Son correctas y están actualizadas?

```bash
# Verificar conectividad desde EC2
telnet prod-mysql-db.cluster-xxxxx.us-east-1.rds.amazonaws.com 3306

# Verificar DNS
nslookup prod-mysql-db.cluster-xxxxx.us-east-1.rds.amazonaws.com

# Verificar Security Groups
aws ec2 describe-security-groups --group-ids sg-0123456789abcdef0
```

#### 5. Rotación Falla

**Síntoma:**
```
RotationFailed: The rotation failed because the Lambda function returned an error
```

**Soluciones:**

✅ **Verificar logs de Lambda:**
```bash
aws logs tail /aws/lambda/SecretsManagerRDSMySQLRotation --follow
```

✅ **Verificar permisos de Lambda:**
- Acceso a Secrets Manager
- Acceso a RDS (si cambia contraseña)
- Acceso a VPC (si RDS está en VPC privada)

✅ **Verificar configuración de VPC en Lambda:**
```bash
aws lambda get-function-configuration \
  --function-name SecretsManagerRDSMySQLRotation
```

### Script de Diagnóstico

```bash
#!/bin/bash
# Script de diagnóstico para Secrets Manager

SECRET_NAME="prod/db/mysql"
REGION="us-east-1"

echo "=== Diagnóstico de Secrets Manager ==="
echo ""

# 1. Verificar que el secreto existe
echo "1. Verificando existencia del secreto..."
aws secretsmanager describe-secret \
  --secret-id "$SECRET_NAME" \
  --region "$REGION" \
  --output json || echo "❌ Secreto no encontrado"

echo ""

# 2. Verificar permisos IAM
echo "2. Verificando permisos IAM..."
INSTANCE_ID=$(ec2-metadata --instance-id | cut -d " " -f 2)
IAM_ROLE=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --query 'Reservations[0].Instances[0].IamInstanceProfile.Arn' \
  --output text | cut -d "/" -f 2)

echo "IAM Role: $IAM_ROLE"
aws iam list-attached-role-policies --role-name "$IAM_ROLE"

echo ""

# 3. Intentar obtener el secreto
echo "3. Intentando obtener el secreto..."
aws secretsmanager get-secret-value \
  --secret-id "$SECRET_NAME" \
  --region "$REGION" \
  --query 'SecretString' \
  --output text || echo "❌ No se pudo obtener el secreto"

echo ""

# 4. Verificar conectividad a RDS
echo "4. Verificando conectividad a RDS..."
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_NAME" \
  --region "$REGION" \
  --query 'SecretString' \
  --output text)

DB_HOST=$(echo "$SECRET_JSON" | jq -r '.host')
DB_PORT=$(echo "$SECRET_JSON" | jq -r '.port')

echo "Probando conexión a $DB_HOST:$DB_PORT..."
timeout 5 bash -c "cat < /dev/null > /dev/tcp/$DB_HOST/$DB_PORT" \
  && echo "✅ Conectividad OK" \
  || echo "❌ No se puede conectar"

echo ""
echo "=== Diagnóstico completado ==="
```

📚 [Troubleshooting Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/troubleshoot.html)

---

## 8️⃣ Casos de Uso Avanzados

### Multi-Región (Disaster Recovery)

#### Replicación de Secretos

```hcl
# Secreto con replicación multi-región
resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "prod/db/mysql"
  description = "Credenciales de base de datos con replicación DR"
  
  replica {
    region     = "us-west-2"
    kms_key_id = aws_kms_key.secrets_west.id
  }
  
  replica {
    region     = "eu-west-1"
    kms_key_id = aws_kms_key.secrets_eu.id
  }
  
  tags = {
    Environment = "production"
    DR          = "enabled"
  }
}
```

```python
"""
Aplicación con failover automático entre regiones
"""
import boto3
from botocore.exceptions import ClientError

REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1']
SECRET_NAME = 'prod/db/mysql'

def get_secret_with_failover(secret_name, regions):
    """
    Intenta obtener el secreto de múltiples regiones con failover
    """
    for region in regions:
        try:
            print(f"Intentando obtener secreto desde {region}...")
            client = boto3.client('secretsmanager', region_name=region)
            
            response = client.get_secret_value(SecretId=secret_name)
            secret = json.loads(response['SecretString'])
            
            print(f"✅ Secreto obtenido desde {region}")
            return secret, region
            
        except ClientError as e:
            print(f"❌ Error en {region}: {e.response['Error']['Code']}")
            continue
    
    raise Exception("No se pudo obtener el secreto de ninguna región")

# Uso
try:
    credentials, active_region = get_secret_with_failover(SECRET_NAME, REGIONS)
    print(f"Usando credenciales de región: {active_region}")
except Exception as e:
    print(f"Error fatal: {e}")
```

---

### Secretos para Múltiples Entornos

```python
"""
Gestión de secretos por entorno
"""
import os
import boto3
import json

class SecretsManager:
    def __init__(self):
        self.environment = os.getenv('ENVIRONMENT', 'dev')
        self.client = boto3.client('secretsmanager')
    
    def get_secret(self, service, resource):
        """
        Obtiene secreto basado en el entorno
        
        Patrón: {environment}/{service}/{resource}
        Ejemplo: prod/db/mysql, staging/api/stripe, dev/cache/redis
        """
        secret_name = f"{self.environment}/{service}/{resource}"
        
        try:
            response = self.client.get_secret_value(SecretId=secret_name)
            return json.loads(response['SecretString'])
        except self.client.exceptions.ResourceNotFoundException:
            # Fallback a secreto por defecto
            default_secret = f"default/{service}/{resource}"
            print(f"Secreto {secret_name} no encontrado, usando {default_secret}")
            response = self.client.get_secret_value(SecretId=default_secret)
            return json.loads(response['SecretString'])
    
    def get_database_credentials(self, db_name):
        """Obtiene credenciales de base de datos"""
        return self.get_secret('db', db_name)
    
    def get_api_key(self, service_name):
        """Obtiene API key de servicio externo"""
        return self.get_secret('api', service_name)
    
    def get_cache_credentials(self, cache_type):
        """Obtiene credenciales de caché"""
        return self.get_secret('cache', cache_type)

# Uso
secrets = SecretsManager()

# Obtiene prod/db/mysql en producción, dev/db/mysql en desarrollo
db_creds = secrets.get_database_credentials('mysql')

# Obtiene prod/api/stripe en producción
stripe_key = secrets.get_api_key('stripe')

# Obtiene prod/cache/redis en producción
redis_creds = secrets.get_cache_credentials('redis')
```

---

### Integración con CI/CD

#### GitHub Actions

```yaml
name: Deploy Application

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-role
          aws-region: us-east-1
      
      - name: Get Database Credentials
        id: secrets
        run: |
          SECRET_JSON=$(aws secretsmanager get-secret-value \
            --secret-id prod/db/mysql \
            --query SecretString \
            --output text)
          
          echo "DB_HOST=$(echo $SECRET_JSON | jq -r '.host')" >> $GITHUB_OUTPUT
          echo "DB_USER=$(echo $SECRET_JSON | jq -r '.username')" >> $GITHUB_OUTPUT
          # No exponer password en logs
          echo "::add-mask::$(echo $SECRET_JSON | jq -r '.password')"
      
      - name: Run Database Migrations
        env:
          DB_HOST: ${{ steps.secrets.outputs.DB_HOST }}
          DB_USER: ${{ steps.secrets.outputs.DB_USER }}
        run: |
          # Obtener password de forma segura
          DB_PASSWORD=$(aws secretsmanager get-secret-value \
            --secret-id prod/db/mysql \
            --query SecretString \
            --output text | jq -r '.password')
          
          # Ejecutar migraciones
          ./run-migrations.sh
```

#### GitLab CI

```yaml
deploy:
  stage: deploy
  image: amazon/aws-cli:latest
  
  before_script:
    - apk add --no-cache jq mysql-client
  
  script:
    # Obtener credenciales
    - |
      SECRET_JSON=$(aws secretsmanager get-secret-value \
        --secret-id prod/db/mysql \
        --region us-east-1 \
        --query SecretString \
        --output text)
    
    - export DB_HOST=$(echo $SECRET_JSON | jq -r '.host')
    - export DB_USER=$(echo $SECRET_JSON | jq -r '.username')
    - export DB_PASSWORD=$(echo $SECRET_JSON | jq -r '.password')
    - export DB_NAME=$(echo $SECRET_JSON | jq -r '.dbname')
    
    # Ejecutar migraciones
    - |
      mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < migrations.sql
  
  only:
    - main
```

---

### Secretos para Contenedores (ECS/EKS)

#### Amazon ECS

```json
{
  "family": "app-task",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecs-task-role",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecs-execution-role",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/app:latest",
      "secrets": [
        {
          "name": "DB_HOST",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:prod/db/mysql:host::"
        },
        {
          "name": "DB_USERNAME",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:prod/db/mysql:username::"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:prod/db/mysql:password::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Amazon EKS (Kubernetes)

```yaml
# secrets-store-csi-driver con AWS provider
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: aws-secrets
  namespace: production
spec:
  provider: aws
  parameters:
    objects: |
      - objectName: "prod/db/mysql"
        objectType: "secretsmanager"
        jmesPath:
          - path: username
            objectAlias: db_username
          - path: password
            objectAlias: db_password
          - path: host
            objectAlias: db_host
          - path: port
            objectAlias: db_port
---
apiVersion: v1
kind: Pod
metadata:
  name: app-pod
  namespace: production
spec:
  serviceAccountName: app-service-account
  containers:
    - name: app
      image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/app:latest
      env:
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: db_username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: db_password
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: db_host
      volumeMounts:
        - name: secrets-store
          mountPath: "/mnt/secrets"
          readOnly: true
  volumes:
    - name: secrets-store
      csi:
        driver: secrets-store.csi.k8s.io
        readOnly: true
        volumeAttributes:
          secretProviderClass: "aws-secrets"
```

---

### Secretos para Lambda

```python
"""
Lambda function que usa Secrets Manager con caché
"""
import json
import os
import boto3
from aws_secretsmanager_caching import SecretCache

# Inicializar caché fuera del handler (reutilización entre invocaciones)
cache = SecretCache()
SECRET_NAME = os.environ['SECRET_NAME']

def lambda_handler(event, context):
    """
    Handler de Lambda con caché de secretos
    """
    # Obtener secreto (usa caché automáticamente)
    secret_json = cache.get_secret_string(SECRET_NAME)
    credentials = json.loads(secret_json)
    
    # Conectar a base de datos
    connection = pymysql.connect(
        host=credentials['host'],
        user=credentials['username'],
        password=credentials['password'],
        database=credentials['dbname']
    )
    
    try:
        with connection.cursor() as cursor:
            # Ejecutar query
            cursor.execute("SELECT COUNT(*) FROM users")
            result = cursor.fetchone()
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'user_count': result[0]
                })
            }
    finally:
        connection.close()
```

```hcl
# Terraform: Lambda con acceso a Secrets Manager
resource "aws_lambda_function" "app" {
  filename      = "lambda.zip"
  function_name = "app-function"
  role          = aws_iam_role.lambda.arn
  handler       = "index.lambda_handler"
  runtime       = "python3.11"
  timeout       = 30
  
  environment {
    variables = {
      SECRET_NAME = aws_secretsmanager_secret.db_credentials.name
    }
  }
  
  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# IAM Role para Lambda
resource "aws_iam_role_policy" "lambda_secrets" {
  role = aws_iam_role.lambda.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_secretsmanager_secret.db_credentials.arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = aws_kms_key.secrets.arn
      }
    ]
  })
}
```

📚 [Using Secrets Manager with Lambda](https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_lambda.html)

---

## 9️⃣ Comparación con Alternativas

### Secrets Manager vs Parameter Store vs HashiCorp Vault

| Característica | Secrets Manager | Parameter Store | HashiCorp Vault |
|----------------|-----------------|-----------------|-----------------|
| **Rotación automática** | ✅ Nativa | ❌ No | ✅ Sí |
| **Integración RDS** | ✅ Nativa | ⚠️ Manual | ⚠️ Manual |
| **Costo** | $0.40/secreto/mes | Gratis (Standard) | Self-hosted o Enterprise |
| **Versionado** | ✅ Automático | ✅ Sí | ✅ Sí |
| **Auditoría** | ✅ CloudTrail | ✅ CloudTrail | ✅ Audit logs |
| **Multi-cloud** | ❌ Solo AWS | ❌ Solo AWS | ✅ Sí |
| **Cifrado** | ✅ Obligatorio (KMS) | ⚠️ Opcional | ✅ Sí |
| **API calls** | $0.05/10K | Gratis | Incluido |
| **Complejidad** | 🟢 Baja | 🟢 Baja | 🔴 Alta |
| **Mantenimiento** | 🟢 Gestionado | 🟢 Gestionado | 🔴 Self-hosted |

### Cuándo Usar Cada Uno

**✅ Usar Secrets Manager cuando:**
- Necesitas rotación automática de credenciales
- Trabajas con RDS, DocumentDB, Redshift
- Requieres compliance estricto
- El costo no es una restricción principal

**✅ Usar Parameter Store cuando:**
- Almacenas configuración de aplicación
- Necesitas parámetros jerárquicos
- El presupuesto es limitado
- No requieres rotación automática

**✅ Usar HashiCorp Vault cuando:**
- Necesitas multi-cloud
- Requieres características avanzadas (dynamic secrets, PKI)
- Tienes equipo para gestionar infraestructura
- Necesitas control total sobre el sistema

---

## 🔟 Checklist de Implementación

### Fase 1: Configuración Inicial (Día 1)

- [ ] **Crear KMS key** dedicada para Secrets Manager
- [ ] **Habilitar rotación automática** de KMS key
- [ ] **Crear secreto** en Secrets Manager con estructura JSON
- [ ] **Configurar tags** según política de la organización
- [ ] **Crear IAM roles** para EC2/ECS/Lambda
- [ ] **Configurar políticas IAM** con principio de mínimo privilegio
- [ ] **Documentar** nomenclatura de secretos

### Fase 2: Integración con Aplicación (Día 2-3)

- [ ] **Instalar SDK** de AWS en la aplicación
- [ ] **Implementar caché** de secretos (5-15 minutos TTL)
- [ ] **Actualizar código** para obtener credenciales de Secrets Manager
- [ ] **Eliminar credenciales hardcodeadas** del código
- [ ] **Probar en entorno de desarrollo**
- [ ] **Configurar manejo de errores** y reintentos
- [ ] **Implementar logging** (sin exponer secretos)

### Fase 3: Seguridad y Red (Día 4)

- [ ] **Crear VPC Endpoint** para Secrets Manager
- [ ] **Configurar Security Groups** para VPC Endpoint
- [ ] **Implementar resource policies** en secretos
- [ ] **Configurar políticas de KMS** con condiciones
- [ ] **Validar que tráfico** no sale de la VPC
- [ ] **Probar conectividad** desde instancias privadas

### Fase 4: Rotación (Semana 2)

- [ ] **Configurar rotación automática** (30 días)
- [ ] **Crear/configurar Lambda** de rotación
- [ ] **Probar rotación** en entorno de desarrollo
- [ ] **Validar que aplicación** maneja rotación sin downtime
- [ ] **Configurar alarmas** para fallos de rotación
- [ ] **Documentar procedimiento** de rollback

### Fase 5: Monitoreo y Auditoría (Semana 2-3)

- [ ] **Habilitar CloudTrail** para Secrets Manager
- [ ] **Crear alarmas CloudWatch** para eventos críticos
- [ ] **Configurar EventBridge rules** para cambios
- [ ] **Crear dashboard** de monitoreo
- [ ] **Implementar alertas SNS** para equipo de seguridad
- [ ] **Configurar logs** de acceso a secretos

### Fase 6: Optimización (Mes 2)

- [ ] **Implementar caché avanzado** con librería oficial
- [ ] **Consolidar secretos** relacionados
- [ ] **Revisar costos** y optimizar llamadas API
- [ ] **Implementar replicación** multi-región (si aplica)
- [ ] **Automatizar gestión** de secretos con IaC
- [ ] **Capacitar al equipo** en mejores prácticas

---

## 📊 Métricas de Éxito

### KPIs de Seguridad

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Credenciales hardcodeadas** | 0 | Escaneo de código |
| **Rotación de secretos** | 100% cada 30 días | CloudWatch Metrics |
| **Tiempo de detección de acceso no autorizado** | < 5 minutos | CloudTrail + EventBridge |
| **Secretos sin cifrar** | 0 | AWS Config Rules |
| **Fallos de rotación** | < 1% | CloudWatch Alarms |

### KPIs de Operación

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| **Latencia de obtención de secretos** | < 100ms (con caché) | CloudWatch Logs |
| **Disponibilidad** | 99.9% | CloudWatch Metrics |
| **Costo por secreto** | < $1/mes | Cost Explorer |
| **Tiempo de recuperación ante fallo** | < 15 minutos | Simulacros |

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [AWS Secrets Manager Documentation](https://docs.aws.amazon.com/secretsmanager/)
- [Best Practices for Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)
- [Rotating Secrets](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html)
- [Secrets Manager Pricing](https://aws.amazon.com/secrets-manager/pricing/)

### SDKs y Librerías

- [AWS SDK for Python (Boto3)](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/secretsmanager.html)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SecretsManager.html)
- [AWS SDK for Java](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/examples-secretsmanager.html)
- [Secrets Manager Caching Libraries](https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets_cache-ref.html)

### Herramientas

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/reference/secretsmanager/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/secretsmanager_secret)
- [CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-secretsmanager-secret.html)
- [AWS CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_secretsmanager-readme.html)

### Blogs y Tutoriales

- [How to use AWS Secrets Manager to securely store and rotate database credentials](https://aws.amazon.com/blogs/security/how-to-use-aws-secrets-manager-securely-store-rotate-ssh-key-pairs/)
- [Rotate Amazon RDS database credentials automatically](https://aws.amazon.com/blogs/security/rotate-amazon-rds-database-credentials-automatically-with-aws-secrets-manager/)
- [Best practices for managing secrets in AWS](https://aws.amazon.com/blogs/mt/the-right-way-to-store-secrets-using-parameter-store/)

### Compliance y Seguridad

- [AWS Security Best Practices](https://aws.amazon.com/architecture/security-identity-compliance/)
- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services)
- [PCI DSS on AWS](https://aws.amazon.com/compliance/pci-dss-level-1-faqs/)
- [HIPAA Compliance](https://aws.amazon.com/compliance/hipaa-compliance/)

---

## 📝 Notas Finales

Esta guía proporciona una implementación completa de AWS Secrets Manager para gestionar credenciales de forma segura. Recuerde que:

- 🔐 **Nunca hardcodee credenciales** en el código o archivos de configuración
- 🔄 **Implemente rotación automática** para cumplir con políticas de seguridad
- 📊 **Monitoree el acceso** a secretos para detectar anomalías
- 💰 **Optimice costos** usando caché y consolidando secretos
- 🧪 **Pruebe la rotación** regularmente en entornos no productivos
- 📋 **Documente todo** - procedimientos, excepciones, arquitectura
- 🎓 **Capacite al equipo** en mejores prácticas de gestión de secretos

**La gestión segura de credenciales es fundamental para la seguridad de su infraestructura.**

---

## 🤝 Ejemplo Completo End-to-End

### Arquitectura Final

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Account                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    VPC: 10.0.0.0/16                    │    │
│  │                                                        │    │
│  │  ┌──────────────┐         ┌──────────────┐           │    │
│  │  │ Public       │         │ Private      │           │    │
│  │  │ Subnet       │         │ Subnet       │           │    │
│  │  │              │         │              │           │    │
│  │  │ ┌──────────┐ │         │ ┌──────────┐ │           │    │
│  │  │ │   ALB    │ │         │ │   EC2    │ │           │    │
│  │  │ │          │─┼─────────┼▶│  + IAM   │ │           │    │
│  │  │ └──────────┘ │         │ │   Role   │ │           │    │
│  │  │              │         │ └────┬─────┘ │           │    │
│  │  └──────────────┘         │      │       │           │    │
│  │                           │      │       │           │    │
│  │                           │      │       │           │    │
│  │  ┌──────────────┐         │      │       │           │    │
│  │  │ Private      │         │      │       │           │    │
│  │  │ Subnet       │         │      │       │           │    │
│  │  │              │         │      │       │           │    │
│  │  │ ┌──────────┐ │         │      │       │           │    │
│  │  │ │   RDS    │◀┼─────────┼──────┘       │           │    │
│  │  │ │  MySQL   │ │         │              │           │    │
│  │  │ └──────────┘ │         │              │           │    │
│  │  └──────────────┘         └──────────────┘           │    │
│  │                                                        │    │
│  │  ┌──────────────────────────────────────────────┐    │    │
│  │  │         VPC Endpoint                         │    │    │
│  │  │         (Secrets Manager)                    │    │    │
│  │  └──────────────────────────────────────────────┘    │    │
│  │                           ▲                           │    │
│  └───────────────────────────┼───────────────────────────┘    │
│                              │                                │
│                              │ Private Link                   │
│                              │                                │
│  ┌───────────────────────────┼───────────────────────────┐   │
│  │                           │                           │   │
│  │    ┌──────────────────────┴────────────────────┐     │   │
│  │    │      AWS Secrets Manager                  │     │   │
│  │    │                                           │     │   │
│  │    │  Secret: prod/db/mysql                   │     │   │
│  │    │  {                                        │     │   │
│  │    │    "username": "admin",                  │     │   │
│  │    │    "password": "***",                    │     │   │
│  │    │    "host": "prod-mysql.xxx.rds...",     │     │   │
│  │    │    "port": 3306,                         │     │   │
│  │    │    "dbname": "production"                │     │   │
│  │    │  }                                        │     │   │
│  │    │                                           │     │   │
│  │    │  Encrypted with KMS                       │     │   │
│  │    │  Auto-rotation: 30 days                   │     │   │
│  │    └───────────────────────────────────────────┘     │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │              Monitoring & Logging                     │   │
│  │                                                       │   │
│  │  CloudTrail → CloudWatch Logs → EventBridge → SNS    │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

Este ejemplo completo demuestra una arquitectura segura y escalable usando AWS Secrets Manager para gestionar credenciales entre EC2 y RDS.

---

**Versión**: 1.0  
**Última actualización**: Febrero 2026  
**Próxima revisión**: Mayo 2026

---

*Esta guía debe adaptarse a los requisitos específicos de su organización y cumplimiento regulatorio. Para implementación técnica detallada, consulte con su equipo de arquitectos de seguridad.*
