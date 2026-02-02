# Guía para Agregar Colapsables a las Guías

## Patrón de Búsqueda y Reemplazo

### 1. Bloques de Terraform

**Buscar:**
```markdown
```hcl
# Código largo de Terraform (>30 líneas)
```
```

**Reemplazar con:**
```markdown
<details>
<summary>📄 Ver código completo de Terraform</summary>

```hcl
# Código largo de Terraform
```

</details>
```

### 2. Scripts Python

**Buscar:**
```markdown
```python
"""
Script largo de Python (>30 líneas)
"""
```
```

**Reemplazar con:**
```markdown
<details>
<summary>🐍 Ver script completo de Python</summary>

```python
"""
Script largo de Python
"""
```

</details>
```

### 3. Comandos AWS CLI

**Buscar:**
```markdown
```bash
# Múltiples comandos AWS CLI
```
```

**Reemplazar con:**
```markdown
<details>
<summary>⚙️ Ver comandos AWS CLI</summary>

```bash
# Múltiples comandos AWS CLI
```

</details>
```

### 4. Configuraciones JSON

**Buscar:**
```markdown
```json
{
  "configuración": "larga"
}
```
```

**Reemplazar con:**
```markdown
<details>
<summary>📋 Ver configuración JSON</summary>

```json
{
  "configuración": "larga"
}
```

</details>
```

## Emojis Recomendados por Tipo

| Tipo de Contenido | Emoji | Texto Sugerido |
|-------------------|-------|----------------|
| Terraform | 📄 | Ver código completo de Terraform |
| Python | 🐍 | Ver script completo de Python |
| Bash/CLI | ⚙️ | Ver comandos AWS CLI |
| JSON | 📋 | Ver configuración JSON |
| YAML | 📝 | Ver configuración YAML |
| Cisco Config | 🔧 | Ver configuración de dispositivo |
| CloudFormation | ☁️ | Ver template de CloudFormation |
| Kubernetes | ⎈ | Ver manifiestos de Kubernetes |
| Docker | 🐳 | Ver Dockerfile |
| Ejemplos | 💡 | Ver ejemplo completo |
| Troubleshooting | 🔍 | Ver pasos de diagnóstico |
| Avanzado | 🚀 | Ver configuración avanzada |

## Secciones Prioritarias para Aplicar

### En `networking-starter-kit.md`:

1. ✅ Implementación con Terraform (línea ~160-400)
2. ✅ Security Groups por capas (línea ~450-650)
3. ✅ Network ACLs (línea ~700-850)
4. ✅ VPC Endpoints (línea ~900-1100)
5. ✅ Scripts de monitoreo Python (línea ~1200-1400)

### En `nube-hibrida.md`:

1. ✅ Configuración VPN Site-to-Site (línea ~100-250)
2. ✅ Configuración Direct Connect (línea ~300-450)
3. ✅ Transit Gateway (línea ~500-650)
4. ✅ Configuración Azure (línea ~700-900)
5. ✅ Scripts de troubleshooting (línea ~1000-1200)

### En `ec2-starter-kit.md`:

1. ✅ Políticas IAM (línea ~100-200)
2. ✅ Security Groups (línea ~250-350)
3. ✅ Lambda de rotación (línea ~400-600)
4. ✅ Scripts de automatización (línea ~700-900)

### En `secrets-manager.md`:

1. ✅ Código de aplicación (Python, Node.js, Java)
2. ✅ Lambda de rotación
3. ✅ Configuraciones de Terraform
4. ✅ Scripts de troubleshooting

### En `tagging-strategy.md`:

1. ✅ Políticas de tags
2. ✅ Scripts de automatización
3. ✅ Lambda functions
4. ✅ Configuraciones de AWS Config

## Ejemplo de Aplicación

### ANTES:

```markdown
### Implementación con Terraform

```hcl
# variables.tf
variable "vpc_cidr" {
  description = "CIDR block para VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "environment" {
  description = "Entorno (prod, staging, dev)"
  type        = string
}

# ... 100 líneas más de código ...
```

**Características:**
- Multi-AZ
- Alta disponibilidad
```

### DESPUÉS:

```markdown
### Implementación con Terraform

<details>
<summary>📄 Ver código completo de Terraform (variables, VPC, subnets, NAT gateways)</summary>

```hcl
# variables.tf
variable "vpc_cidr" {
  description = "CIDR block para VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "environment" {
  description = "Entorno (prod, staging, dev)"
  type        = string
}

# ... 100 líneas más de código ...
```

</details>

**Características:**
- Multi-AZ
- Alta disponibilidad
```

## Reglas de Decisión

### ✅ USAR Colapsable cuando:

- El bloque de código tiene más de 30 líneas
- Es una implementación completa (no un snippet)
- Es código de referencia (no esencial para entender el concepto)
- Hay múltiples ejemplos alternativos
- Es configuración detallada de dispositivos

### ❌ NO USAR Colapsable cuando:

- El código es menor a 15 líneas
- Es el ejemplo principal del concepto
- Es un comando simple de una línea
- Es código que debe verse para entender el texto
- Es una configuración crítica que debe estar visible

## Proceso de Aplicación

1. **Identificar**: Buscar bloques de código largos (>30 líneas)
2. **Evaluar**: ¿Es esencial verlo o es referencia?
3. **Aplicar**: Envolver en `<details>` con `<summary>` descriptivo
4. **Validar**: Verificar que el markdown se renderiza correctamente
5. **Probar**: Abrir/cerrar el colapsable en Docusaurus

## Comando para Encontrar Bloques Largos

```bash
# Encontrar bloques de código largos en un archivo
awk '/```/ {if (in_block) {lines = NR - start; if (lines > 30) print "Línea " start ": " lines " líneas"; in_block=0} else {start=NR; in_block=1}}' docs/networking/networking-starter-kit.md
```

## Notas Importantes

1. **Mantener contexto**: El `<summary>` debe describir qué contiene
2. **Espaciado**: Dejar línea en blanco después de `<summary>` y antes de `</details>`
3. **No abusar**: Solo para código largo, no para todo
4. **Consistencia**: Usar los mismos emojis y formato en toda la guía
5. **Testing**: Verificar en Docusaurus que funciona correctamente

## Ejemplo de Sección Completa Mejorada

```markdown
## 3️⃣ Implementación de VPN Site-to-Site

### Paso 1: Crear Customer Gateway

El Customer Gateway representa tu dispositivo VPN on-premise en AWS.

<details>
<summary>⚙️ Ver comandos AWS CLI</summary>

```bash
# Crear Customer Gateway
aws ec2 create-customer-gateway \
  --type ipsec.1 \
  --public-ip 203.0.113.12 \
  --bgp-asn 65000 \
  --tag-specifications 'ResourceType=customer-gateway,Tags=[{Key=Name,Value=onprem-cgw}]'
```

</details>

<details>
<summary>📄 Ver código Terraform</summary>

```hcl
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

</details>

**Puntos clave:**
- Usa la IP pública de tu dispositivo VPN
- El ASN debe ser único
- Documenta con tags apropiados

### Paso 2: Configurar Dispositivo On-Premise

<details>
<summary>🔧 Ver configuración para Cisco ASA</summary>

```cisco
! Configuración completa de Cisco ASA
crypto ikev2 policy 200
  encryption aes-256
  integrity sha256
  group 14
  prf sha256
  lifetime seconds 28800
! ... más configuración ...
```

</details>

<details>
<summary>🔧 Ver configuración para pfSense</summary>

```
1. Navegar a VPN > IPsec
2. Click en "Add P1"
3. Configurar Phase 1:
   - Remote Gateway: 52.1.2.3
   - Authentication Method: Mutual PSK
   ...
```

</details>

📚 [Documentación oficial](https://docs.aws.amazon.com/vpn/)
```

Este patrón mantiene la guía limpia y organizada mientras proporciona todo el código necesario.
