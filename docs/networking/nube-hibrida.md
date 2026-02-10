---
sidebar_label: "Nube Híbrida - Conectividad"
sidebar_position: 2
---

<div align="center">

# 🌐 Nube Híbrida - Conectividad On-Premise y Multi-Cloud

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Azure](https://img.shields.io/badge/Azure-0078D4?style=for-the-badge&logo=microsoft-azure&logoColor=white)
![Hybrid](https://img.shields.io/badge/Hybrid_Cloud-00C7B7?style=for-the-badge&logo=cloud&logoColor=white)

</div>

## 📋 Introducción

La **nube híbrida** permite conectar infraestructura on-premise con servicios en la nube, así como integrar múltiples proveedores cloud. Esta guía cubre las mejores prácticas para establecer conectividad segura y confiable.

**Objetivo**: Implementar arquitecturas de nube híbrida robustas que conecten on-premise con AWS, y AWS con Azure.

---

## 1️⃣ Arquitecturas de Conectividad

### Tipos de Conexión

| Tipo | Latencia | Ancho de Banda | Costo | Seguridad | Uso Recomendado |
|------|----------|----------------|-------|-----------|-----------------|
| **VPN Site-to-Site** | Media (Internet) | Hasta 1.25 Gbps | 💰 Bajo | 🔒 Cifrado IPsec | Desarrollo, DR, cargas bajas |
| **AWS Direct Connect** | Baja (Dedicada) | 1-100 Gbps | 💰💰💰 Alto | 🔒 Privada | Producción, cargas altas |
| **AWS Transit Gateway** | Baja | Escalable | 💰💰 Medio | 🔒 Privada | Hub multi-VPC/VPN |
| **AWS Client VPN** | Media | Variable | 💰 Bajo | 🔒 Cifrado | Acceso remoto usuarios |

---

## 2️⃣ VPN Site-to-Site (On-Premise ↔ AWS)

### Arquitectura VPN Site-to-Site

<details>
<summary>💡 Ver ejemplo completo</summary>

```
┌─────────────────────────────────────────────────────────────┐
│                    On-Premise Data Center                    │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │              │         │              │                 │
│  │  Servers     │────────▶│  Firewall/   │                 │
│  │  10.1.0.0/16 │         │  VPN Device  │                 │
│  │              │         │  (Customer   │                 │
│  └──────────────┘         │   Gateway)   │                 │
│                           └──────┬───────┘                 │
└──────────────────────────────────┼──────────────────────────┘
                                   │
                                   │ IPsec Tunnel 1
                                   │ (Primary)
                                   │
                    Internet       │
                    ═══════════════╪═══════════════
                                   │
                                   │ IPsec Tunnel 2
                                   │ (Backup)
                                   │
┌──────────────────────────────────┼──────────────────────────┐
│                    AWS Region    │                          │
│                                  │                          │
│  ┌───────────────────────────────▼────────────────────┐    │
│  │              Virtual Private Gateway                │    │
│  │              (VGW)                                  │    │
│  └───────────────────────────────┬────────────────────┘    │
│                                  │                          │
│  ┌───────────────────────────────▼────────────────────┐    │
│  │                    VPC: 10.0.0.0/16                 │    │
│  │                                                     │    │
│  │  ┌──────────────┐         ┌──────────────┐        │    │
│  │  │ Private      │         │ Private      │        │    │
│  │  │ Subnet       │         │ Subnet       │        │    │
│  │  │ 10.0.1.0/24  │         │ 10.0.2.0/24  │        │    │
│  │  │              │         │              │        │    │
│  │  │ ┌──────────┐ │         │ ┌──────────┐ │        │    │
│  │  │ │   EC2    │ │         │ │   RDS    │ │        │    │
│  │  │ └──────────┘ │         │ └──────────┘ │        │    │
│  │  └──────────────┘         └──────────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

</details>

### Características

- ✅ **Alta disponibilidad**: 2 túneles IPsec redundantes
- ✅ **Cifrado**: AES-256, SHA-2
- ✅ **Routing**: BGP o estático
- ✅ **Throughput**: Hasta 1.25 Gbps por túnel
- ✅ **Costo**: ~$0.05/hora + transferencia de datos

---

### Implementación VPN Site-to-Site

#### Paso 1: Crear Customer Gateway

```bash
# Crear Customer Gateway (representa el dispositivo VPN on-premise)
aws ec2 create-customer-gateway \
  --type ipsec.1 \
  --public-ip 203.0.113.12 \
  --bgp-asn 65000 \
  --tag-specifications 'ResourceType=customer-gateway,Tags=[{Key=Name,Value=onprem-cgw}]'
```

```hcl
# Terraform
resource "aws_customer_gateway" "onprem" {
  bgp_asn    = 65000
  ip_address = "203.0.113.12"
  type       = "ipsec.1"
  
  tags = {
    Name        = "onprem-cgw"
    Environment = "production"
  }
}
```

---

#### Paso 2: Crear Virtual Private Gateway

```bash
# Crear VGW
aws ec2 create-vpn-gateway \
  --type ipsec.1 \
  --amazon-side-asn 64512 \
  --tag-specifications 'ResourceType=vpn-gateway,Tags=[{Key=Name,Value=aws-vgw}]'

# Adjuntar VGW a VPC
aws ec2 attach-vpn-gateway \
  --vpn-gateway-id vgw-12345678 \
  --vpc-id vpc-abcdef01
```

```hcl
# Terraform
resource "aws_vpn_gateway" "main" {
  vpc_id          = aws_vpc.main.id
  amazon_side_asn = 64512
  
  tags = {
    Name        = "aws-vgw"
    Environment = "production"
  }
}

resource "aws_vpn_gateway_attachment" "main" {
  vpc_id         = aws_vpc.main.id
  vpn_gateway_id = aws_vpn_gateway.main.id
}
```

---

#### Paso 3: Crear VPN Connection

```bash
# Crear conexión VPN
aws ec2 create-vpn-connection \
  --type ipsec.1 \
  --customer-gateway-id cgw-12345678 \
  --vpn-gateway-id vgw-12345678 \
  --options TunnelOptions='[
    {TunnelInsideCidr=169.254.10.0/30,PreSharedKey=MySecurePreSharedKey123!},
    {TunnelInsideCidr=169.254.11.0/30,PreSharedKey=MySecurePreSharedKey456!}
  ]' \
  --tag-specifications 'ResourceType=vpn-connection,Tags=[{Key=Name,Value=onprem-to-aws}]'
```

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Terraform
resource "aws_vpn_connection" "main" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.onprem.id
  type                = "ipsec.1"
  static_routes_only  = false  # Usar BGP
  
  # Configuración de túneles
  tunnel1_inside_cidr   = "169.254.10.0/30"
  tunnel1_preshared_key = var.tunnel1_psk
  
  tunnel2_inside_cidr   = "169.254.11.0/30"
  tunnel2_preshared_key = var.tunnel2_psk
  
  # Opciones avanzadas
  tunnel1_dpd_timeout_action = "restart"
  tunnel2_dpd_timeout_action = "restart"
  
  tunnel1_ike_versions = ["ikev2"]
  tunnel2_ike_versions = ["ikev2"]
  
  tunnel1_phase1_encryption_algorithms = ["AES256"]
  tunnel2_phase1_encryption_algorithms = ["AES256"]
  
  tunnel1_phase2_encryption_algorithms = ["AES256"]
  tunnel2_phase2_encryption_algorithms = ["AES256"]
  
  tags = {
    Name        = "onprem-to-aws"
    Environment = "production"
  }
}
```

</details>

---

#### Paso 4: Configurar Routing

```bash
# Habilitar propagación de rutas BGP
aws ec2 enable-vgw-route-propagation \
  --route-table-id rtb-12345678 \
  --gateway-id vgw-12345678
```

```hcl
# Terraform
resource "aws_vpn_gateway_route_propagation" "main" {
  vpn_gateway_id = aws_vpn_gateway.main.id
  route_table_id = aws_route_table.private.id
}

# Ruta estática (alternativa a BGP)
resource "aws_route" "to_onprem" {
  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "10.1.0.0/16"  # Red on-premise
  gateway_id             = aws_vpn_gateway.main.id
}
```

---

#### Paso 5: Configurar Dispositivo On-Premise

**Descargar configuración:**

```bash
# Descargar archivo de configuración
aws ec2 describe-vpn-connections \
  --vpn-connection-ids vpn-12345678 \
  --query 'VpnConnections[0].CustomerGatewayConfiguration' \
  --output text > vpn-config.xml
```

**Ejemplo de configuración para Cisco ASA:**

<details>
<summary>🔧 Ver configuración de dispositivo</summary>

```cisco
! Tunnel 1
crypto ikev2 policy 200
  encryption aes-256
  integrity sha256
  group 14
  prf sha256
  lifetime seconds 28800

crypto ikev2 keyring keyring-vpn-12345678-1
  peer 52.1.2.3
    address 52.1.2.3
    pre-shared-key MySecurePreSharedKey123!

crypto ikev2 profile profile-vpn-12345678-1
  match identity remote address 52.1.2.3
  authentication remote pre-share
  authentication local pre-share
  keyring local keyring-vpn-12345678-1
  lifetime 28800
  dpd 10 3 on-demand

crypto ipsec transform-set ipsec-prop-vpn-12345678-1 esp-aes-256 esp-sha256-hmac
  mode tunnel

crypto ipsec profile ipsec-vpn-12345678-1
  set pfs group14
  set security-association lifetime seconds 3600
  set transform-set ipsec-prop-vpn-12345678-1
  set ikev2-profile profile-vpn-12345678-1

interface Tunnel1
  ip address 169.254.10.2 255.255.255.252
  ip virtual-reassembly
  tunnel source 203.0.113.12
  tunnel destination 52.1.2.3
  tunnel mode ipsec ipv4
  tunnel protection ipsec profile ipsec-vpn-12345678-1
  ip tcp adjust-mss 1379

! BGP Configuration
router bgp 65000
  neighbor 169.254.10.1 remote-as 64512
  neighbor 169.254.10.1 activate
  network 10.1.0.0 mask 255.255.0.0
```

</details>

**Ejemplo para pfSense:**

```
1. Navegar a VPN > IPsec
2. Click en "Add P1"
3. Configurar Phase 1:
   - Remote Gateway: 52.1.2.3
   - Authentication Method: Mutual PSK
   - Pre-Shared Key: MySecurePreSharedKey123!
   - Encryption Algorithm: AES 256
   - Hash Algorithm: SHA256
   - DH Group: 14
   - Lifetime: 28800

4. Click en "Add P2"
5. Configurar Phase 2:
   - Local Network: 10.1.0.0/16
   - Remote Network: 10.0.0.0/16
   - Protocol: ESP
   - Encryption: AES 256
   - Hash: SHA256
   - PFS Group: 14
   - Lifetime: 3600
```

📚 [VPN Site-to-Site Documentation](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html)

---

## 3️⃣ AWS Direct Connect (On-Premise ↔ AWS)

### Arquitectura Direct Connect

<details>
<summary>💡 Ver ejemplo completo</summary>

```
┌─────────────────────────────────────────────────────────────┐
│                On-Premise Data Center                        │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │              │         │              │                 │
│  │  Servers     │────────▶│   Router     │                 │
│  │  10.1.0.0/16 │         │              │                 │
│  │              │         └──────┬───────┘                 │
│  └──────────────┘                │                         │
│                                  │ Fiber                   │
└──────────────────────────────────┼──────────────────────────┘
                                   │
                                   │ Dedicated Connection
                                   │ 1/10/100 Gbps
                                   │
┌──────────────────────────────────┼──────────────────────────┐
│         AWS Direct Connect       │                          │
│              Location            │                          │
│                                  │                          │
│  ┌───────────────────────────────▼────────────────────┐    │
│  │         Direct Connect Endpoint                    │    │
│  │         (AWS Router)                               │    │
│  └───────────────────────────────┬────────────────────┘    │
└──────────────────────────────────┼──────────────────────────┘
                                   │
                                   │ AWS Backbone
                                   │ (Private)
                                   │
┌──────────────────────────────────┼──────────────────────────┐
│                    AWS Region    │                          │
│                                  │                          │
│  ┌───────────────────────────────▼────────────────────┐    │
│  │         Virtual Private Gateway (VGW)              │    │
│  │         or Direct Connect Gateway (DXGW)           │    │
│  └───────────────────────────────┬────────────────────┘    │
│                                  │                          │
│  ┌───────────────────────────────▼────────────────────┐    │
│  │                    VPC: 10.0.0.0/16                 │    │
│  │                                                     │    │
│  │  ┌──────────────┐         ┌──────────────┐        │    │
│  │  │ Private      │         │ Private      │        │    │
│  │  │ Subnet       │         │ Subnet       │        │    │
│  │  │              │         │              │        │    │
│  │  │ ┌──────────┐ │         │ ┌──────────┐ │        │    │
│  │  │ │   EC2    │ │         │ │   RDS    │ │        │    │
│  │  │ └──────────┘ │         │ └──────────┘ │        │    │
│  │  └──────────────┘         └──────────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

</details>

### Características

- ✅ **Baja latencia**: Conexión dedicada, no usa Internet
- ✅ **Alto throughput**: 1, 10 o 100 Gbps
- ✅ **Consistencia**: Rendimiento predecible
- ✅ **Seguridad**: Tráfico privado, no atraviesa Internet
- ✅ **Costo**: Port hours + transferencia de datos saliente

### Tipos de Conexión

#### 1. Dedicated Connection (Conexión Dedicada)

- **Ancho de banda**: 1, 10 o 100 Gbps
- **Propietario**: Cliente posee el puerto completo
- **Uso**: Cargas de trabajo grandes y consistentes

#### 2. Hosted Connection (Conexión Hospedada)

- **Ancho de banda**: 50 Mbps a 10 Gbps
- **Propietario**: Partner de AWS
- **Uso**: Cargas más pequeñas o flexibles

---

### Implementación Direct Connect

#### Paso 1: Solicitar Conexión

```bash
# Crear conexión Direct Connect
aws directconnect create-connection \
  --location EqDC2 \
  --bandwidth 1Gbps \
  --connection-name "onprem-to-aws-dx" \
  --tags Key=Environment,Value=production
```

```hcl
# Terraform
resource "aws_dx_connection" "main" {
  name      = "onprem-to-aws-dx"
  bandwidth = "1Gbps"
  location  = "EqDC2"  # Equinix DC2
  
  tags = {
    Name        = "onprem-to-aws-dx"
    Environment = "production"
  }
}
```

---

#### Paso 2: Crear Virtual Interface (VIF)

**Private VIF (para VPC):**

```bash
# Crear Private VIF
aws directconnect create-private-virtual-interface \
  --connection-id dxcon-12345678 \
  --new-private-virtual-interface \
    virtualInterfaceName=private-vif-prod,\
    vlan=100,\
    asn=65000,\
    amazonAddress=169.254.10.1/30,\
    customerAddress=169.254.10.2/30,\
    addressFamily=ipv4,\
    virtualGatewayId=vgw-12345678
```

```hcl
# Terraform
resource "aws_dx_private_virtual_interface" "main" {
  connection_id    = aws_dx_connection.main.id
  name             = "private-vif-prod"
  vlan             = 100
  address_family   = "ipv4"
  bgp_asn          = 65000
  
  # BGP peering
  amazon_address   = "169.254.10.1/30"
  customer_address = "169.254.10.2/30"
  
  # Adjuntar a VGW
  vpn_gateway_id = aws_vpn_gateway.main.id
  
  tags = {
    Name        = "private-vif-prod"
    Environment = "production"
  }
}
```

**Public VIF (para servicios públicos de AWS):**

```bash
# Crear Public VIF
aws directconnect create-public-virtual-interface \
  --connection-id dxcon-12345678 \
  --new-public-virtual-interface \
    virtualInterfaceName=public-vif,\
    vlan=200,\
    asn=65000,\
    amazonAddress=169.254.20.1/30,\
    customerAddress=169.254.20.2/30,\
    addressFamily=ipv4,\
    routeFilterPrefixes=[{cidr=203.0.113.0/24}]
```

---

#### Paso 3: Direct Connect Gateway (Multi-Region)

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Direct Connect Gateway para acceso multi-región
resource "aws_dx_gateway" "main" {
  name            = "dx-gateway-global"
  amazon_side_asn = 64512
}

# Asociar con VGW en región 1
resource "aws_dx_gateway_association" "us_east_1" {
  dx_gateway_id         = aws_dx_gateway.main.id
  associated_gateway_id = aws_vpn_gateway.us_east_1.id
  
  allowed_prefixes = [
    "10.0.0.0/16"  # VPC en us-east-1
  ]
}

# Asociar con VGW en región 2
resource "aws_dx_gateway_association" "eu_west_1" {
  dx_gateway_id         = aws_dx_gateway.main.id
  associated_gateway_id = aws_vpn_gateway.eu_west_1.id
  
  allowed_prefixes = [
    "10.10.0.0/16"  # VPC en eu-west-1
  ]
}

# Adjuntar Private VIF al DX Gateway
resource "aws_dx_private_virtual_interface" "to_dxgw" {
  connection_id      = aws_dx_connection.main.id
  name               = "private-vif-to-dxgw"
  vlan               = 100
  address_family     = "ipv4"
  bgp_asn            = 65000
  amazon_address     = "169.254.10.1/30"
  customer_address   = "169.254.10.2/30"
  dx_gateway_id      = aws_dx_gateway.main.id
}
```

</details>

---

### Direct Connect + VPN (Backup)

**Arquitectura de alta disponibilidad:**

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Direct Connect como conexión primaria
resource "aws_dx_connection" "primary" {
  name      = "primary-dx"
  bandwidth = "1Gbps"
  location  = "EqDC2"
}

resource "aws_dx_private_virtual_interface" "primary" {
  connection_id    = aws_dx_connection.primary.id
  name             = "primary-vif"
  vlan             = 100
  bgp_asn          = 65000
  amazon_address   = "169.254.10.1/30"
  customer_address = "169.254.10.2/30"
  vpn_gateway_id   = aws_vpn_gateway.main.id
}

# VPN como backup
resource "aws_vpn_connection" "backup" {
  vpn_gateway_id      = aws_vpn_gateway.main.id
  customer_gateway_id = aws_customer_gateway.onprem.id
  type                = "ipsec.1"
  static_routes_only  = false
  
  tags = {
    Name = "backup-vpn"
  }
}

# BGP configurado para preferir Direct Connect
# AS Path Prepending en VPN para menor prioridad
```

</details>

📚 [AWS Direct Connect Documentation](https://docs.aws.amazon.com/directconnect/)

---

## 4️⃣ AWS Transit Gateway

### Arquitectura Transit Gateway

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS Region                                │
│                                                              │
│              ┌───────────────────────────┐                  │
│              │   AWS Transit Gateway    │                  │
│              │   (Hub Central)          │                  │
│              └───────────┬───────────────┘                  │
│                          │                                  │
│        ┌─────────────────┼─────────────────┐               │
│        │                 │                 │               │
│        │                 │                 │               │
│   ┌────▼────┐       ┌────▼────┐      ┌────▼────┐          │
│   │ VPC 1   │       │ VPC 2   │      │ VPC 3   │          │
│   │ Prod    │       │ Dev     │      │ Shared  │          │
│   │10.0/16  │       │10.1/16  │      │10.2/16  │          │
│   └─────────┘       └─────────┘      └─────────┘          │
│                                                              │
│        ┌─────────────────┴─────────────────┐               │
│        │                                   │               │
│   ┌────▼────────┐                   ┌──────▼──────┐        │
│   │ VPN         │                   │ Direct      │        │
│   │ Connection  │                   │ Connect     │        │
│   │ (On-Prem)   │                   │ (On-Prem)   │        │
│   └─────────────┘                   └─────────────┘        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Características

- ✅ **Hub central**: Conecta múltiples VPCs, VPNs y Direct Connect
- ✅ **Escalabilidad**: Hasta 5,000 attachments
- ✅ **Routing**: Tablas de rutas flexibles
- ✅ **Throughput**: Hasta 50 Gbps por attachment
- ✅ **Multi-región**: Peering entre Transit Gateways

---

### Implementación Transit Gateway

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Transit Gateway
resource "aws_ec2_transit_gateway" "main" {
  description                     = "Transit Gateway Principal"
  default_route_table_association = "enable"
  default_route_table_propagation = "enable"
  dns_support                     = "enable"
  vpn_ecmp_support               = "enable"
  
  tags = {
    Name        = "tgw-main"
    Environment = "production"
  }
}

# Adjuntar VPC 1 (Producción)
resource "aws_ec2_transit_gateway_vpc_attachment" "prod" {
  subnet_ids         = aws_subnet.prod_private[*].id
  transit_gateway_id = aws_ec2_transit_gateway.main.id
  vpc_id             = aws_vpc.prod.id
  
  dns_support  = "enable"
  ipv6_support = "disable"
  
  tags = {
    Name = "tgw-attachment-prod"
  }
}

# Adjuntar VPC 2 (Desarrollo)
resource "aws_ec2_transit_gateway_vpc_attachment" "dev" {
  subnet_ids         = aws_subnet.dev_private[*].id
  transit_gateway_id = aws_ec2_transit_gateway.main.id
  vpc_id             = aws_vpc.dev.id
  
  tags = {
    Name = "tgw-attachment-dev"
  }
}

# Adjuntar VPN
resource "aws_vpn_connection" "onprem" {
  customer_gateway_id = aws_customer_gateway.onprem.id
  transit_gateway_id  = aws_ec2_transit_gateway.main.id
  type                = "ipsec.1"
  static_routes_only  = false
  
  tags = {
    Name = "tgw-vpn-onprem"
  }
}

# Adjuntar Direct Connect
resource "aws_dx_gateway_association" "tgw" {
  dx_gateway_id         = aws_dx_gateway.main.id
  associated_gateway_id = aws_ec2_transit_gateway.main.id
  
  allowed_prefixes = [
    "10.0.0.0/8"  # Todas las redes privadas
  ]
}
```

</details>

---

### Tablas de Rutas en Transit Gateway

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Tabla de rutas para Producción (aislada)
resource "aws_ec2_transit_gateway_route_table" "prod" {
  transit_gateway_id = aws_ec2_transit_gateway.main.id
  
  tags = {
    Name = "tgw-rt-prod"
  }
}

# Tabla de rutas para Desarrollo
resource "aws_ec2_transit_gateway_route_table" "dev" {
  transit_gateway_id = aws_ec2_transit_gateway.main.id
  
  tags = {
    Name = "tgw-rt-dev"
  }
}

# Tabla de rutas para Shared Services
resource "aws_ec2_transit_gateway_route_table" "shared" {
  transit_gateway_id = aws_ec2_transit_gateway.main.id
  
  tags = {
    Name = "tgw-rt-shared"
  }
}

# Asociaciones
resource "aws_ec2_transit_gateway_route_table_association" "prod" {
  transit_gateway_attachment_id  = aws_ec2_transit_gateway_vpc_attachment.prod.id
  transit_gateway_route_table_id = aws_ec2_transit_gateway_route_table.prod.id
}

# Propagaciones
resource "aws_ec2_transit_gateway_route_table_propagation" "prod_to_shared" {
  transit_gateway_attachment_id  = aws_ec2_transit_gateway_vpc_attachment.shared.id
  transit_gateway_route_table_id = aws_ec2_transit_gateway_route_table.prod.id
}

# Ruta estática a on-premise
resource "aws_ec2_transit_gateway_route" "to_onprem" {
  destination_cidr_block         = "10.1.0.0/16"
  transit_gateway_attachment_id  = aws_vpn_connection.onprem.transit_gateway_attachment_id
  transit_gateway_route_table_id = aws_ec2_transit_gateway_route_table.prod.id
}
```

</details>

📚 [AWS Transit Gateway Documentation](https://docs.aws.amazon.com/vpc/latest/tgw/)

---

## 5️⃣ Conectividad AWS ↔ Azure

### Arquitectura Multi-Cloud (AWS-Azure)

<details>
<summary>💡 Ver ejemplo completo</summary>

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS                                  │
│                                                              │
│  ┌───────────────────────────────────────────────────┐     │
│  │                VPC: 10.0.0.0/16                   │     │
│  │                                                   │     │
│  │  ┌──────────────┐         ┌──────────────┐      │     │
│  │  │ Private      │         │ Private      │      │     │
│  │  │ Subnet       │         │ Subnet       │      │     │
│  │  │              │         │              │      │     │
│  │  │ ┌──────────┐ │         │ ┌──────────┐ │      │     │
│  │  │ │   EC2    │ │         │ │   RDS    │ │      │     │
│  │  │ └──────────┘ │         │ └──────────┘ │      │     │
│  │  └──────────────┘         └──────────────┘      │     │
│  │                                                   │     │
│  │  ┌───────────────────────────────────────┐      │     │
│  │  │    Virtual Private Gateway (VGW)      │      │     │
│  │  │    or Transit Gateway                 │      │     │
│  │  └───────────────────┬───────────────────┘      │     │
│  └────────────────────────┼──────────────────────────┘     │
│                           │                                │
└───────────────────────────┼────────────────────────────────┘
                            │
                            │ VPN IPsec Tunnel
                            │ or ExpressRoute
                            │
┌───────────────────────────┼────────────────────────────────┐
│                         Azure                              │
│                           │                                │
│  ┌────────────────────────┼──────────────────────────┐    │
│  │                        │                          │    │
│  │  ┌─────────────────────▼────────────────────┐    │    │
│  │  │    Virtual Network Gateway               │    │    │
│  │  │    or Virtual WAN Hub                    │    │    │
│  │  └─────────────────────┬────────────────────┘    │    │
│  │                        │                          │    │
│  │         VNet: 10.10.0.0/16                       │    │
│  │                                                   │    │
│  │  ┌──────────────┐         ┌──────────────┐      │    │
│  │  │ Subnet       │         │ Subnet       │      │    │
│  │  │              │         │              │      │    │
│  │  │ ┌──────────┐ │         │ ┌──────────┐ │      │    │
│  │  │ │   VM     │ │         │ │ SQL DB   │ │      │    │
│  │  │ └──────────┘ │         │ └──────────┘ │      │    │
│  │  └──────────────┘         └──────────────┘      │    │
│  │                                                   │    │
│  └───────────────────────────────────────────────────┘    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

</details>

### Opciones de Conectividad

| Opción | Latencia | Ancho de Banda | Costo | Complejidad |
|--------|----------|----------------|-------|-------------|
| **VPN Site-to-Site** | Media | Hasta 1.25 Gbps | 💰 Bajo | 🟢 Baja |
| **ExpressRoute + Direct Connect** | Baja | 1-100 Gbps | 💰💰💰 Alto | 🔴 Alta |
| **Megaport/Equinix** | Baja | Flexible | 💰💰 Medio | 🟡 Media |

---

### Opción 1: VPN Site-to-Site (AWS ↔ Azure)

#### Arquitectura VPN AWS-Azure

```
AWS VPC                          Azure VNet
┌─────────────┐                 ┌─────────────┐
│             │                 │             │
│  10.0.0.0/16│                 │10.10.0.0/16 │
│             │                 │             │
│  ┌────────┐ │                 │ ┌────────┐  │
│  │  VGW   │ │                 │ │  VNG   │  │
│  └───┬────┘ │                 │ └───┬────┘  │
└──────┼──────┘                 └─────┼───────┘
       │                              │
       │ Tunnel 1: 52.1.2.3          │
       │◀────────────────────────────▶│
       │                              │
       │ Tunnel 2: 52.4.5.6          │
       │◀────────────────────────────▶│
       │                              │
```

---

#### Paso 1: Configurar AWS

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# AWS - Virtual Private Gateway
resource "aws_vpn_gateway" "to_azure" {
  vpc_id          = aws_vpc.main.id
  amazon_side_asn = 64512
  
  tags = {
    Name = "vgw-to-azure"
  }
}

# AWS - Customer Gateway (representa Azure VNG)
resource "aws_customer_gateway" "azure" {
  bgp_asn    = 65515  # Azure default ASN
  ip_address = azurerm_public_ip.vng_ip1.ip_address
  type       = "ipsec.1"
  
  tags = {
    Name = "cgw-azure"
  }
}

# AWS - VPN Connection
resource "aws_vpn_connection" "to_azure" {
  vpn_gateway_id      = aws_vpn_gateway.to_azure.id
  customer_gateway_id = aws_customer_gateway.azure.id
  type                = "ipsec.1"
  static_routes_only  = false
  
  tunnel1_inside_cidr   = "169.254.21.0/30"
  tunnel1_preshared_key = var.shared_key_tunnel1
  
  tunnel2_inside_cidr   = "169.254.22.0/30"
  tunnel2_preshared_key = var.shared_key_tunnel2
  
  tags = {
    Name = "vpn-to-azure"
  }
}

# Habilitar propagación de rutas
resource "aws_vpn_gateway_route_propagation" "to_azure" {
  vpn_gateway_id = aws_vpn_gateway.to_azure.id
  route_table_id = aws_route_table.private.id
}
```

</details>

---

#### Paso 2: Configurar Azure

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Azure - Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "vnet-main"
  address_space       = ["10.10.0.0/16"]
  location            = "East US"
  resource_group_name = azurerm_resource_group.main.name
}

# Azure - Gateway Subnet (requerida)
resource "azurerm_subnet" "gateway" {
  name                 = "GatewaySubnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.10.255.0/27"]
}

# Azure - Public IPs para VPN Gateway
resource "azurerm_public_ip" "vng_ip1" {
  name                = "vng-pip1"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

resource "azurerm_public_ip" "vng_ip2" {
  name                = "vng-pip2"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
}

# Azure - Virtual Network Gateway
resource "azurerm_virtual_network_gateway" "main" {
  name                = "vng-to-aws"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  
  type     = "Vpn"
  vpn_type = "RouteBased"
  
  active_active = true
  enable_bgp    = true
  sku           = "VpnGw2"
  
  bgp_settings {
    asn = 65515
  }
  
  ip_configuration {
    name                          = "vnetGatewayConfig1"
    public_ip_address_id          = azurerm_public_ip.vng_ip1.id
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = azurerm_subnet.gateway.id
  }
  
  ip_configuration {
    name                          = "vnetGatewayConfig2"
    public_ip_address_id          = azurerm_public_ip.vng_ip2.id
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = azurerm_subnet.gateway.id
  }
}

# Azure - Local Network Gateway (representa AWS VGW)
resource "azurerm_local_network_gateway" "aws_tunnel1" {
  name                = "lng-aws-tunnel1"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  gateway_address     = aws_vpn_connection.to_azure.tunnel1_address
  
  bgp_settings {
    asn                 = 64512
    bgp_peering_address = aws_vpn_connection.to_azure.tunnel1_bgp_asn
  }
}

resource "azurerm_local_network_gateway" "aws_tunnel2" {
  name                = "lng-aws-tunnel2"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  gateway_address     = aws_vpn_connection.to_azure.tunnel2_address
  
  bgp_settings {
    asn                 = 64512
    bgp_peering_address = aws_vpn_connection.to_azure.tunnel2_bgp_asn
  }
}

# Azure - VPN Connections
resource "azurerm_virtual_network_gateway_connection" "to_aws_tunnel1" {
  name                = "conn-to-aws-tunnel1"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  
  type                       = "IPsec"
  virtual_network_gateway_id = azurerm_virtual_network_gateway.main.id
  local_network_gateway_id   = azurerm_local_network_gateway.aws_tunnel1.id
  
  shared_key = var.shared_key_tunnel1
  
  enable_bgp = true
  
  ipsec_policy {
    dh_group         = "DHGroup14"
    ike_encryption   = "AES256"
    ike_integrity    = "SHA256"
    ipsec_encryption = "AES256"
    ipsec_integrity  = "SHA256"
    pfs_group        = "PFS14"
    sa_lifetime      = 3600
  }
}

resource "azurerm_virtual_network_gateway_connection" "to_aws_tunnel2" {
  name                = "conn-to-aws-tunnel2"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  
  type                       = "IPsec"
  virtual_network_gateway_id = azurerm_virtual_network_gateway.main.id
  local_network_gateway_id   = azurerm_local_network_gateway.aws_tunnel2.id
  
  shared_key = var.shared_key_tunnel2
  
  enable_bgp = true
  
  ipsec_policy {
    dh_group         = "DHGroup14"
    ike_encryption   = "AES256"
    ike_integrity    = "SHA256"
    ipsec_encryption = "AES256"
    ipsec_integrity  = "SHA256"
    pfs_group        = "PFS14"
    sa_lifetime      = 3600
  }
}
```

</details>

---

### Opción 2: ExpressRoute + Direct Connect

#### Arquitectura con Proveedor de Interconexión

<details>
<summary>💡 Ver ejemplo completo</summary>

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS                                  │
│                                                              │
│  ┌───────────────────────────────────────────────────┐     │
│  │                VPC: 10.0.0.0/16                   │     │
│  └───────────────────────┬───────────────────────────┘     │
│                          │                                  │
│  ┌───────────────────────▼───────────────────────────┐     │
│  │         Direct Connect Gateway                    │     │
│  └───────────────────────┬───────────────────────────┘     │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ AWS Direct Connect
                           │ (Dedicated Connection)
                           │
┌──────────────────────────┼──────────────────────────────────┐
│         Equinix/Megaport │                                  │
│         Cloud Exchange   │                                  │
│                          │                                  │
│  ┌───────────────────────▼───────────────────────────┐     │
│  │         Cross-Connect / Virtual Circuit           │     │
│  └───────────────────────┬───────────────────────────┘     │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ Azure ExpressRoute
                           │ (Dedicated Connection)
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                        Azure                                │
│                          │                                  │
│  ┌───────────────────────▼───────────────────────────┐     │
│  │         ExpressRoute Gateway                      │     │
│  └───────────────────────┬───────────────────────────┘     │
│                          │                                  │
│  ┌───────────────────────▼───────────────────────────┐     │
│  │              VNet: 10.10.0.0/16                   │     │
│  └───────────────────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

</details>

#### Proveedores de Interconexión

| Proveedor | Ubicaciones | Características |
|-----------|-------------|-----------------|
| **Equinix** | Global | Fabric Cloud Exchange, 2,900+ empresas |
| **Megaport** | Global | Software-defined, flexible |
| **PacketFabric** | US/EU | Automatizado, API-first |
| **Console Connect** | Global | PCCW Global, 750+ data centers |

---

#### Configuración con Megaport

**Paso 1: Crear Port en Megaport**

```bash
# Via Megaport Portal
1. Crear Port (1/10/100 Gbps)
2. Ubicación: Seleccionar data center común (ej: Equinix SV5)
3. Configurar VLAN tagging
```

**Paso 2: Crear VXC a AWS**

```bash
# Megaport Portal
1. Crear Virtual Cross Connect (VXC)
2. Destino: AWS Direct Connect
3. Región: us-east-1
4. VLAN: 100
5. Velocidad: 1 Gbps
6. Aceptar en AWS Console
```

**Paso 3: Crear VXC a Azure**

```bash
# Megaport Portal
1. Crear Virtual Cross Connect (VXC)
2. Destino: Azure ExpressRoute
3. Región: East US
4. VLAN: 200
5. Velocidad: 1 Gbps
6. Obtener Service Key de Azure
```

**Paso 4: Configurar Azure ExpressRoute**

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Azure - ExpressRoute Circuit
resource "azurerm_express_route_circuit" "main" {
  name                  = "er-circuit-to-aws"
  resource_group_name   = azurerm_resource_group.main.name
  location              = azurerm_resource_group.main.location
  service_provider_name = "Megaport"
  peering_location      = "Silicon Valley"
  bandwidth_in_mbps     = 1000
  
  sku {
    tier   = "Standard"
    family = "MeteredData"
  }
}

# Azure - ExpressRoute Gateway
resource "azurerm_virtual_network_gateway" "expressroute" {
  name                = "vng-expressroute"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  
  type     = "ExpressRoute"
  vpn_type = "RouteBased"
  sku      = "Standard"
  
  ip_configuration {
    name                          = "vnetGatewayConfig"
    public_ip_address_id          = azurerm_public_ip.er_gateway.id
    private_ip_address_allocation = "Dynamic"
    subnet_id                     = azurerm_subnet.gateway.id
  }
}

# Conectar ExpressRoute Circuit al Gateway
resource "azurerm_virtual_network_gateway_connection" "expressroute" {
  name                = "conn-expressroute"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  
  type                       = "ExpressRoute"
  virtual_network_gateway_id = azurerm_virtual_network_gateway.expressroute.id
  express_route_circuit_id   = azurerm_express_route_circuit.main.id
}
```

</details>

📚 [AWS-Azure Connectivity](https://docs.microsoft.com/en-us/azure/expressroute/expressroute-connectivity-models)

---

## 6️⃣ Monitoreo y Troubleshooting

### Monitoreo de Conexiones

#### CloudWatch Metrics para VPN

<details>
<summary>🐍 Ver script completo de Python</summary>

```python
"""
Script para monitorear estado de túneles VPN
"""
import boto3
from datetime import datetime, timedelta

ec2 = boto3.client('ec2')
cloudwatch = boto3.client('cloudwatch')

def check_vpn_status():
    """
    Verifica estado de conexiones VPN
    """
    response = ec2.describe_vpn_connections()
    
    for vpn in response['VpnConnections']:
        vpn_id = vpn['VpnConnectionId']
        state = vpn['State']
        
        print(f"\nVPN Connection: {vpn_id}")
        print(f"Estado: {state}")
        
        # Verificar túneles
        for i, tunnel in enumerate(vpn['VgwTelemetry'], 1):
            status = tunnel['Status']
            last_status_change = tunnel['LastStatusChange']
            
            print(f"\n  Túnel {i}:")
            print(f"    Estado: {status}")
            print(f"    Último cambio: {last_status_change}")
            print(f"    Outside IP: {tunnel['OutsideIpAddress']}")
            
            if status != 'UP':
                print(f"    ⚠️ ALERTA: Túnel {i} está {status}")
        
        # Obtener métricas de CloudWatch
        get_vpn_metrics(vpn_id)

def get_vpn_metrics(vpn_id):
    """
    Obtiene métricas de CloudWatch para VPN
    """
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=1)
    
    # Bytes transferidos
    response = cloudwatch.get_metric_statistics(
        Namespace='AWS/VPN',
        MetricName='TunnelDataIn',
        Dimensions=[
            {'Name': 'VpnId', 'Value': vpn_id}
        ],
        StartTime=start_time,
        EndTime=end_time,
        Period=300,
        Statistics=['Sum']
    )
    
    if response['Datapoints']:
        total_bytes = sum(dp['Sum'] for dp in response['Datapoints'])
        print(f"\n  Datos recibidos (última hora): {total_bytes / 1024 / 1024:.2f} MB")

# Ejecutar verificación
check_vpn_status()
```

</details>

---

#### Alarmas de CloudWatch

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Alarma: Túnel VPN caído
resource "aws_cloudwatch_metric_alarm" "vpn_tunnel_down" {
  alarm_name          = "vpn-tunnel-down"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "TunnelState"
  namespace           = "AWS/VPN"
  period              = "300"
  statistic           = "Maximum"
  threshold           = "1"
  alarm_description   = "Alerta cuando un túnel VPN está caído"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    VpnId = aws_vpn_connection.main.id
  }
}

# Alarma: Bajo throughput en Direct Connect
resource "aws_cloudwatch_metric_alarm" "dx_low_throughput" {
  alarm_name          = "dx-low-throughput"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "3"
  metric_name         = "ConnectionBpsEgress"
  namespace           = "AWS/DX"
  period              = "300"
  statistic           = "Average"
  threshold           = "100000000"  # 100 Mbps
  alarm_description   = "Alerta cuando throughput de DX es bajo"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ConnectionId = aws_dx_connection.main.id
  }
}

# Alarma: Errores en Direct Connect
resource "aws_cloudwatch_metric_alarm" "dx_errors" {
  alarm_name          = "dx-connection-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ConnectionErrorCount"
  namespace           = "AWS/DX"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "Alerta cuando hay errores en Direct Connect"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ConnectionId = aws_dx_connection.main.id
  }
}
```

</details>

---

### Troubleshooting VPN

#### Problema 1: Túnel VPN No Establece

**Síntomas:**
- Estado del túnel: DOWN
- No hay tráfico

**Verificaciones:**

```bash
# 1. Verificar estado de VPN
aws ec2 describe-vpn-connections \
  --vpn-connection-ids vpn-12345678

# 2. Verificar Customer Gateway
aws ec2 describe-customer-gateways \
  --customer-gateway-ids cgw-12345678

# 3. Verificar configuración de firewall on-premise
# - Puerto UDP 500 (IKE)
# - Puerto UDP 4500 (NAT-T)
# - Protocolo ESP (IP protocol 50)

# 4. Verificar pre-shared key
# Debe coincidir exactamente entre AWS y dispositivo on-premise

# 5. Verificar configuración de Phase 1 y Phase 2
# Deben coincidir los algoritmos de cifrado
```

**Solución:**

```bash
# Recrear túnel con nueva configuración
aws ec2 modify-vpn-tunnel-options \
  --vpn-connection-id vpn-12345678 \
  --vpn-tunnel-outside-ip-address 52.1.2.3 \
  --tunnel-options \
    PreSharedKey=NewSecureKey123!,\
    Phase1EncryptionAlgorithms=[{Value=AES256}],\
    Phase2EncryptionAlgorithms=[{Value=AES256}],\
    Phase1IntegrityAlgorithms=[{Value=SHA2-256}],\
    Phase2IntegrityAlgorithms=[{Value=SHA2-256}],\
    Phase1DHGroupNumbers=[{Value=14}],\
    Phase2DHGroupNumbers=[{Value=14}]
```

---

#### Problema 2: Túnel UP pero Sin Conectividad

**Síntomas:**
- Estado del túnel: UP
- No se puede hacer ping a recursos

**Verificaciones:**

```bash
# 1. Verificar rutas en AWS
aws ec2 describe-route-tables \
  --filters "Name=vpc-id,Values=vpc-12345678"

# 2. Verificar propagación de rutas BGP
aws ec2 describe-vpn-connections \
  --vpn-connection-ids vpn-12345678 \
  --query 'VpnConnections[0].Routes'

# 3. Verificar Security Groups
aws ec2 describe-security-groups \
  --group-ids sg-12345678

# 4. Verificar Network ACLs
aws ec2 describe-network-acls \
  --filters "Name=vpc-id,Values=vpc-12345678"
```

**Solución:**

```bash
# Agregar ruta estática si BGP no funciona
aws ec2 create-vpn-connection-route \
  --vpn-connection-id vpn-12345678 \
  --destination-cidr-block 10.1.0.0/16

# Verificar Security Group permite tráfico
aws ec2 authorize-security-group-ingress \
  --group-id sg-12345678 \
  --protocol all \
  --source-group sg-12345678
```

---

### Troubleshooting Direct Connect

#### Problema 1: Direct Connect No Establece

**Verificaciones:**

```bash
# 1. Verificar estado de conexión
aws directconnect describe-connections \
  --connection-id dxcon-12345678

# 2. Verificar Virtual Interface
aws directconnect describe-virtual-interfaces \
  --virtual-interface-id dxvif-12345678

# 3. Verificar LOA-CFA (Letter of Authorization)
# Debe estar completado y enviado al proveedor

# 4. Verificar cross-connect en data center
# Debe estar físicamente conectado
```

**Estados de conexión:**

| Estado | Significado | Acción |
|--------|-------------|--------|
| `requested` | Solicitado | Esperar aprobación |
| `pending` | Pendiente | Completar LOA-CFA |
| `available` | Disponible | Crear VIF |
| `down` | Caído | Verificar conexión física |
| `deleting` | Eliminando | - |
| `deleted` | Eliminado | - |

---

#### Problema 2: BGP No Establece

**Verificaciones:**

```bash
# 1. Verificar configuración BGP
aws directconnect describe-virtual-interfaces \
  --virtual-interface-id dxvif-12345678 \
  --query 'virtualInterfaces[0].bgpPeers'

# 2. Verificar ASN
# AWS ASN: 64512 (default) o custom
# Customer ASN: Debe ser diferente

# 3. Verificar direcciones IP de peering
# Deben estar en el mismo /30
# Ejemplo: 169.254.10.1/30 (AWS) y 169.254.10.2/30 (Customer)
```

**Comandos de diagnóstico en router on-premise:**

```cisco
! Cisco
show ip bgp summary
show ip bgp neighbors 169.254.10.1
show ip route bgp

! Verificar que se reciben rutas de AWS
show ip bgp neighbors 169.254.10.1 routes
```

---

### Herramientas de Diagnóstico

#### VPC Reachability Analyzer

```bash
# Analizar conectividad entre recursos
aws ec2 create-network-insights-path \
  --source i-1234567890abcdef0 \
  --destination i-0987654321fedcba0 \
  --protocol tcp \
  --destination-port 443

# Iniciar análisis
aws ec2 start-network-insights-analysis \
  --network-insights-path-id nip-12345678

# Ver resultados
aws ec2 describe-network-insights-analyses \
  --network-insights-analysis-ids nia-12345678
```

---

#### VPC Flow Logs

```hcl
# Habilitar Flow Logs para troubleshooting
resource "aws_flow_log" "main" {
  iam_role_arn    = aws_iam_role.flow_logs.arn
  log_destination = aws_cloudwatch_log_group.flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id
  
  tags = {
    Name = "vpc-flow-logs"
  }
}

resource "aws_cloudwatch_log_group" "flow_logs" {
  name              = "/aws/vpc/flow-logs"
  retention_in_days = 7
}
```

**Analizar Flow Logs:**

```bash
# Buscar tráfico rechazado
aws logs filter-log-events \
  --log-group-name /aws/vpc/flow-logs \
  --filter-pattern '[version, account, eni, source, destination, srcport, destport, protocol, packets, bytes, windowstart, windowend, action="REJECT", flowlogstatus]' \
  --start-time $(date -u -d '1 hour ago' +%s)000 \
  --max-items 50
```

---

#### Traceroute y MTU Testing

```bash
# Traceroute a recurso en AWS
traceroute -n 10.0.1.10

# Test de MTU (Path MTU Discovery)
ping -M do -s 1400 10.0.1.10

# Incrementar tamaño hasta encontrar MTU máximo
ping -M do -s 1450 10.0.1.10
ping -M do -s 1500 10.0.1.10

# MTU recomendado para VPN: 1400 bytes
# MTU recomendado para Direct Connect: 1500 bytes (jumbo frames: 9001)
```

---

### Dashboard de Monitoreo

<details>
<summary>🐍 Ver script completo de Python</summary>

```python
"""
Crear dashboard de CloudWatch para conectividad híbrida
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
                    ["AWS/VPN", "TunnelState", {"stat": "Maximum"}],
                    [".", "TunnelDataIn", {"stat": "Sum"}],
                    [".", "TunnelDataOut", {"stat": "Sum"}]
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-east-1",
                "title": "VPN Status and Traffic",
                "yAxis": {
                    "left": {"min": 0}
                }
            }
        },
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["AWS/DX", "ConnectionState", {"stat": "Maximum"}],
                    [".", "ConnectionBpsEgress", {"stat": "Average"}],
                    [".", "ConnectionBpsIngress", {"stat": "Average"}],
                    [".", "ConnectionErrorCount", {"stat": "Sum"}]
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-east-1",
                "title": "Direct Connect Status"
            }
        },
        {
            "type": "metric",
            "properties": {
                "metrics": [
                    ["AWS/TransitGateway", "BytesIn", {"stat": "Sum"}],
                    [".", "BytesOut", {"stat": "Sum"}],
                    [".", "PacketsIn", {"stat": "Sum"}],
                    [".", "PacketsOut", {"stat": "Sum"}]
                ],
                "period": 300,
                "stat": "Sum",
                "region": "us-east-1",
                "title": "Transit Gateway Traffic"
            }
        },
        {
            "type": "log",
            "properties": {
                "query": """
                    SOURCE '/aws/vpc/flow-logs'
                    | fields @timestamp, srcAddr, dstAddr, action
                    | filter action = "REJECT"
                    | stats count() by srcAddr, dstAddr
                    | sort count desc
                    | limit 20
                """,
                "region": "us-east-1",
                "title": "Top Rejected Connections"
            }
        }
    ]
}

response = cloudwatch.put_dashboard(
    DashboardName='Hybrid-Connectivity-Dashboard',
    DashboardBody=json.dumps(dashboard_body)
)

print("Dashboard creado exitosamente")
```

</details>

📚 [VPN Monitoring](https://docs.aws.amazon.com/vpn/latest/s2svpn/monitoring-overview-vpn.html)

---

## 7️⃣ Seguridad en Nube Híbrida

### Mejores Prácticas de Seguridad

#### 1. Cifrado en Tránsito

**VPN Site-to-Site:**
- ✅ IPsec con AES-256
- ✅ SHA-2 para integridad
- ✅ Perfect Forward Secrecy (PFS)
- ✅ IKEv2 preferido sobre IKEv1

**Direct Connect:**
- ⚠️ No cifrado por defecto
- ✅ Usar MACsec (802.1AE) para cifrado de capa 2
- ✅ O combinar con VPN sobre Direct Connect

```hcl
# VPN sobre Direct Connect para cifrado
resource "aws_vpn_connection" "over_dx" {
  customer_gateway_id = aws_customer_gateway.onprem.id
  transit_gateway_id  = aws_ec2_transit_gateway.main.id
  type                = "ipsec.1"
  
  # Usar Direct Connect como transporte
  transport_transit_gateway_attachment_id = aws_dx_gateway_association.main.id
  
  tags = {
    Name = "vpn-over-dx"
  }
}
```

---

#### 2. Segmentación de Red

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Separar tráfico por función usando VLANs
resource "aws_dx_private_virtual_interface" "prod" {
  connection_id  = aws_dx_connection.main.id
  name           = "prod-vif"
  vlan           = 100
  address_family = "ipv4"
  bgp_asn        = 65000
  
  tags = {
    Environment = "production"
  }
}

resource "aws_dx_private_virtual_interface" "dev" {
  connection_id  = aws_dx_connection.main.id
  name           = "dev-vif"
  vlan           = 200
  address_family = "ipv4"
  bgp_asn        = 65001
  
  tags = {
    Environment = "development"
  }
}

# Transit Gateway con tablas de rutas aisladas
resource "aws_ec2_transit_gateway_route_table" "prod" {
  transit_gateway_id = aws_ec2_transit_gateway.main.id
  
  tags = {
    Name = "tgw-rt-prod-isolated"
  }
}

resource "aws_ec2_transit_gateway_route_table" "dev" {
  transit_gateway_id = aws_ec2_transit_gateway.main.id
  
  tags = {
    Name = "tgw-rt-dev-isolated"
  }
}
```

</details>

---

#### 3. Control de Acceso

**Security Groups:**

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Security Group para recursos accesibles desde on-premise
resource "aws_security_group" "hybrid_access" {
  name        = "hybrid-access-sg"
  description = "Permite acceso desde on-premise"
  vpc_id      = aws_vpc.main.id
  
  # Permitir SSH solo desde red on-premise
  ingress {
    description = "SSH desde on-premise"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.1.0.0/16"]  # Red on-premise
  }
  
  # Permitir HTTPS desde on-premise
  ingress {
    description = "HTTPS desde on-premise"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.1.0.0/16"]
  }
  
  # Permitir todo el tráfico saliente
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "hybrid-access-sg"
  }
}
```

</details>

**Network ACLs:**

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# NACL para subnet con acceso híbrido
resource "aws_network_acl" "hybrid" {
  vpc_id     = aws_vpc.main.id
  subnet_ids = aws_subnet.hybrid[*].id
  
  # Permitir tráfico desde on-premise
  ingress {
    protocol   = -1
    rule_no    = 100
    action     = "allow"
    cidr_block = "10.1.0.0/16"
    from_port  = 0
    to_port    = 0
  }
  
  # Denegar todo lo demás
  ingress {
    protocol   = -1
    rule_no    = 200
    action     = "deny"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }
  
  # Permitir respuestas
  egress {
    protocol   = -1
    rule_no    = 100
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = 0
    to_port    = 0
  }
  
  tags = {
    Name = "hybrid-nacl"
  }
}
```

</details>

---

#### 4. Autenticación y Autorización

**AWS PrivateLink para Servicios:**

```hcl
# Exponer servicio interno a on-premise via PrivateLink
resource "aws_vpc_endpoint_service" "internal_api" {
  acceptance_required        = true
  network_load_balancer_arns = [aws_lb.internal_api.arn]
  
  allowed_principals = [
    "arn:aws:iam::123456789012:root"  # Cuenta on-premise
  ]
  
  tags = {
    Name = "internal-api-endpoint-service"
  }
}

# VPC Endpoint en VPC on-premise (o conectada)
resource "aws_vpc_endpoint" "to_internal_api" {
  vpc_id              = aws_vpc.onprem_connected.id
  service_name        = aws_vpc_endpoint_service.internal_api.service_name
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.endpoint.id]
  
  private_dns_enabled = true
  
  tags = {
    Name = "endpoint-to-internal-api"
  }
}
```

---

#### 5. Logging y Auditoría

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# CloudTrail para auditar cambios en conectividad
resource "aws_cloudtrail" "hybrid" {
  name                          = "hybrid-connectivity-trail"
  s3_bucket_name                = aws_s3_bucket.cloudtrail.id
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true
  
  event_selector {
    read_write_type           = "All"
    include_management_events = true
    
    data_resource {
      type   = "AWS::EC2::Instance"
      values = ["arn:aws:ec2:*:*:instance/*"]
    }
  }
  
  tags = {
    Name = "hybrid-connectivity-trail"
  }
}

# VPC Flow Logs
resource "aws_flow_log" "hybrid" {
  iam_role_arn    = aws_iam_role.flow_logs.arn
  log_destination = aws_cloudwatch_log_group.flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id
  
  tags = {
    Name = "hybrid-flow-logs"
  }
}

# GuardDuty para detección de amenazas
resource "aws_guardduty_detector" "main" {
  enable = true
  
  datasources {
    s3_logs {
      enable = true
    }
    kubernetes {
      audit_logs {
        enable = true
      }
    }
  }
  
  tags = {
    Name = "hybrid-guardduty"
  }
}
```

</details>

---

### Compliance y Gobernanza

#### AWS Config Rules

```hcl
# Verificar que VPN usa cifrado fuerte
resource "aws_config_config_rule" "vpn_encryption" {
  name = "vpn-strong-encryption"
  
  source {
    owner             = "AWS"
    source_identifier = "VPN_TUNNEL_UP"
  }
  
  depends_on = [aws_config_configuration_recorder.main]
}

# Verificar que Direct Connect tiene backup
resource "aws_config_config_rule" "dx_backup" {
  name = "direct-connect-backup"
  
  source {
    owner             = "CUSTOM_LAMBDA"
    source_identifier = aws_lambda_function.check_dx_backup.arn
  }
  
  depends_on = [aws_config_configuration_recorder.main]
}
```

---

## 8️⃣ Optimización de Costos

### Análisis de Costos

#### Componentes de Costo

**VPN Site-to-Site:**
```
Costo por hora de VPN Connection: $0.05/hora
Transferencia de datos saliente: $0.09/GB (primeros 10 TB)

Ejemplo mensual:
- VPN Connection: $0.05 × 730 horas = $36.50
- Datos salientes: 1 TB × $0.09 = $90
- Total: ~$126.50/mes
```

**Direct Connect:**
```
Port Fee (1 Gbps): $0.30/hora
Transferencia de datos saliente: $0.02/GB

Ejemplo mensual:
- Port Fee: $0.30 × 730 horas = $219
- Datos salientes: 10 TB × $0.02 = $200
- Total: ~$419/mes

Break-even vs VPN: ~2.3 TB/mes de transferencia
```

**Transit Gateway:**
```
Attachment por hora: $0.05/hora por attachment
Procesamiento de datos: $0.02/GB

Ejemplo mensual (3 VPCs + 1 VPN):
- Attachments: 4 × $0.05 × 730 = $146
- Procesamiento: 5 TB × $0.02 = $100
- Total: ~$246/mes
```

---

### Estrategias de Optimización

#### 1. Usar Direct Connect para Tráfico Alto

<details>
<summary>🐍 Ver script completo de Python</summary>

```python
"""
Calculadora de break-even VPN vs Direct Connect
"""
def calculate_breakeven(monthly_data_gb):
    """
    Calcula el punto de equilibrio entre VPN y Direct Connect
    """
    # Costos VPN
    vpn_connection_cost = 0.05 * 730  # $36.50
    vpn_data_cost = monthly_data_gb * 0.09
    vpn_total = vpn_connection_cost + vpn_data_cost
    
    # Costos Direct Connect (1 Gbps)
    dx_port_cost = 0.30 * 730  # $219
    dx_data_cost = monthly_data_gb * 0.02
    dx_total = dx_port_cost + dx_data_cost
    
    print(f"Transferencia mensual: {monthly_data_gb} GB")
    print(f"\nVPN Site-to-Site:")
    print(f"  Connection: ${vpn_connection_cost:.2f}")
    print(f"  Data transfer: ${vpn_data_cost:.2f}")
    print(f"  Total: ${vpn_total:.2f}")
    
    print(f"\nDirect Connect (1 Gbps):")
    print(f"  Port fee: ${dx_port_cost:.2f}")
    print(f"  Data transfer: ${dx_data_cost:.2f}")
    print(f"  Total: ${dx_total:.2f}")
    
    savings = vpn_total - dx_total
    if savings > 0:
        print(f"\n✅ Direct Connect ahorra ${savings:.2f}/mes")
    else:
        print(f"\n❌ VPN es más económico por ${abs(savings):.2f}/mes")
    
    return dx_total < vpn_total

# Ejemplos
print("=== Escenario 1: Bajo tráfico ===")
calculate_breakeven(1000)  # 1 TB

print("\n=== Escenario 2: Tráfico medio ===")
calculate_breakeven(3000)  # 3 TB

print("\n=== Escenario 3: Alto tráfico ===")
calculate_breakeven(10000)  # 10 TB
```

</details>

---

#### 2. Consolidar con Transit Gateway

```hcl
# Antes: Múltiples VPN connections (costoso)
# VPN 1: $36.50/mes
# VPN 2: $36.50/mes
# VPN 3: $36.50/mes
# Total: $109.50/mes

# Después: Transit Gateway con 1 VPN (más eficiente)
resource "aws_ec2_transit_gateway" "consolidated" {
  description = "TGW para consolidar conectividad"
  
  tags = {
    Name = "tgw-consolidated"
  }
}

# 1 VPN al Transit Gateway
resource "aws_vpn_connection" "consolidated" {
  customer_gateway_id = aws_customer_gateway.onprem.id
  transit_gateway_id  = aws_ec2_transit_gateway.consolidated.id
  type                = "ipsec.1"
}

# Múltiples VPCs conectadas al TGW
# TGW: $36.50 (1 VPN) + $146 (4 attachments) = $182.50/mes
# Ahorro: $109.50 - $36.50 = $73/mes en VPN connections
```

---

#### 3. Programar Conexiones No Críticas

<details>
<summary>🐍 Ver script completo de Python</summary>

```python
"""
Lambda para apagar VPN connections fuera de horario laboral
"""
import boto3
from datetime import datetime

ec2 = boto3.client('ec2')

def lambda_handler(event, context):
    """
    Desconecta VPN connections con tag Schedule=business-hours
    fuera del horario laboral
    """
    now = datetime.now()
    current_hour = now.hour
    current_day = now.weekday()  # 0=Lunes, 6=Domingo
    
    # Horario laboral: 8am-6pm lunes-viernes
    is_business_hours = (current_day < 5 and 8 <= current_hour < 18)
    
    # Obtener VPN connections con Schedule tag
    response = ec2.describe_vpn_connections(
        Filters=[
            {'Name': 'tag:Schedule', 'Values': ['business-hours']}
        ]
    )
    
    for vpn in response['VpnConnections']:
        vpn_id = vpn['VpnConnectionId']
        state = vpn['State']
        
        if is_business_hours and state == 'deleted':
            # Recrear VPN durante horario laboral
            print(f"Recreando VPN {vpn_id} (horario laboral)")
            # Implementar lógica de recreación
            
        elif not is_business_hours and state == 'available':
            # Eliminar VPN fuera de horario
            print(f"Eliminando VPN {vpn_id} (fuera de horario)")
            ec2.delete_vpn_connection(VpnConnectionId=vpn_id)
    
    return {
        'statusCode': 200,
        'body': 'VPN scheduling completed'
    }
```

</details>

---

#### 4. Monitorear y Optimizar Transferencia de Datos

<details>
<summary>🐍 Ver script completo de Python</summary>

```python
"""
Analizar patrones de transferencia de datos
"""
import boto3
from datetime import datetime, timedelta

cloudwatch = boto3.client('cloudwatch')
ce = boto3.client('ce')

def analyze_data_transfer():
    """
    Analiza costos de transferencia de datos
    """
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    
    # Obtener costos de transferencia de datos
    response = ce.get_cost_and_usage(
        TimePeriod={
            'Start': start_date,
            'End': end_date
        },
        Granularity='MONTHLY',
        Metrics=['UnblendedCost', 'UsageQuantity'],
        Filter={
            'Dimensions': {
                'Key': 'USAGE_TYPE_GROUP',
                'Values': ['EC2: Data Transfer']
            }
        }
    )
    
    for result in response['ResultsByTime']:
        cost = float(result['Total']['UnblendedCost']['Amount'])
        usage_gb = float(result['Total']['UsageQuantity']['Amount'])
        
        print(f"Período: {result['TimePeriod']['Start']} - {result['TimePeriod']['End']}")
        print(f"Transferencia: {usage_gb:.2f} GB")
        print(f"Costo: ${cost:.2f}")
        
        # Recomendaciones
        if usage_gb > 2000:  # > 2 TB
            print("\n💡 Recomendación: Considerar Direct Connect")
            print(f"   Ahorro estimado: ${(usage_gb * 0.09) - (usage_gb * 0.02):.2f}/mes")

analyze_data_transfer()
```

</details>

📚 [AWS Pricing Calculator](https://calculator.aws/)

---

## 9️⃣ Casos de Uso y Arquitecturas

### Caso 1: Migración Gradual a la Nube

**Escenario:**
- Aplicación monolítica on-premise
- Migración por fases a AWS
- Mantener conectividad durante transición

**Arquitectura:**

<details>
<summary>💡 Ver ejemplo completo</summary>

```
┌─────────────────────────────────────────────────────────────┐
│                    On-Premise                                │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │              │         │              │                 │
│  │  Frontend    │────────▶│  Backend     │                 │
│  │  (Legacy)    │         │  (Legacy)    │                 │
│  │              │         │              │                 │
│  └──────────────┘         └──────┬───────┘                 │
│                                  │                         │
└──────────────────────────────────┼──────────────────────────┘
                                   │
                                   │ VPN/Direct Connect
                                   │
┌──────────────────────────────────┼──────────────────────────┐
│                    AWS           │                          │
│                                  │                          │
│  ┌───────────────────────────────▼────────────────────┐    │
│  │              Transit Gateway                       │    │
│  └───────────────────────────────┬────────────────────┘    │
│                                  │                          │
│  ┌───────────────────────────────▼────────────────────┐    │
│  │                    VPC                             │    │
│  │                                                     │    │
│  │  ┌──────────────┐         ┌──────────────┐        │    │
│  │  │              │         │              │        │    │
│  │  │  Database    │◀────────│  New         │        │    │
│  │  │  (RDS)       │         │  Microservice│        │    │
│  │  │              │         │              │        │    │
│  │  └──────────────┘         └──────────────┘        │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

</details>

**Implementación:**

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Fase 1: Migrar base de datos
resource "aws_db_instance" "migrated" {
  identifier     = "migrated-db"
  engine         = "mysql"
  instance_class = "db.t3.large"
  
  # Accesible desde on-premise
  vpc_security_group_ids = [aws_security_group.db_from_onprem.id]
  db_subnet_group_name   = aws_db_subnet_group.private.name
  
  tags = {
    MigrationPhase = "1"
  }
}

# Security Group permite acceso desde on-premise
resource "aws_security_group" "db_from_onprem" {
  name   = "db-from-onprem"
  vpc_id = aws_vpc.main.id
  
  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["10.1.0.0/16"]  # Red on-premise
  }
}

# Fase 2: Migrar microservicios
resource "aws_ecs_service" "new_microservice" {
  name            = "new-microservice"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.microservice.arn
  desired_count   = 3
  
  network_configuration {
    subnets         = aws_subnet.private[*].id
    security_groups = [aws_security_group.microservice.id]
  }
  
  tags = {
    MigrationPhase = "2"
  }
}

# Fase 3: Migrar frontend (última fase)
# Backend on-premise puede acceder a microservicios en AWS
```

</details>

---

### Caso 2: Disaster Recovery Multi-Cloud

**Escenario:**
- Producción en AWS
- DR en Azure
- Failover automático

**Arquitectura:**

<details>
<summary>💡 Ver ejemplo completo</summary>

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS (Primary)                             │
│                                                              │
│  ┌───────────────────────────────────────────────────┐     │
│  │                VPC: 10.0.0.0/16                   │     │
│  │                                                   │     │
│  │  ┌──────────────┐         ┌──────────────┐      │     │
│  │  │              │         │              │      │     │
│  │  │  Application │────────▶│  RDS         │      │     │
│  │  │  (Active)    │         │  (Primary)   │      │     │
│  │  │              │         │              │      │     │
│  │  └──────────────┘         └──────┬───────┘      │     │
│  │                                  │              │     │
│  │                                  │ Replication  │     │
│  └──────────────────────────────────┼──────────────┘     │
│                                     │                    │
└─────────────────────────────────────┼────────────────────┘
                                      │
                                      │ VPN/ExpressRoute
                                      │
┌─────────────────────────────────────┼────────────────────┐
│                    Azure (DR)       │                    │
│                                     │                    │
│  ┌──────────────────────────────────▼───────────────┐   │
│  │              VNet: 10.10.0.0/16                   │   │
│  │                                                   │   │
│  │  ┌──────────────┐         ┌──────────────┐      │   │
│  │  │              │         │              │      │   │
│  │  │  Application │         │  SQL DB      │      │   │
│  │  │  (Standby)   │         │  (Replica)   │      │   │
│  │  │              │         │              │      │   │
│  │  └──────────────┘         └──────────────┘      │   │
│  │                                                   │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

</details>

**Implementación:**

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# AWS - Primary
resource "aws_db_instance" "primary" {
  identifier     = "primary-db"
  engine         = "mysql"
  instance_class = "db.r5.xlarge"
  
  backup_retention_period = 7
  
  tags = {
    Role = "primary"
  }
}

# Replicación a Azure usando DMS
resource "aws_dms_replication_instance" "main" {
  replication_instance_id   = "dms-to-azure"
  replication_instance_class = "dms.t3.medium"
  allocated_storage          = 100
  
  vpc_security_group_ids = [aws_security_group.dms.id]
  replication_subnet_group_id = aws_dms_replication_subnet_group.main.id
}

resource "aws_dms_endpoint" "source" {
  endpoint_id   = "source-mysql"
  endpoint_type = "source"
  engine_name   = "mysql"
  
  server_name = aws_db_instance.primary.address
  port        = 3306
  username    = var.db_username
  password    = var.db_password
  database_name = "production"
}

resource "aws_dms_endpoint" "target" {
  endpoint_id   = "target-azure-sql"
  endpoint_type = "target"
  engine_name   = "sqlserver"
  
  server_name = azurerm_mssql_server.dr.fully_qualified_domain_name
  port        = 1433
  username    = var.azure_db_username
  password    = var.azure_db_password
  database_name = "production_dr"
}

# Azure - DR
resource "azurerm_mssql_server" "dr" {
  name                         = "dr-sql-server"
  resource_group_name          = azurerm_resource_group.dr.name
  location                     = "West US 2"
  version                      = "12.0"
  administrator_login          = var.azure_db_username
  administrator_login_password = var.azure_db_password
  
  tags = {
    Role = "dr"
  }
}

# Route 53 Health Check y Failover
resource "aws_route53_health_check" "primary" {
  fqdn              = aws_lb.primary.dns_name
  port              = 443
  type              = "HTTPS"
  resource_path     = "/health"
  failure_threshold = 3
  request_interval  = 30
  
  tags = {
    Name = "primary-health-check"
  }
}

resource "aws_route53_record" "failover_primary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "app.example.com"
  type    = "A"
  
  failover_routing_policy {
    type = "PRIMARY"
  }
  
  set_identifier  = "primary"
  health_check_id = aws_route53_health_check.primary.id
  
  alias {
    name                   = aws_lb.primary.dns_name
    zone_id                = aws_lb.primary.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "failover_secondary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "app.example.com"
  type    = "A"
  
  failover_routing_policy {
    type = "SECONDARY"
  }
  
  set_identifier = "secondary"
  
  alias {
    name                   = azurerm_traffic_manager_profile.dr.fqdn
    zone_id                = azurerm_traffic_manager_profile.dr.id
    evaluate_target_health = true
  }
}
```

</details>

---

### Caso 3: Shared Services Hub

**Escenario:**
- Servicios compartidos (DNS, AD, monitoring)
- Múltiples VPCs y on-premise
- Acceso centralizado

**Arquitectura:**

```
                    ┌─────────────────────┐
                    │  Transit Gateway    │
                    │  (Hub Central)      │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        │                      │                      │
   ┌────▼────┐           ┌────▼────┐           ┌────▼────┐
   │ VPC     │           │ VPC     │           │ VPC     │
   │ Shared  │           │ Prod    │           │ Dev     │
   │ Services│           │         │           │         │
   │         │           │         │           │         │
   │ - DNS   │           │ - Apps  │           │ - Apps  │
   │ - AD    │           │         │           │         │
   │ - Monitor│          │         │           │         │
   └─────────┘           └─────────┘           └─────────┘
        │
        │ VPN/Direct Connect
        │
   ┌────▼────────┐
   │ On-Premise  │
   │             │
   │ - Users     │
   │ - Legacy    │
   └─────────────┘
```

**Implementación:**

<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# VPC de Shared Services
resource "aws_vpc" "shared_services" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "shared-services-vpc"
  }
}

# Route 53 Resolver Endpoint (DNS compartido)
resource "aws_route53_resolver_endpoint" "inbound" {
  name      = "shared-dns-inbound"
  direction = "INBOUND"
  
  security_group_ids = [aws_security_group.dns_resolver.id]
  
  ip_address {
    subnet_id = aws_subnet.shared_services_a.id
  }
  
  ip_address {
    subnet_id = aws_subnet.shared_services_b.id
  }
  
  tags = {
    Name = "shared-dns-inbound"
  }
}

resource "aws_route53_resolver_endpoint" "outbound" {
  name      = "shared-dns-outbound"
  direction = "OUTBOUND"
  
  security_group_ids = [aws_security_group.dns_resolver.id]
  
  ip_address {
    subnet_id = aws_subnet.shared_services_a.id
  }
  
  ip_address {
    subnet_id = aws_subnet.shared_services_b.id
  }
  
  tags = {
    Name = "shared-dns-outbound"
  }
}

# Regla para reenviar consultas DNS a on-premise
resource "aws_route53_resolver_rule" "onprem" {
  domain_name          = "corp.example.com"
  name                 = "forward-to-onprem"
  rule_type            = "FORWARD"
  resolver_endpoint_id = aws_route53_resolver_endpoint.outbound.id
  
  target_ip {
    ip = "10.1.0.10"  # DNS on-premise
  }
  
  target_ip {
    ip = "10.1.0.11"  # DNS on-premise backup
  }
  
  tags = {
    Name = "forward-to-onprem-dns"
  }
}

# Asociar regla con VPCs
resource "aws_route53_resolver_rule_association" "prod" {
  resolver_rule_id = aws_route53_resolver_rule.onprem.id
  vpc_id           = aws_vpc.prod.id
}

resource "aws_route53_resolver_rule_association" "dev" {
  resolver_rule_id = aws_route53_resolver_rule.onprem.id
  vpc_id           = aws_vpc.dev.id
}

# AWS Managed Microsoft AD (Active Directory compartido)
resource "aws_directory_service_directory" "shared_ad" {
  name     = "corp.example.com"
  password = var.ad_password
  edition  = "Standard"
  type     = "MicrosoftAD"
  
  vpc_settings {
    vpc_id     = aws_vpc.shared_services.id
    subnet_ids = [
      aws_subnet.shared_services_a.id,
      aws_subnet.shared_services_b.id
    ]
  }
  
  tags = {
    Name = "shared-ad"
  }
}

# Compartir AD con otras VPCs
resource "aws_ram_resource_share" "ad" {
  name                      = "shared-ad-share"
  allow_external_principals = false
  
  tags = {
    Name = "shared-ad-share"
  }
}

resource "aws_ram_resource_association" "ad" {
  resource_arn       = aws_directory_service_directory.shared_ad.arn
  resource_share_arn = aws_ram_resource_share.ad.arn
}

resource "aws_ram_principal_association" "prod_account" {
  principal          = "arn:aws:iam::123456789012:root"
  resource_share_arn = aws_ram_resource_share.ad.arn
}
```

</details>

---

## 🔟 Checklist de Implementación

### Fase 1: Planificación (Semana 1-2)

- [ ] **Definir requisitos** de conectividad
  - [ ] Ancho de banda necesario
  - [ ] Latencia aceptable
  - [ ] Presupuesto disponible
  - [ ] Requisitos de seguridad

- [ ] **Diseñar arquitectura**
  - [ ] Seleccionar tipo de conexión (VPN/DX/TGW)
  - [ ] Definir esquema de direccionamiento IP
  - [ ] Planificar routing (BGP/estático)
  - [ ] Diseñar redundancia y HA

- [ ] **Documentar**
  - [ ] Diagrama de arquitectura
  - [ ] Plan de direccionamiento
  - [ ] Matriz de conectividad
  - [ ] Runbooks de operación

### Fase 2: Preparación (Semana 3-4)

- [ ] **On-Premise**
  - [ ] Verificar dispositivo VPN compatible
  - [ ] Configurar firewall rules
  - [ ] Preparar direcciones IP públicas
  - [ ] Coordinar con equipo de red

- [ ] **AWS**
  - [ ] Crear VPCs con CIDR no solapado
  - [ ] Configurar subnets y route tables
  - [ ] Preparar Security Groups y NACLs
  - [ ] Solicitar Direct Connect (si aplica)

### Fase 3: Implementación (Semana 5-6)

- [ ] **Configurar conectividad**
  - [ ] Crear Customer Gateway
  - [ ] Crear Virtual Private Gateway o Transit Gateway
  - [ ] Establecer VPN Connection
  - [ ] Configurar dispositivo on-premise
  - [ ] Verificar túneles UP

- [ ] **Configurar routing**
  - [ ] Configurar BGP o rutas estáticas
  - [ ] Habilitar route propagation
  - [ ] Verificar tablas de rutas
  - [ ] Probar conectividad

### Fase 4: Validación (Semana 7)

- [ ] **Pruebas de conectividad**
  - [ ] Ping entre redes
  - [ ] Traceroute
  - [ ] Test de throughput
  - [ ] Test de latencia
  - [ ] Verificar MTU

- [ ] **Pruebas de failover**
  - [ ] Simular caída de túnel primario
  - [ ] Verificar failover automático
  - [ ] Medir tiempo de convergencia
  - [ ] Documentar comportamiento

### Fase 5: Producción (Semana 8+)

- [ ] **Monitoreo**
  - [ ] Configurar CloudWatch alarms
  - [ ] Crear dashboard de monitoreo
  - [ ] Configurar notificaciones
  - [ ] Establecer SLAs

- [ ] **Documentación**
  - [ ] Actualizar diagramas
  - [ ] Documentar configuraciones
  - [ ] Crear runbooks de troubleshooting
  - [ ] Capacitar equipo de operaciones

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [AWS VPN Documentation](https://docs.aws.amazon.com/vpn/)
- [AWS Direct Connect Documentation](https://docs.aws.amazon.com/directconnect/)
- [AWS Transit Gateway Documentation](https://docs.aws.amazon.com/vpc/latest/tgw/)
- [Azure VPN Gateway Documentation](https://docs.microsoft.com/en-us/azure/vpn-gateway/)
- [Azure ExpressRoute Documentation](https://docs.microsoft.com/en-us/azure/expressroute/)

### Whitepapers

- [AWS Hybrid Connectivity Whitepaper](https://docs.aws.amazon.com/whitepapers/latest/hybrid-connectivity/hybrid-connectivity.html)
- [AWS Direct Connect Best Practices](https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/aws-direct-connect.html)
- [Multi-Cloud Connectivity Patterns](https://aws.amazon.com/blogs/architecture/multi-cloud-connectivity-patterns/)

### Herramientas

- [AWS VPN CloudHub](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPN_CloudHub.html)
- [AWS Network Manager](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-network-manager.html)
- [VPC Reachability Analyzer](https://docs.aws.amazon.com/vpc/latest/reachability/)

### Calculadoras

- [AWS Pricing Calculator](https://calculator.aws/)
- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)
- [Direct Connect vs VPN Cost Comparison](https://aws.amazon.com/directconnect/pricing/)

---

## 📝 Notas Finales

Esta guía proporciona las bases para implementar arquitecturas de nube híbrida robustas. Recuerde que:

- 🔐 **La seguridad es primordial** - Siempre use cifrado y autenticación fuerte
- 📊 **Monitoree constantemente** - Configure alarmas y dashboards
- 💰 **Optimice costos** - Revise regularmente el uso y ajuste según necesidad
- 🧪 **Pruebe failover** - Valide que la redundancia funciona correctamente
- 📋 **Documente todo** - Facilita operación y troubleshooting
- 🎓 **Capacite al equipo** - Asegure que el equipo entiende la arquitectura

**La conectividad híbrida es la base para una estrategia multi-cloud exitosa.**

---

**Versión**: 1.0  
**Última actualización**: Febrero 2026  
**Próxima revisión**: Mayo 2026

---

*Esta guía debe adaptarse a los requisitos específicos de su organización. Para implementación técnica detallada, consulte con su equipo de arquitectos de red y seguridad.*
