# Ejemplo de Uso de Colapsables en Docusaurus

## Sintaxis Básica

Para hacer que el código sea colapsable, usa la etiqueta HTML `<details>` con `<summary>`:

```markdown
<details>
<summary>Ver código Terraform</summary>

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}
```

</details>
```

## Ejemplos de Uso

### 1. Código Terraform Colapsable

<details>
<summary>📄 Ver implementación completa en Terraform</summary>

```hcl
# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "main-vpc"
    Environment = "production"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "main-igw"
  }
}

# Public Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
  
  tags = {
    Name = "public-subnet"
  }
}
```

</details>

### 2. Script Python Colapsable

<details>
<summary>🐍 Ver script de análisis de costos</summary>

```python
import boto3
from datetime import datetime, timedelta

def analyze_costs():
    """
    Analiza costos de networking
    """
    ce = boto3.client('ce')
    
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    
    response = ce.get_cost_and_usage(
        TimePeriod={
            'Start': start_date,
            'End': end_date
        },
        Granularity='MONTHLY',
        Metrics=['UnblendedCost']
    )
    
    for result in response['ResultsByTime']:
        cost = float(result['Total']['UnblendedCost']['Amount'])
        print(f"Costo total: ${cost:.2f}")

analyze_costs()
```

</details>

### 3. Configuración AWS CLI Colapsable

<details>
<summary>⚙️ Ver comandos AWS CLI</summary>

```bash
# Crear VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=main-vpc}]'

# Crear Internet Gateway
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=main-igw}]'

# Adjuntar IGW a VPC
aws ec2 attach-internet-gateway \
  --internet-gateway-id igw-12345678 \
  --vpc-id vpc-12345678
```

</details>

### 4. Múltiples Secciones Colapsables

<details>
<summary>📋 Paso 1: Crear VPC</summary>

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "main-vpc"
  }
}
```

</details>

<details>
<summary>📋 Paso 2: Crear Subnets</summary>

```hcl
resource "aws_subnet" "public" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 1)
  availability_zone = var.azs[count.index]
  
  tags = {
    Name = "public-subnet-${count.index + 1}"
  }
}
```

</details>

<details>
<summary>📋 Paso 3: Crear NAT Gateways</summary>

```hcl
resource "aws_nat_gateway" "main" {
  count         = 3
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = {
    Name = "nat-gateway-${count.index + 1}"
  }
}
```

</details>

## Variaciones de Estilo

### Con Emoji en el Summary

<details>
<summary>🚀 Ver configuración avanzada</summary>

Contenido aquí...

</details>

### Con Descripción Más Larga

<details>
<summary>Ver implementación completa de Security Groups (incluye ALB, App, Database y Cache)</summary>

```hcl
# Código aquí...
```

</details>

### Colapsable Abierto por Defecto

<details open>
<summary>⚠️ Configuración importante (abierto por defecto)</summary>

Este colapsable está abierto por defecto usando el atributo `open`.

</details>

## Recomendaciones de Uso

### ✅ Cuándo Usar Colapsables

- Bloques de código largos (>30 líneas)
- Implementaciones completas de Terraform
- Scripts de automatización
- Configuraciones detalladas
- Ejemplos alternativos

### ❌ Cuándo NO Usar Colapsables

- Código corto y esencial (<15 líneas)
- Ejemplos principales que deben verse
- Comandos simples de una línea
- Conceptos clave que requieren visibilidad

## Patrón Recomendado para las Guías

```markdown
### Implementación

Explicación breve del concepto...

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Código completo aquí
```

</details>

**Puntos clave:**
- Punto 1
- Punto 2
```

## Notas Importantes

1. **Espacio en blanco**: Deja una línea en blanco después de `<summary>` y antes de cerrar `</details>`
2. **Bloques de código**: Los bloques de código dentro de `<details>` funcionan normalmente
3. **Anidamiento**: Puedes anidar colapsables, pero no es recomendable
4. **Markdown**: Puedes usar markdown normal dentro de `<details>`

## Ejemplo Real de una Sección

### Crear VPC con Alta Disponibilidad

Para implementar una VPC con alta disponibilidad, necesitamos recursos en múltiples AZs.

<details>
<summary>📄 Ver implementación completa en Terraform</summary>

```hcl
# variables.tf
variable "vpc_cidr" {
  description = "CIDR block para VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability Zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# vpc.tf
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "main-vpc"
  }
}

# Subnets públicas
resource "aws_subnet" "public" {
  count                   = length(var.azs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index + 1)
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "public-subnet-${var.azs[count.index]}"
  }
}

# NAT Gateways
resource "aws_nat_gateway" "main" {
  count         = length(var.azs)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = {
    Name = "nat-gateway-${var.azs[count.index]}"
  }
}
```

</details>

**Características clave:**
- ✅ Multi-AZ por defecto
- ✅ NAT Gateway por AZ
- ✅ DNS habilitado
- ✅ Subnets públicas con IPs públicas

<details>
<summary>🐍 Ver script de validación</summary>

```python
import boto3

def validate_vpc_setup(vpc_id):
    """Valida que la VPC esté configurada correctamente"""
    ec2 = boto3.client('ec2')
    
    # Verificar VPC
    vpc = ec2.describe_vpcs(VpcIds=[vpc_id])
    print(f"VPC: {vpc['Vpcs'][0]['CidrBlock']}")
    
    # Verificar subnets
    subnets = ec2.describe_subnets(Filters=[
        {'Name': 'vpc-id', 'Values': [vpc_id]}
    ])
    print(f"Subnets: {len(subnets['Subnets'])}")
    
    # Verificar NAT Gateways
    nat_gateways = ec2.describe_nat_gateways(Filters=[
        {'Name': 'vpc-id', 'Values': [vpc_id]}
    ])
    print(f"NAT Gateways: {len(nat_gateways['NatGateways'])}")

validate_vpc_setup('vpc-12345678')
```

</details>

---

Este patrón hace que las guías sean más legibles mientras mantienen todo el código disponible para quien lo necesite.
