---
sidebar_label: "Starter Kit - Networking"
sidebar_position: 1
---

<div align="center">

# 🌐 Networking Starter Kit - Buenas Prácticas

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![VPC](https://img.shields.io/badge/VPC-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)

</div>

## 📋 Introducción

Este Starter Kit proporciona las **mejores prácticas de networking en AWS** para construir arquitecturas seguras, escalables y resilientes desde el primer día. No es una guía para principiantes, sino un conjunto de prácticas probadas para profesionales.

**Objetivo**: Implementar una base de red sólida que soporte crecimiento, seguridad y alta disponibilidad.

---

## 1️⃣ Diseño de VPC

### Arquitectura de Referencia

<details>
<summary>💡 Ver ejemplo completo</summary>

```
┌─────────────────────────────────────────────────────────────────┐
│                    VPC: 10.0.0.0/16                             │
│                    Region: us-east-1                            │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Availability Zone A                       │    │
│  │                                                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │ Public       │  │ Private      │  │ Data        │ │    │
│  │  │ Subnet       │  │ Subnet       │  │ Subnet      │ │    │
│  │  │ 10.0.1.0/24  │  │ 10.0.11.0/24 │  │ 10.0.21.0/24│ │    │
│  │  │              │  │              │  │             │ │    │
│  │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌─────────┐ │ │    │
│  │  │ │   NAT    │ │  │ │   App    │ │  │ │   RDS   │ │ │    │
│  │  │ │ Gateway  │ │  │ │  Server  │ │  │ │ Primary │ │ │    │
│  │  │ └──────────┘ │  │ └──────────┘ │  │ └─────────┘ │ │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Availability Zone B                       │    │
│  │                                                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │ Public       │  │ Private      │  │ Data        │ │    │
│  │  │ Subnet       │  │ Subnet       │  │ Subnet      │ │    │
│  │  │ 10.0.2.0/24  │  │ 10.0.12.0/24 │  │ 10.0.22.0/24│ │    │
│  │  │              │  │              │  │             │ │    │
│  │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌─────────┐ │ │    │
│  │  │ │   NAT    │ │  │ │   App    │ │  │ │   RDS   │ │ │    │
│  │  │ │ Gateway  │ │  │ │  Server  │ │  │ │ Standby │ │ │    │
│  │  │ └──────────┘ │  │ └──────────┘ │  │ └─────────┘ │ │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Availability Zone C                       │    │
│  │                                                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │ Public       │  │ Private      │  │ Data        │ │    │
│  │  │ Subnet       │  │ Subnet       │  │ Subnet      │ │    │
│  │  │ 10.0.3.0/24  │  │ 10.0.13.0/24 │  │ 10.0.23.0/24│ │    │
│  │  │              │  │              │  │             │ │    │
│  │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌─────────┐ │ │    │
│  │  │ │   NAT    │ │  │ │   App    │ │  │ │   RDS   │ │ │    │
│  │  │ │ Gateway  │ │  │ │  Server  │ │  │ │  Read   │ │ │    │
│  │  │ └──────────┘ │  │ └──────────┘ │  │ │ Replica │ │ │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

</details>

### Principios de Diseño

#### 1. Planificación de CIDR

**✅ Buenas Prácticas:**

```
VPC Principal:        10.0.0.0/16    (65,536 IPs)
├── Public Subnets:   10.0.0.0/20    (4,096 IPs)
│   ├── AZ-A:         10.0.1.0/24    (256 IPs)
│   ├── AZ-B:         10.0.2.0/24    (256 IPs)
│   └── AZ-C:         10.0.3.0/24    (256 IPs)
│
├── Private Subnets:  10.0.16.0/20   (4,096 IPs)
│   ├── AZ-A:         10.0.11.0/24   (256 IPs)
│   ├── AZ-B:         10.0.12.0/24   (256 IPs)
│   └── AZ-C:         10.0.13.0/24   (256 IPs)
│
└── Data Subnets:     10.0.32.0/20   (4,096 IPs)
    ├── AZ-A:         10.0.21.0/24   (256 IPs)
    ├── AZ-B:         10.0.22.0/24   (256 IPs)
    └── AZ-C:         10.0.23.0/24   (256 IPs)
```

**Reservar espacio para crecimiento:**
```
VPC Producción:       10.0.0.0/16
VPC Staging:          10.1.0.0/16
VPC Desarrollo:       10.2.0.0/16
VPC Shared Services:  10.3.0.0/16
```

**❌ Errores Comunes:**
- Usar CIDR demasiado pequeño (/24 para VPC)
- No dejar espacio para crecimiento
- Solapar rangos entre VPCs
- Usar rangos públicos

---

#### 2. Multi-AZ por Defecto

**Siempre desplegar en al menos 2 AZs:**

- ✅ Alta disponibilidad automática
- ✅ Tolerancia a fallos de AZ
- ✅ Distribución de carga
- ✅ Cumplimiento de SLAs

**Consideraciones:**
- Usar 3 AZs para cargas críticas
- Distribuir subnets equitativamente
- NAT Gateway en cada AZ (para HA)

---

#### 3. Segregación por Capas

**Public Subnets (DMZ):**
- Load Balancers (ALB/NLB)
- NAT Gateways
- Bastion Hosts (si es necesario)
- ❌ Nunca aplicaciones o bases de datos

**Private Subnets (Aplicación):**
- Instancias EC2 de aplicación
- Contenedores ECS/EKS
- Lambda (con VPC)
- Auto Scaling Groups

**Data Subnets (Datos):**
- RDS/Aurora
- ElastiCache
- Redshift
- DocumentDB

---



📚 [VPC Best Practices](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-best-practices.html)

---

## 2️⃣ Security Groups - Defensa en Profundidad

### Estrategia de Security Groups

#### Principio de Mínimo Privilegio

**✅ Buenas Prácticas:**
- Un Security Group por función/capa
- Referencias entre Security Groups (no IPs)
- Reglas específicas (no 0.0.0.0/0 en ingress)
- Documentar cada regla

**❌ Errores Comunes:**
- Security Group "catch-all" para todo
- Abrir 0.0.0.0/0 en puertos no web
- No usar descripciones en reglas
- Mezclar funciones en un SG

---



📚 [Security Groups Best Practices](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html)

---

## 3️⃣ Network ACLs - Capa Adicional de Seguridad

### Cuándo Usar NACLs

**✅ Usar NACLs para:**
- Bloquear IPs maliciosas conocidas
- Defensa en profundidad (complemento a SGs)
- Requisitos de compliance
- Protección a nivel de subnet

**❌ No usar NACLs como:**
- Reemplazo de Security Groups
- Control de acceso granular
- Gestión de tráfico entre instancias

---


## 4️⃣ VPC Endpoints - Tráfico Privado a Servicios AWS

### ¿Por Qué Usar VPC Endpoints?

**Beneficios:**
- ✅ Tráfico no sale de la red de AWS
- ✅ Reduce costos de transferencia de datos
- ✅ Mejor rendimiento y latencia
- ✅ Mayor seguridad (no usa Internet)
- ✅ Cumplimiento de políticas de seguridad

---


📚 [VPC Endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints.html)

---

## 5️⃣ DNS y Route 53

### Zonas Privadas Hospedadas

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Zona privada para resolución interna
resource "aws_route53_zone" "private" {
  name = "internal.example.com"
  
  vpc {
    vpc_id = aws_vpc.main.id
  }
  
  tags = {
    Name        = "${var.environment}-private-zone"
    Environment = var.environment
  }
}

# Registros para servicios internos
resource "aws_route53_record" "database" {
  zone_id = aws_route53_zone.private.zone_id
  name    = "db.internal.example.com"
  type    = "CNAME"
  ttl     = 300
  records = [aws_db_instance.main.address]
}

resource "aws_route53_record" "cache" {
  zone_id = aws_route53_zone.private.zone_id
  name    = "cache.internal.example.com"
  type    = "CNAME"
  ttl     = 300
  records = [aws_elasticache_cluster.main.cache_nodes[0].address]
}

# Registro para ALB interno
resource "aws_route53_record" "internal_api" {
  zone_id = aws_route53_zone.private.zone_id
  name    = "api.internal.example.com"
  type    = "A"
  
  alias {
    name                   = aws_lb.internal.dns_name
    zone_id                = aws_lb.internal.zone_id
    evaluate_target_health = true
  }
}
```

</details>

---

### Route 53 Resolver (DNS Híbrido)

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Resolver Endpoint para consultas desde on-premise
resource "aws_route53_resolver_endpoint" "inbound" {
  name      = "${var.environment}-resolver-inbound"
  direction = "INBOUND"
  
  security_group_ids = [aws_security_group.dns_resolver.id]
  
  dynamic "ip_address" {
    for_each = slice(aws_subnet.private, 0, 2)
    content {
      subnet_id = ip_address.value.id
    }
  }
  
  tags = {
    Name        = "${var.environment}-resolver-inbound"
    Environment = var.environment
  }
}

# Resolver Endpoint para consultas a on-premise
resource "aws_route53_resolver_endpoint" "outbound" {
  name      = "${var.environment}-resolver-outbound"
  direction = "OUTBOUND"
  
  security_group_ids = [aws_security_group.dns_resolver.id]
  
  dynamic "ip_address" {
    for_each = slice(aws_subnet.private, 0, 2)
    content {
      subnet_id = ip_address.value.id
    }
  }
  
  tags = {
    Name        = "${var.environment}-resolver-outbound"
    Environment = var.environment
  }
}

# Regla para reenviar consultas a on-premise
resource "aws_route53_resolver_rule" "onprem" {
  domain_name          = "corp.example.com"
  name                 = "${var.environment}-forward-to-onprem"
  rule_type            = "FORWARD"
  resolver_endpoint_id = aws_route53_resolver_endpoint.outbound.id
  
  target_ip {
    ip = "10.1.0.10"  # DNS on-premise primario
  }
  
  target_ip {
    ip = "10.1.0.11"  # DNS on-premise secundario
  }
  
  tags = {
    Name        = "${var.environment}-forward-to-onprem"
    Environment = var.environment
  }
}

# Asociar regla con VPC
resource "aws_route53_resolver_rule_association" "main" {
  resolver_rule_id = aws_route53_resolver_rule.onprem.id
  vpc_id           = aws_vpc.main.id
}

# Security Group para Resolver
resource "aws_security_group" "dns_resolver" {
  name        = "${var.environment}-dns-resolver-sg"
  description = "Security group para Route 53 Resolver"
  vpc_id      = aws_vpc.main.id
  
  # DNS desde VPC
  ingress {
    description = "DNS desde VPC"
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  ingress {
    description = "DNS desde VPC (TCP)"
    from_port   = 53
    to_port     = 53
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  # DNS desde on-premise (para inbound)
  ingress {
    description = "DNS desde on-premise"
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = var.onprem_cidr_blocks
  }
  
  egress {
    description = "DNS a cualquier destino"
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "${var.environment}-dns-resolver-sg"
    Environment = var.environment
  }
}
```

</details>

📚 [Route 53 Resolver](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resolver.html)

---

## 6️⃣ Monitoreo y Observabilidad

### VPC Flow Logs Avanzados

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Flow Logs a S3 (más económico para retención larga)
resource "aws_flow_log" "to_s3" {
  log_destination      = aws_s3_bucket.flow_logs.arn
  log_destination_type = "s3"
  traffic_type         = "ALL"
  vpc_id               = aws_vpc.main.id
  
  log_format = "$${version} $${account-id} $${interface-id} $${srcaddr} $${dstaddr} $${srcport} $${dstport} $${protocol} $${packets} $${bytes} $${start} $${end} $${action} $${log-status} $${vpc-id} $${subnet-id} $${instance-id} $${tcp-flags} $${type} $${pkt-srcaddr} $${pkt-dstaddr} $${region} $${az-id} $${sublocation-type} $${sublocation-id} $${pkt-src-aws-service} $${pkt-dst-aws-service} $${flow-direction} $${traffic-path}"
  
  tags = {
    Name        = "${var.environment}-flow-logs-s3"
    Environment = var.environment
  }
}

# Bucket S3 para Flow Logs
resource "aws_s3_bucket" "flow_logs" {
  bucket = "${var.environment}-vpc-flow-logs-${data.aws_caller_identity.current.account_id}"
  
  tags = {
    Name        = "${var.environment}-flow-logs"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "flow_logs" {
  bucket = aws_s3_bucket.flow_logs.id
  
  rule {
    id     = "transition-to-ia"
    status = "Enabled"
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
    
    expiration {
      days = 365
    }
  }
}

resource "aws_s3_bucket_policy" "flow_logs" {
  bucket = aws_s3_bucket.flow_logs.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "AWSLogDeliveryWrite"
      Effect = "Allow"
      Principal = {
        Service = "delivery.logs.amazonaws.com"
      }
      Action   = "s3:PutObject"
      Resource = "${aws_s3_bucket.flow_logs.arn}/*"
      Condition = {
        StringEquals = {
          "s3:x-amz-acl" = "bucket-owner-full-control"
        }
      }
    },
    {
      Sid    = "AWSLogDeliveryAclCheck"
      Effect = "Allow"
      Principal = {
        Service = "delivery.logs.amazonaws.com"
      }
      Action   = "s3:GetBucketAcl"
      Resource = aws_s3_bucket.flow_logs.arn
    }]
  })
}
```

</details>

---

### CloudWatch Alarms para Networking

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Alarma: NAT Gateway con alto uso de ancho de banda
resource "aws_cloudwatch_metric_alarm" "nat_gateway_bandwidth" {
  count               = length(var.azs)
  alarm_name          = "${var.environment}-nat-gateway-bandwidth-${var.azs[count.index]}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "BytesOutToDestination"
  namespace           = "AWS/NATGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5000000000"  # 5 GB en 5 minutos
  alarm_description   = "NAT Gateway bandwidth usage is high"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    NatGatewayId = aws_nat_gateway.main[count.index].id
  }
}

# Alarma: Conexiones rechazadas en Security Groups
resource "aws_cloudwatch_log_metric_filter" "rejected_connections" {
  name           = "${var.environment}-rejected-connections"
  log_group_name = aws_cloudwatch_log_group.flow_logs.name
  
  pattern = "[version, account, eni, source, destination, srcport, destport, protocol, packets, bytes, windowstart, windowend, action=REJECT, flowlogstatus]"
  
  metric_transformation {
    name      = "RejectedConnections"
    namespace = "VPC/FlowLogs"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "rejected_connections" {
  alarm_name          = "${var.environment}-high-rejected-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "RejectedConnections"
  namespace           = "VPC/FlowLogs"
  period              = "300"
  statistic           = "Sum"
  threshold           = "100"
  alarm_description   = "High number of rejected connections"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# Alarma: Tráfico inusual desde/hacia Internet
resource "aws_cloudwatch_log_metric_filter" "unusual_traffic" {
  name           = "${var.environment}-unusual-traffic"
  log_group_name = aws_cloudwatch_log_group.flow_logs.name
  
  pattern = "[version, account, eni, source, destination, srcport, destport, protocol, packets, bytes > 1000000, windowstart, windowend, action, flowlogstatus]"
  
  metric_transformation {
    name      = "UnusualTraffic"
    namespace = "VPC/FlowLogs"
    value     = "$bytes"
  }
}

resource "aws_cloudwatch_metric_alarm" "unusual_traffic" {
  alarm_name          = "${var.environment}-unusual-traffic-volume"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "UnusualTraffic"
  namespace           = "VPC/FlowLogs"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10000000000"  # 10 GB
  alarm_description   = "Unusual traffic volume detected"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# SNS Topic para alertas
resource "aws_sns_topic" "alerts" {
  name = "${var.environment}-network-alerts"
  
  tags = {
    Name        = "${var.environment}-network-alerts"
    Environment = var.environment
  }
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
```

</details>

---

### Network Insights

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Network Insights Path para validar conectividad
resource "aws_ec2_network_insights_path" "app_to_db" {
  source      = aws_instance.app.id
  destination = aws_db_instance.main.id
  protocol    = "tcp"
  
  destination_port = 3306
  
  tags = {
    Name        = "${var.environment}-app-to-db-path"
    Environment = var.environment
  }
}

# Análisis programado (via Lambda)
resource "aws_lambda_function" "network_insights_analyzer" {
  filename      = "network_insights_analyzer.zip"
  function_name = "${var.environment}-network-insights-analyzer"
  role          = aws_iam_role.lambda_network_insights.arn
  handler       = "index.handler"
  runtime       = "python3.11"
  timeout       = 60
  
  environment {
    variables = {
      INSIGHTS_PATH_ID = aws_ec2_network_insights_path.app_to_db.id
      SNS_TOPIC_ARN    = aws_sns_topic.alerts.arn
    }
  }
  
  tags = {
    Name        = "${var.environment}-network-insights-analyzer"
    Environment = var.environment
  }
}

# EventBridge rule para ejecutar análisis diario
resource "aws_cloudwatch_event_rule" "daily_network_analysis" {
  name                = "${var.environment}-daily-network-analysis"
  description         = "Ejecuta análisis de red diariamente"
  schedule_expression = "cron(0 6 * * ? *)"  # 6 AM UTC
  
  tags = {
    Name        = "${var.environment}-daily-network-analysis"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_event_target" "network_analysis" {
  rule      = aws_cloudwatch_event_rule.daily_network_analysis.name
  target_id = "NetworkInsightsAnalyzer"
  arn       = aws_lambda_function.network_insights_analyzer.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.network_insights_analyzer.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_network_analysis.arn
}
```

</details>

📚 [VPC Flow Logs](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html)

---

## 7️⃣ Alta Disponibilidad y Resiliencia

### NAT Gateway Redundante

```hcl
# NAT Gateway en cada AZ (ya implementado arriba)
# Esto asegura que si una AZ falla, las otras continúan funcionando

# Monitoreo de salud de NAT Gateways
resource "aws_cloudwatch_metric_alarm" "nat_gateway_error_port_allocation" {
  count               = length(var.azs)
  alarm_name          = "${var.environment}-nat-gateway-error-port-allocation-${var.azs[count.index]}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ErrorPortAllocation"
  namespace           = "AWS/NATGateway"
  period              = "60"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "NAT Gateway port allocation errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    NatGatewayId = aws_nat_gateway.main[count.index].id
  }
}
```

---

### Transit Gateway para Escalabilidad

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Transit Gateway para conectar múltiples VPCs
resource "aws_ec2_transit_gateway" "main" {
  description                     = "${var.environment} Transit Gateway"
  default_route_table_association = "enable"
  default_route_table_propagation = "enable"
  dns_support                     = "enable"
  vpn_ecmp_support               = "enable"
  
  tags = {
    Name        = "${var.environment}-tgw"
    Environment = var.environment
  }
}

# Adjuntar VPC al Transit Gateway
resource "aws_ec2_transit_gateway_vpc_attachment" "main" {
  subnet_ids         = aws_subnet.private[*].id
  transit_gateway_id = aws_ec2_transit_gateway.main.id
  vpc_id             = aws_vpc.main.id
  
  dns_support  = "enable"
  ipv6_support = "disable"
  
  tags = {
    Name        = "${var.environment}-tgw-attachment"
    Environment = var.environment
  }
}

# Flow Logs para Transit Gateway
resource "aws_flow_log" "tgw" {
  log_destination      = aws_cloudwatch_log_group.tgw_flow_logs.arn
  log_destination_type = "cloud-watch-logs"
  traffic_type         = "ALL"
  iam_role_arn         = aws_iam_role.flow_logs.arn
  
  tags = {
    Name        = "${var.environment}-tgw-flow-logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "tgw_flow_logs" {
  name              = "/aws/tgw/${var.environment}-flow-logs"
  retention_in_days = 30
  
  tags = {
    Name        = "${var.environment}-tgw-flow-logs"
    Environment = var.environment
  }
}
```

</details>

---

### IPv6 Support (Opcional)

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Habilitar IPv6 en VPC
resource "aws_vpc_ipv6_cidr_block_association" "main" {
  vpc_id = aws_vpc.main.id
}

# Asignar IPv6 a subnets públicas
resource "aws_subnet" "public_ipv6" {
  count                           = length(var.azs)
  vpc_id                          = aws_vpc.main.id
  cidr_block                      = cidrsubnet(var.vpc_cidr, 8, count.index + 1)
  ipv6_cidr_block                 = cidrsubnet(aws_vpc_ipv6_cidr_block_association.main.ipv6_cidr_block, 8, count.index + 1)
  availability_zone               = var.azs[count.index]
  map_public_ip_on_launch         = true
  assign_ipv6_address_on_creation = true
  
  tags = {
    Name        = "${var.environment}-public-ipv6-${var.azs[count.index]}"
    Environment = var.environment
  }
}

# Egress-Only Internet Gateway para IPv6
resource "aws_egress_only_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name        = "${var.environment}-eigw"
    Environment = var.environment
  }
}

# Ruta IPv6 para subnets privadas
resource "aws_route" "private_ipv6" {
  count                       = length(var.azs)
  route_table_id              = aws_route_table.private[count.index].id
  destination_ipv6_cidr_block = "::/0"
  egress_only_gateway_id      = aws_egress_only_internet_gateway.main.id
}
```

</details>

📚 [High Availability](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html#nat-gateway-basics)

---

## 8️⃣ Optimización de Costos

### Análisis de Costos de Networking

<details>
<summary>🐍 Ver script completo de Python</summary>

```python
"""
Script para analizar costos de networking
"""
import boto3
from datetime import datetime, timedelta

ce = boto3.client('ce')

def analyze_networking_costs():
    """
    Analiza costos de componentes de networking
    """
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    
    # Costos por servicio de networking
    response = ce.get_cost_and_usage(
        TimePeriod={
            'Start': start_date,
            'End': end_date
        },
        Granularity='MONTHLY',
        Metrics=['UnblendedCost'],
        GroupBy=[
            {'Type': 'SERVICE', 'Key': 'SERVICE'}
        ],
        Filter={
            'Dimensions': {
                'Key': 'SERVICE',
                'Values': [
                    'Amazon Virtual Private Cloud',
                    'AWS Data Transfer',
                    'Amazon Route 53',
                    'AWS Direct Connect'
                ]
            }
        }
    )
    
    print("=== Costos de Networking (últimos 30 días) ===\n")
    
    total_cost = 0
    for result in response['ResultsByTime']:
        for group in result['Groups']:
            service = group['Keys'][0]
            cost = float(group['Metrics']['UnblendedCost']['Amount'])
            total_cost += cost
            
            if cost > 0:
                print(f"{service}: ${cost:.2f}")
    
    print(f"\nTotal: ${total_cost:.2f}")
    
    # Desglose de transferencia de datos
    print("\n=== Transferencia de Datos ===\n")
    
    response = ce.get_cost_and_usage(
        TimePeriod={
            'Start': start_date,
            'End': end_date
        },
        Granularity='MONTHLY',
        Metrics=['UnblendedCost', 'UsageQuantity'],
        GroupBy=[
            {'Type': 'USAGE_TYPE', 'Key': 'USAGE_TYPE'}
        ],
        Filter={
            'Dimensions': {
                'Key': 'SERVICE',
                'Values': ['AWS Data Transfer']
            }
        }
    )
    
    for result in response['ResultsByTime']:
        for group in result['Groups']:
            usage_type = group['Keys'][0]
            cost = float(group['Metrics']['UnblendedCost']['Amount'])
            usage_gb = float(group['Metrics']['UsageQuantity']['Amount'])
            
            if cost > 0:
                print(f"{usage_type}:")
                print(f"  Uso: {usage_gb:.2f} GB")
                print(f"  Costo: ${cost:.2f}")
                print()

analyze_networking_costs()
```

</details>

---

### Estrategias de Optimización

#### 1. VPC Endpoints vs NAT Gateway

<details>
<summary>🐍 Ver script completo de Python</summary>

```python
"""
Calculadora de ahorro con VPC Endpoints
"""
def calculate_vpc_endpoint_savings(monthly_data_gb):
    """
    Calcula ahorro usando VPC Endpoints vs NAT Gateway
    """
    # Costos NAT Gateway
    nat_gateway_hours = 730  # horas/mes
    nat_gateway_hourly_cost = 0.045
    nat_gateway_data_cost_per_gb = 0.045
    
    nat_total = (nat_gateway_hours * nat_gateway_hourly_cost) + \
                (monthly_data_gb * nat_gateway_data_cost_per_gb)
    
    # Costos VPC Endpoint (Interface)
    vpc_endpoint_hours = 730
    vpc_endpoint_hourly_cost = 0.01
    vpc_endpoint_data_cost_per_gb = 0.01
    
    vpc_endpoint_total = (vpc_endpoint_hours * vpc_endpoint_hourly_cost) + \
                         (monthly_data_gb * vpc_endpoint_data_cost_per_gb)
    
    savings = nat_total - vpc_endpoint_total
    savings_percent = (savings / nat_total) * 100
    
    print(f"Transferencia mensual a servicios AWS: {monthly_data_gb} GB\n")
    print(f"NAT Gateway:")
    print(f"  Costo por hora: ${nat_gateway_hours * nat_gateway_hourly_cost:.2f}")
    print(f"  Costo de datos: ${monthly_data_gb * nat_gateway_data_cost_per_gb:.2f}")
    print(f"  Total: ${nat_total:.2f}\n")
    
    print(f"VPC Endpoint (Interface):")
    print(f"  Costo por hora: ${vpc_endpoint_hours * vpc_endpoint_hourly_cost:.2f}")
    print(f"  Costo de datos: ${monthly_data_gb * vpc_endpoint_data_cost_per_gb:.2f}")
    print(f"  Total: ${vpc_endpoint_total:.2f}\n")
    
    print(f"💰 Ahorro mensual: ${savings:.2f} ({savings_percent:.1f}%)")

# Ejemplo: 1 TB de transferencia a S3/DynamoDB
calculate_vpc_endpoint_savings(1000)
```

</details>

---

#### 2. Consolidar NAT Gateways (Trade-off)

```hcl
# Opción 1: NAT Gateway por AZ (Alta Disponibilidad)
# Costo: 3 × $32.85 = $98.55/mes (solo port hours)
# Beneficio: Sin downtime si una AZ falla

# Opción 2: NAT Gateway único (Ahorro de costos)
# Costo: 1 × $32.85 = $32.85/mes
# Riesgo: Downtime si la AZ falla

# Recomendación: Usar opción 1 en producción, opción 2 en dev/staging
resource "aws_nat_gateway" "single" {
  count         = var.environment == "production" ? length(var.azs) : 1
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = {
    Name        = "${var.environment}-nat-${count.index}"
    Environment = var.environment
  }
}
```

---

#### 3. Monitorear Transferencia de Datos

```hcl
# Alarma para alto costo de transferencia de datos
resource "aws_cloudwatch_metric_alarm" "high_data_transfer_cost" {
  alarm_name          = "${var.environment}-high-data-transfer-cost"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = "21600"  # 6 horas
  statistic           = "Maximum"
  threshold           = "100"  # $100
  alarm_description   = "Alerta cuando costos de transferencia son altos"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ServiceName = "AWS Data Transfer"
    Currency    = "USD"
  }
}
```

📚 [VPC Pricing](https://aws.amazon.com/vpc/pricing/)

---

## 9️⃣ Checklist de Implementación

### Fase 1: Diseño (Día 1-2)

- [ ] **Planificar CIDR blocks**
  - [ ] VPC principal (/16 recomendado)
  - [ ] Subnets por AZ y capa
  - [ ] Reservar espacio para crecimiento
  - [ ] Evitar solapamiento con on-premise

- [ ] **Definir arquitectura**
  - [ ] Número de AZs (mínimo 2, recomendado 3)
  - [ ] Capas de red (public, private, data)
  - [ ] Requisitos de conectividad externa
  - [ ] Requisitos de alta disponibilidad

- [ ] **Documentar**
  - [ ] Diagrama de arquitectura
  - [ ] Tabla de subnets y CIDRs
  - [ ] Matriz de conectividad
  - [ ] Requisitos de seguridad

### Fase 2: Implementación Base (Día 3-5)

- [ ] **Crear VPC**
  - [ ] VPC con CIDR apropiado
  - [ ] Habilitar DNS hostnames
  - [ ] Habilitar DNS support
  - [ ] Tags apropiados

- [ ] **Crear Subnets**
  - [ ] Public subnets en cada AZ
  - [ ] Private subnets en cada AZ
  - [ ] Data subnets en cada AZ
  - [ ] Verificar no solapamiento

- [ ] **Configurar Gateways**
  - [ ] Internet Gateway
  - [ ] NAT Gateways (uno por AZ)
  - [ ] Elastic IPs para NAT Gateways

- [ ] **Configurar Routing**
  - [ ] Route table pública
  - [ ] Route tables privadas (una por AZ)
  - [ ] Route tables de datos
  - [ ] Asociaciones correctas

### Fase 3: Seguridad (Día 6-8)

- [ ] **Security Groups**
  - [ ] SG para ALB
  - [ ] SG para aplicación
  - [ ] SG para base de datos
  - [ ] SG para cache
  - [ ] SG para VPC endpoints
  - [ ] Documentar cada regla

- [ ] **Network ACLs**
  - [ ] NACL para public subnets
  - [ ] NACL para private subnets
  - [ ] NACL para data subnets
  - [ ] Reglas de denegación explícitas

- [ ] **VPC Flow Logs**
  - [ ] Habilitar Flow Logs
  - [ ] Configurar destino (S3 o CloudWatch)
  - [ ] Definir retención
  - [ ] Configurar análisis

### Fase 4: Servicios Adicionales (Día 9-12)

- [ ] **VPC Endpoints**
  - [ ] S3 Gateway Endpoint
  - [ ] DynamoDB Gateway Endpoint
  - [ ] Secrets Manager Interface Endpoint
  - [ ] SSM Interface Endpoints (3)
  - [ ] ECR Interface Endpoints (2)
  - [ ] CloudWatch Logs Interface Endpoint

- [ ] **DNS**
  - [ ] Zona privada Route 53
  - [ ] Registros para servicios internos
  - [ ] Resolver endpoints (si híbrido)
  - [ ] Reglas de forwarding

- [ ] **Monitoreo**
  - [ ] CloudWatch Alarms
  - [ ] SNS Topics para alertas
  - [ ] Dashboard de networking
  - [ ] Log metric filters

### Fase 5: Alta Disponibilidad (Día 13-15)

- [ ] **Validar Multi-AZ**
  - [ ] Recursos en múltiples AZs
  - [ ] NAT Gateway por AZ
  - [ ] Balanceo de carga configurado

- [ ] **Pruebas de Failover**
  - [ ] Simular fallo de AZ
  - [ ] Verificar failover automático
  - [ ] Medir tiempo de recuperación
  - [ ] Documentar comportamiento

- [ ] **Disaster Recovery**
  - [ ] Backups de configuración
  - [ ] Runbooks de recuperación
  - [ ] Procedimientos documentados

### Fase 6: Optimización (Semana 3+)

- [ ] **Costos**
  - [ ] Revisar uso de NAT Gateways
  - [ ] Evaluar VPC Endpoints adicionales
  - [ ] Analizar transferencia de datos
  - [ ] Optimizar según patrones de uso

- [ ] **Performance**
  - [ ] Analizar latencia
  - [ ] Optimizar routing
  - [ ] Evaluar placement groups
  - [ ] Considerar Enhanced Networking

- [ ] **Seguridad**
  - [ ] Auditar Security Groups
  - [ ] Revisar Flow Logs
  - [ ] Validar compliance
  - [ ] Penetration testing

---

## 🔟 Troubleshooting Común

### Problema 1: No hay conectividad a Internet desde Private Subnet

**Verificaciones:**

```bash
# 1. Verificar que existe NAT Gateway
aws ec2 describe-nat-gateways \
  --filter "Name=vpc-id,Values=vpc-12345678"

# 2. Verificar ruta a NAT Gateway
aws ec2 describe-route-tables \
  --filters "Name=vpc-id,Values=vpc-12345678"

# 3. Verificar Security Group permite tráfico saliente
aws ec2 describe-security-groups \
  --group-ids sg-12345678

# 4. Verificar NACL permite tráfico
aws ec2 describe-network-acls \
  --filters "Name=vpc-id,Values=vpc-12345678"
```

**Solución:**
- Verificar que la route table tiene ruta 0.0.0.0/0 → NAT Gateway
- Verificar que NAT Gateway está en estado "available"
- Verificar que Security Group permite egress
- Verificar que NACL permite ephemeral ports (1024-65535)

---

### Problema 2: No se puede acceder a servicios AWS desde Private Subnet

**Verificaciones:**

```bash
# 1. Verificar VPC Endpoints
aws ec2 describe-vpc-endpoints \
  --filters "Name=vpc-id,Values=vpc-12345678"

# 2. Verificar route tables tienen rutas a endpoints
aws ec2 describe-route-tables \
  --route-table-ids rtb-12345678

# 3. Verificar Security Group de VPC Endpoint
aws ec2 describe-security-groups \
  --group-ids sg-endpoint-12345678
```

**Solución:**
- Crear VPC Endpoint para el servicio
- Verificar que route table está asociada con endpoint
- Verificar que Security Group permite HTTPS (443)

---

### Problema 3: Alta latencia entre AZs

**Verificaciones:**

```bash
# Desde instancia EC2, hacer ping a instancia en otra AZ
ping -c 10 10.0.12.10

# Verificar placement group (si aplica)
aws ec2 describe-placement-groups

# Verificar tipo de instancia soporta Enhanced Networking
aws ec2 describe-instance-attribute \
  --instance-id i-1234567890abcdef0 \
  --attribute sriovNetSupport
```

**Solución:**
- Usar instancias con Enhanced Networking
- Considerar Placement Groups para baja latencia
- Verificar que no hay bottlenecks en NAT Gateway

---

### Problema 4: Costos de Transferencia de Datos Altos

**Análisis:**

<details>
<summary>🐍 Ver script completo de Python</summary>

```python
"""
Identificar fuentes de alto costo de transferencia
"""
import boto3

cloudwatch = boto3.client('cloudwatch')

def analyze_nat_gateway_traffic():
    """
    Analiza tráfico de NAT Gateways
    """
    ec2 = boto3.client('ec2')
    
    # Obtener NAT Gateways
    response = ec2.describe_nat_gateways()
    
    for nat in response['NatGateways']:
        nat_id = nat['NatGatewayId']
        
        # Obtener métricas de bytes transferidos
        response = cloudwatch.get_metric_statistics(
            Namespace='AWS/NATGateway',
            MetricName='BytesOutToDestination',
            Dimensions=[{'Name': 'NatGatewayId', 'Value': nat_id}],
            StartTime=datetime.utcnow() - timedelta(days=7),
            EndTime=datetime.utcnow(),
            Period=86400,  # 1 día
            Statistics=['Sum']
        )
        
        total_bytes = sum(dp['Sum'] for dp in response['Datapoints'])
        total_gb = total_bytes / 1024 / 1024 / 1024
        estimated_cost = total_gb * 0.045  # $0.045 per GB
        
        print(f"NAT Gateway: {nat_id}")
        print(f"  Bytes transferidos (7 días): {total_gb:.2f} GB")
        print(f"  Costo estimado: ${estimated_cost:.2f}")
        print()

analyze_nat_gateway_traffic()
```

</details>

**Soluciones:**
- Implementar VPC Endpoints para servicios AWS
- Usar CloudFront para contenido estático
- Comprimir datos antes de transferir
- Revisar aplicaciones que transfieren datos innecesarios

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [VPC User Guide](https://docs.aws.amazon.com/vpc/latest/userguide/)
- [VPC Best Practices](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-best-practices.html)
- [Security Groups](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html)
- [Network ACLs](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)
- [VPC Endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints.html)

### Whitepapers

- [AWS VPC Connectivity Options](https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/introduction.html)
- [Building a Scalable and Secure Multi-VPC AWS Network Infrastructure](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/welcome.html)

### Herramientas

- [VPC Reachability Analyzer](https://docs.aws.amazon.com/vpc/latest/reachability/)
- [Network Access Analyzer](https://docs.aws.amazon.com/vpc/latest/network-access-analyzer/)
- [AWS Network Firewall](https://docs.aws.amazon.com/network-firewall/)

### Calculadoras

- [AWS Pricing Calculator](https://calculator.aws/)
- [VPC Cost Calculator](https://aws.amazon.com/vpc/pricing/)

---

## 📝 Notas Finales

Este Starter Kit proporciona una base sólida para implementar networking en AWS siguiendo las mejores prácticas. Recuerde que:

- 🏗️ **Diseñe para escalar** - Planifique CIDR con espacio para crecimiento
- 🔒 **Seguridad en capas** - Use Security Groups, NACLs y VPC Endpoints
- 📊 **Monitoree todo** - Flow Logs, CloudWatch Alarms, dashboards
- 💰 **Optimice costos** - VPC Endpoints, análisis de transferencia
- 🔄 **Alta disponibilidad** - Multi-AZ, NAT Gateways redundantes
- 📋 **Documente** - Diagramas, runbooks, procedimientos
- 🧪 **Pruebe failover** - Valide que la redundancia funciona

**Una base de red sólida es fundamental para el éxito en la nube.**

---

**Versión**: 1.0  
**Última actualización**: Febrero 2026  
**Próxima revisión**: Mayo 2026

---

*Esta guía debe adaptarse a los requisitos específicos de su organización. Para implementación técnica detallada, consulte con su equipo de arquitectos de red.*
