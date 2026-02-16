---
sidebar_label: "FinOps Guard - Agente de Monitoreo de Costos"
sidebar_position: 1
---

<div align="center">

# 🤖 FinOps Guard - Agente Inteligente de Monitoreo de Costos AWS

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![Strands](https://img.shields.io/badge/Strands-Agents-6B46C1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDZWMTJDNCAxNi40MiA3LjU4IDIwIDEyIDIyQzE2LjQyIDIwIDIwIDE2LjQyIDIwIDEyVjZMMTIgMloiIGZpbGw9IndoaXRlIi8+PC9zdmc+&logoColor=white)
</div>

## 📋 Introducción

**FinOps Guard** es un agente inteligente multi-nodo orientado a Strands (LangGraph) para el monitoreo automatizado de costos en AWS. Detecta anomalías en el gasto cloud, genera recomendaciones de remediación respaldadas por LLM, y publica reportes semanales a Microsoft Teams y correo electrónico.

### ¿Qué Problema Resuelve?

En entornos cloud empresariales, es común enfrentar:

- 📈 **Picos de costos inesperados** sin visibilidad clara de la causa
- 🔍 **Dificultad para identificar** qué cuenta, servicio o equipo generó el gasto
- ⏰ **Detección tardía** de anomalías que ya impactaron el presupuesto
- 📊 **Reportes manuales** que consumen tiempo del equipo FinOps
- 🎯 **Falta de recomendaciones accionables** para optimizar costos

### Solución: Agente Autónomo con IA

FinOps Guard automatiza el ciclo completo de monitoreo de costos:

```
Ingestión de Datos → Detección de Anomalías → Análisis con LLM → Recomendaciones → Notificaciones
```

**Características principales:**
- ✅ Monitoreo continuo de costos AWS (ventana de 90 días)
- ✅ Detección diaria de anomalías por cuenta/servicio/tag
- ✅ Insights y recomendaciones generadas por LLM
- ✅ Reportes semanales automáticos a Teams y email
- ✅ Arquitectura multi-nodo con Strands (LangGraph)
- ✅ Despliegue serverless en AWS Lambda

---

## 🏗️ Arquitectura del Agente

### Arquitectura Multi-Nodo con Strands

FinOps Guard utiliza **LangGraph** (framework de Strands) para orquestar un flujo de trabajo multi-nodo:

```
┌─────────────────────────────────────────────────────────────────┐
│                      FinOps Guard Agent                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Node 1: Data Ingestion                                         │
│  ├─ AWS Cost Explorer API                                       │
│  ├─ Ventana de 90 días                                          │
│  └─ Agregación por cuenta/servicio/tag                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Node 2: Anomaly Detection                                      │
│  ├─ Análisis estadístico de patrones                            │
│  ├─ Detección de picos y desviaciones                           │
│  └─ Clasificación por severidad                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Node 3: LLM Insights                                           │
│  ├─ Análisis contextual con LLM                                 │
│  ├─ Identificación de causas raíz                               │
│  └─ Generación de insights accionables                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Node 4: Recommendations                                        │
│  ├─ Recomendaciones específicas por anomalía                    │
│  ├─ Priorización por impacto                                    │
│  └─ Acciones de remediación sugeridas                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Node 5: Notification                                           │
│  ├─ Reporte semanal a Microsoft Teams                           │
│  ├─ Email con resumen ejecutivo                                 │
│  └─ Dashboard de métricas                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes Clave

**1. Graph Orchestrator** (`finopsguard/graph.py`)
- Orquesta el pipeline de nodos
- Gestiona el flujo de datos entre nodos
- Maneja errores y reintentos

**2. Environment Manager** (`finopsguard/env.py`)
- Resolución de configuración runtime
- Gestión de variables de entorno
- Soporte multi-entorno (local/serverless)

**3. Data Models** (`finopsguard/models.py`)
- Contratos de datos compartidos
- Validación de esquemas
- Serialización/deserialización

**4. Notification Tools** (`finopsguard/tools/notify_teams.py`)
- Integración con Microsoft Teams webhook
- Formateo de mensajes
- Gestión de errores de notificación

**5. Prompt Templates** (`finopsguard/prompts/`)
- Templates para análisis LLM
- Prompts para generación de insights
- Prompts para recomendaciones

---

## 🚀 Casos de Uso

### Caso 1: Detección de Pico de Costos en EC2

**Escenario:**
El equipo de desarrollo lanzó instancias EC2 de gran tamaño en producción sin aprobación.

**Flujo del Agente:**

1. **Ingestión**: Detecta incremento del 45% en costos de EC2 en cuenta de producción
2. **Anomalía**: Identifica pico anómalo comparado con baseline de 30 días
3. **Análisis LLM**: 
   - Correlaciona con tags de equipo
   - Identifica instancias específicas (r6i.8xlarge)
   - Detecta que están en uso solo 30% del tiempo
4. **Recomendaciones**:
   - Cambiar a instancias más pequeñas (r6i.2xlarge)
   - Implementar auto-scaling
   - Usar Savings Plans para workloads predecibles
5. **Notificación**: Alerta a Teams con detalles y ahorro estimado ($3,200/mes)

### Caso 2: Costos Ocultos de Data Transfer

**Escenario:**
Transferencia de datos entre regiones genera costos inesperados.

**Flujo del Agente:**

1. **Ingestión**: Detecta $2,500 en costos de Data Transfer
2. **Anomalía**: Incremento del 300% vs mes anterior
3. **Análisis LLM**:
   - Identifica transferencias inter-región (us-east-1 → eu-west-1)
   - Correlaciona con despliegue de nueva aplicación
   - Detecta arquitectura ineficiente
4. **Recomendaciones**:
   - Implementar CloudFront para cacheo
   - Replicar datos en región de destino
   - Usar VPC Endpoints para servicios AWS
5. **Notificación**: Reporte semanal con análisis de tendencia

### Caso 3: Recursos Huérfanos

**Escenario:**
Volúmenes EBS y snapshots sin usar acumulan costos.

**Flujo del Agente:**

1. **Ingestión**: Detecta costos constantes de EBS sin variación
2. **Anomalía**: Identifica recursos sin actividad de I/O
3. **Análisis LLM**:
   - Correlaciona volúmenes con instancias terminadas
   - Identifica snapshots antiguos (>180 días)
   - Calcula costo acumulado ($850/mes)
4. **Recomendaciones**:
   - Script para eliminar volúmenes huérfanos
   - Política de retención de snapshots
   - Automatización con Lambda
5. **Notificación**: Lista de recursos a eliminar con impacto económico

---

## 💻 Implementación

### Estructura del Proyecto


<details>
<summary>📁 Ver estructura completa del proyecto</summary>

```
FinOpsGuard/
├── finopsguard/
│   ├── graph.py              # Orquestador del pipeline de nodos
│   ├── env.py                # Gestión de configuración y entorno
│   ├── models.py             # Modelos de datos compartidos
│   ├── tools/
│   │   └── notify_teams.py   # Notificador de Microsoft Teams
│   └── prompts/              # Templates de prompts para LLM
│       ├── insights.txt      # Prompts para análisis
│       └── actions.txt       # Prompts para recomendaciones
├── configs/
│   ├── local.yaml            # Configuración para desarrollo local
│   └── serverless.yaml       # Configuración para Lambda
├── prod/
│   └── lambda/               # Deployment para AWS Lambda
│       ├── handler.py        # Lambda handler
│       └── requirements.txt  # Dependencias Lambda
├── scripts/
│   └── run_weekly.py         # Script para ejecución semanal
├── tests/                    # Tests unitarios
├── docs/
│   ├── DEPLOY_CLIENT_PRODUCTION.md
│   ├── POC_DOCKER.md
│   └── DEPLOY_LAMBDA_PROD.md
├── .env.example              # Variables de entorno de ejemplo
├── config.yaml               # Configuración principal
├── pyproject.toml            # Configuración del proyecto Python
└── requirements.txt          # Dependencias del proyecto
```

</details>

### Requisitos Previos

**Servicios AWS:**
- AWS Cost Explorer API habilitado
- IAM Role con permisos de lectura de Cost Explorer
- AWS Lambda (para deployment serverless)
- EventBridge (para scheduling)

**Integraciones:**
- Microsoft Teams webhook URL
- Proveedor LLM (OpenAI, Anthropic, AWS Bedrock, etc.)
- SMTP para notificaciones por email (opcional)

**Herramientas de desarrollo:**
- Python 3.9+
- pip o poetry para gestión de dependencias
- AWS CLI configurado
- Docker (para POC local)

### Instalación Local

<details>
<summary>🐍 Ver pasos de instalación</summary>

```bash
# 1. Clonar el repositorio
git clone https://github.com/DavidDelOjo/FinOpsGuard.git
cd FinOpsGuard

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# 3. Instalar dependencias
pip install -e .

# 4. Configurar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
# TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
# AWS_REGION=us-east-1
# LLM_PROVIDER=openai
# OPENAI_API_KEY=sk-...
```

</details>

### Configuración

<details>
<summary>⚙️ Ver configuración de entornos</summary>

**Archivo: `configs/local.yaml`**

```yaml
# Configuración para desarrollo local
environment: local

aws:
  region: us-east-1
  cost_explorer:
    lookback_days: 90
    granularity: DAILY

anomaly_detection:
  threshold: 0.15  # 15% de desviación
  min_cost: 10     # Mínimo $10 para considerar anomalía
  baseline_days: 30

llm:
  provider: openai
  model: gpt-4
  temperature: 0.3
  max_tokens: 2000

notifications:
  teams:
    enabled: true
    webhook_url: ${TEAMS_WEBHOOK_URL}
  email:
    enabled: false
    smtp_host: smtp.gmail.com
    smtp_port: 587

schedule:
  weekly_report: "0 9 * * MON"  # Lunes 9 AM
  daily_check: "0 8 * * *"      # Diario 8 AM
```

**Archivo: `configs/serverless.yaml`**

```yaml
# Configuración para AWS Lambda
environment: serverless

aws:
  region: ${AWS_REGION}
  cost_explorer:
    lookback_days: 90
    granularity: DAILY

anomaly_detection:
  threshold: 0.15
  min_cost: 10
  baseline_days: 30

llm:
  provider: bedrock
  model: anthropic.claude-3-sonnet-20240229-v1:0
  temperature: 0.3
  max_tokens: 2000

notifications:
  teams:
    enabled: true
    webhook_url: ${TEAMS_WEBHOOK_URL}
  email:
    enabled: true
    from_address: finops@company.com
    to_addresses:
      - finops-team@company.com
      - cloud-ops@company.com

lambda:
  timeout: 300
  memory: 512
  log_level: INFO
```

</details>

### Ejecución Local

<details>
<summary>🚀 Ver comandos de ejecución</summary>

```bash
# Ejecutar reporte semanal
export FINOPSGUARD_ENV=local
python scripts/run_weekly.py

# Ejecutar con configuración personalizada
export CONFIG_PATH=/path/to/custom-config.yaml
python scripts/run_weekly.py

# Ejecutar en modo debug
export LOG_LEVEL=DEBUG
python scripts/run_weekly.py

# Ejecutar solo detección de anomalías (sin notificaciones)
python scripts/run_weekly.py --dry-run
```

</details>

### Deployment en AWS Lambda

<details>
<summary>☁️ Ver guía de deployment serverless</summary>

**1. Preparar el paquete Lambda**

```bash
cd prod/lambda

# Instalar dependencias en directorio local
pip install -r requirements.txt -t ./package

# Copiar código de la aplicación
cp -r ../../finopsguard ./package/

# Crear archivo ZIP
cd package
zip -r ../finopsguard-lambda.zip .
cd ..
```

**2. Crear IAM Role para Lambda**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ce:GetCostForecast",
        "ce:GetAnomalies"
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

**3. Crear función Lambda**

```bash
aws lambda create-function \
  --function-name finops-guard \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT_ID:role/finops-guard-lambda-role \
  --handler handler.lambda_handler \
  --zip-file fileb://finopsguard-lambda.zip \
  --timeout 300 \
  --memory-size 512 \
  --environment Variables="{
    FINOPSGUARD_ENV=serverless,
    TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...,
    AWS_REGION=us-east-1
  }"
```

**4. Configurar EventBridge para scheduling**

```bash
# Crear regla para ejecución semanal (Lunes 9 AM UTC)
aws events put-rule \
  --name finops-guard-weekly \
  --schedule-expression "cron(0 9 ? * MON *)" \
  --state ENABLED

# Agregar Lambda como target
aws events put-targets \
  --rule finops-guard-weekly \
  --targets "Id"="1","Arn"="arn:aws:lambda:REGION:ACCOUNT_ID:function:finops-guard"

# Dar permisos a EventBridge para invocar Lambda
aws lambda add-permission \
  --function-name finops-guard \
  --statement-id finops-guard-weekly-event \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:REGION:ACCOUNT_ID:rule/finops-guard-weekly
```

</details>

### Deployment con Terraform

<details>
<summary>📄 Ver implementación completa en Terraform</summary>

```hcl
# variables.tf
variable "teams_webhook_url" {
  description = "Microsoft Teams webhook URL"
  type        = string
  sensitive   = true
}

variable "lambda_timeout" {
  description = "Lambda timeout en segundos"
  type        = number
  default     = 300
}

variable "lambda_memory" {
  description = "Lambda memory en MB"
  type        = number
  default     = 512
}

# iam.tf
resource "aws_iam_role" "finops_guard_lambda" {
  name = "finops-guard-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "finops_guard_policy" {
  name = "finops-guard-policy"
  role = aws_iam_role.finops_guard_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ce:GetCostAndUsage",
          "ce:GetCostForecast",
          "ce:GetAnomalies"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# lambda.tf
data "archive_file" "finops_guard" {
  type        = "zip"
  source_dir  = "${path.module}/../../prod/lambda/package"
  output_path = "${path.module}/finopsguard-lambda.zip"
}

resource "aws_lambda_function" "finops_guard" {
  filename         = data.archive_file.finops_guard.output_path
  function_name    = "finops-guard"
  role            = aws_iam_role.finops_guard_lambda.arn
  handler         = "handler.lambda_handler"
  source_code_hash = data.archive_file.finops_guard.output_base64sha256
  runtime         = "python3.11"
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory

  environment {
    variables = {
      FINOPSGUARD_ENV    = "serverless"
      TEAMS_WEBHOOK_URL  = var.teams_webhook_url
      AWS_REGION         = data.aws_region.current.name
    }
  }

  tags = {
    Name        = "finops-guard"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

# cloudwatch.tf
resource "aws_cloudwatch_log_group" "finops_guard" {
  name              = "/aws/lambda/finops-guard"
  retention_in_days = 30

  tags = {
    Name = "finops-guard-logs"
  }
}

# eventbridge.tf
resource "aws_cloudwatch_event_rule" "finops_guard_weekly" {
  name                = "finops-guard-weekly"
  description         = "Trigger FinOps Guard weekly report"
  schedule_expression = "cron(0 9 ? * MON *)"
}

resource "aws_cloudwatch_event_target" "finops_guard_weekly" {
  rule      = aws_cloudwatch_event_rule.finops_guard_weekly.name
  target_id = "finops-guard-lambda"
  arn       = aws_lambda_function.finops_guard.arn
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.finops_guard.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.finops_guard_weekly.arn
}

# outputs.tf
output "lambda_function_arn" {
  description = "ARN de la función Lambda"
  value       = aws_lambda_function.finops_guard.arn
}

output "lambda_function_name" {
  description = "Nombre de la función Lambda"
  value       = aws_lambda_function.finops_guard.function_name
}

output "cloudwatch_log_group" {
  description = "CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.finops_guard.name
}
```

**Deployment:**

```bash
# Inicializar Terraform
terraform init

# Planificar cambios
terraform plan -var="teams_webhook_url=https://outlook.office.com/webhook/..."

# Aplicar configuración
terraform apply -var="teams_webhook_url=https://outlook.office.com/webhook/..."
```

</details>

---

## 🔧 Personalización del Agente

### Modificar Umbrales de Detección

<details>
<summary>⚙️ Ver configuración de umbrales</summary>

```yaml
# En config.yaml
anomaly_detection:
  # Umbral de desviación (15% = 0.15)
  threshold: 0.15
  
  # Costo mínimo para considerar anomalía ($10)
  min_cost: 10
  
  # Días de baseline para comparación
  baseline_days: 30
  
  # Severidad de anomalías
  severity_levels:
    critical: 0.50  # >50% de incremento
    high: 0.30      # 30-50% de incremento
    medium: 0.15    # 15-30% de incremento
    low: 0.10       # 10-15% de incremento
```

</details>

### Personalizar Prompts del LLM

<details>
<summary>📝 Ver templates de prompts</summary>

**Archivo: `finopsguard/prompts/insights.txt`**

```
Eres un experto en FinOps y optimización de costos en AWS.

Analiza la siguiente anomalía de costos detectada:

Cuenta: {account_id}
Servicio: {service}
Incremento: {percentage_increase}%
Costo actual: ${current_cost}
Costo baseline: ${baseline_cost}
Período: {time_period}

Tags asociados:
{tags}

Proporciona:
1. Análisis de la causa raíz probable
2. Impacto en el presupuesto mensual
3. Contexto del servicio y uso típico
4. Factores que podrían explicar el incremento

Responde en formato estructurado y conciso.
```

**Archivo: `finopsguard/prompts/actions.txt`**

```
Basándote en el siguiente análisis de anomalía de costos:

{insight_analysis}

Genera recomendaciones accionables que incluyan:

1. Acciones inmediatas (0-7 días)
   - Qué hacer
   - Cómo hacerlo
   - Ahorro estimado

2. Acciones a corto plazo (1-4 semanas)
   - Optimizaciones arquitectónicas
   - Cambios de configuración
   - Ahorro estimado

3. Acciones a largo plazo (1-3 meses)
   - Mejoras estratégicas
   - Automatizaciones
   - Ahorro estimado

4. Scripts o comandos específicos cuando sea aplicable

Prioriza por impacto económico y facilidad de implementación.
```

</details>

### Agregar Nuevos Nodos al Graph

<details>
<summary>🔗 Ver ejemplo de nodo personalizado


```python
# finopsguard/nodes/budget_checker.py
from typing import Dict, Any
from ..models import AgentState

class BudgetCheckerNode:
    """
    Nodo personalizado para verificar presupuestos
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.budget_thresholds = config.get('budget_thresholds', {})
    
    def __call__(self, state: AgentState) -> AgentState:
        """
        Verifica si las anomalías exceden presupuestos definidos
        """
        anomalies = state.get('anomalies', [])
        budget_alerts = []
        
        for anomaly in anomalies:
            account_id = anomaly['account_id']
            service = anomaly['service']
            current_cost = anomaly['current_cost']
            
            # Verificar contra presupuesto
            budget_key = f"{account_id}:{service}"
            if budget_key in self.budget_thresholds:
                budget = self.budget_thresholds[budget_key]
                if current_cost > budget:
                    budget_alerts.append({
                        'account_id': account_id,
                        'service': service,
                        'current_cost': current_cost,
                        'budget': budget,
                        'overage': current_cost - budget,
                        'overage_percentage': ((current_cost - budget) / budget) * 100
                    })
        
        # Actualizar estado
        state['budget_alerts'] = budget_alerts
        return state

# Registrar el nodo en el graph
# finopsguard/graph.py
from .nodes.budget_checker import BudgetCheckerNode

def build_graph(config):
    graph = StateGraph(AgentState)
    
    # Nodos existentes
    graph.add_node("ingest", DataIngestionNode(config))
    graph.add_node("detect", AnomalyDetectionNode(config))
    graph.add_node("analyze", LLMInsightsNode(config))
    graph.add_node("recommend", RecommendationsNode(config))
    
    # Nuevo nodo personalizado
    graph.add_node("budget_check", BudgetCheckerNode(config))
    
    # Definir flujo
    graph.add_edge("ingest", "detect")
    graph.add_edge("detect", "analyze")
    graph.add_edge("analyze", "budget_check")  # Nuevo edge
    graph.add_edge("budget_check", "recommend")
    graph.add_edge("recommend", "notify")
    
    return graph.compile()
```

</details>

---

## 📊 Formato de Reportes

### Reporte en Microsoft Teams

El agente envía reportes estructurados a Teams con formato Adaptive Cards:

<details>
<summary>📱 Ver ejemplo de reporte Teams</summary>

```json
{
  "type": "message",
  "attachments": [
    {
      "contentType": "application/vnd.microsoft.card.adaptive",
      "content": {
        "type": "AdaptiveCard",
        "version": "1.4",
        "body": [
          {
            "type": "TextBlock",
            "text": "🤖 FinOps Guard - Reporte Semanal",
            "weight": "bolder",
            "size": "large"
          },
          {
            "type": "TextBlock",
            "text": "Semana del 10-16 Febrero 2026",
            "isSubtle": true
          },
          {
            "type": "FactSet",
            "facts": [
              {
                "title": "Anomalías detectadas:",
                "value": "7"
              },
              {
                "title": "Costo total analizado:",
                "value": "$45,230"
              },
              {
                "title": "Ahorro potencial:",
                "value": "$8,450/mes"
              }
            ]
          },
          {
            "type": "TextBlock",
            "text": "🚨 Anomalías Críticas",
            "weight": "bolder",
            "size": "medium"
          },
          {
            "type": "Container",
            "style": "attention",
            "items": [
              {
                "type": "TextBlock",
                "text": "**EC2 - Cuenta Producción**",
                "weight": "bolder"
              },
              {
                "type": "TextBlock",
                "text": "Incremento: +45% ($3,200)",
                "wrap": true
              },
              {
                "type": "TextBlock",
                "text": "**Causa:** Instancias r6i.8xlarge sin auto-scaling",
                "wrap": true
              },
              {
                "type": "TextBlock",
                "text": "**Acción:** Cambiar a r6i.2xlarge + auto-scaling",
                "wrap": true
              },
              {
                "type": "TextBlock",
                "text": "**Ahorro estimado:** $2,400/mes",
                "color": "good",
                "weight": "bolder"
              }
            ]
          },
          {
            "type": "Container",
            "style": "warning",
            "items": [
              {
                "type": "TextBlock",
                "text": "**Data Transfer - Cuenta Dev**",
                "weight": "bolder"
              },
              {
                "type": "TextBlock",
                "text": "Incremento: +300% ($2,500)",
                "wrap": true
              },
              {
                "type": "TextBlock",
                "text": "**Causa:** Transferencias inter-región sin CloudFront",
                "wrap": true
              },
              {
                "type": "TextBlock",
                "text": "**Acción:** Implementar CloudFront + replicación",
                "wrap": true
              },
              {
                "type": "TextBlock",
                "text": "**Ahorro estimado:** $1,800/mes",
                "color": "good",
                "weight": "bolder"
              }
            ]
          }
        ],
        "actions": [
          {
            "type": "Action.OpenUrl",
            "title": "Ver Dashboard Completo",
            "url": "https://dashboard.company.com/finops"
          }
        ]
      }
    }
  ]
}
```

</details>

### Reporte por Email

<details>
<summary>📧 Ver ejemplo de email HTML</summary>

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .header { background: #FF9900; color: white; padding: 20px; }
        .summary { background: #f4f4f4; padding: 15px; margin: 20px 0; }
        .anomaly { border-left: 4px solid #e74c3c; padding: 15px; margin: 10px 0; }
        .critical { border-color: #e74c3c; }
        .high { border-color: #f39c12; }
        .savings { color: #27ae60; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 FinOps Guard - Reporte Semanal</h1>
        <p>Semana del 10-16 Febrero 2026</p>
    </div>
    
    <div class="summary">
        <h2>📊 Resumen Ejecutivo</h2>
        <ul>
            <li><strong>Anomalías detectadas:</strong> 7</li>
            <li><strong>Costo total analizado:</strong> $45,230</li>
            <li><strong>Ahorro potencial:</strong> <span class="savings">$8,450/mes</span></li>
        </ul>
    </div>
    
    <h2>🚨 Anomalías Críticas</h2>
    
    <div class="anomaly critical">
        <h3>EC2 - Cuenta Producción</h3>
        <p><strong>Incremento:</strong> +45% ($3,200)</p>
        <p><strong>Causa:</strong> Instancias r6i.8xlarge sin auto-scaling</p>
        <p><strong>Recomendación:</strong> Cambiar a r6i.2xlarge + implementar auto-scaling</p>
        <p class="savings">Ahorro estimado: $2,400/mes</p>
    </div>
    
    <div class="anomaly high">
        <h3>Data Transfer - Cuenta Dev</h3>
        <p><strong>Incremento:</strong> +300% ($2,500)</p>
        <p><strong>Causa:</strong> Transferencias inter-región sin CloudFront</p>
        <p><strong>Recomendación:</strong> Implementar CloudFront + replicación de datos</p>
        <p class="savings">Ahorro estimado: $1,800/mes</p>
    </div>
    
    <p><a href="https://dashboard.company.com/finops">Ver Dashboard Completo</a></p>
</body>
</html>
```

</details>

---

## 🎯 Mejores Prácticas

### 1. Configuración de Umbrales

**Recomendaciones:**

- Empezar con umbrales conservadores (10-15%)
- Ajustar basándose en falsos positivos
- Usar umbrales diferentes por servicio:
  - EC2: 15-20% (más volátil)
  - S3: 10-15% (más estable)
  - Data Transfer: 20-30% (muy variable)

### 2. Gestión de Notificaciones

**Evitar fatiga de alertas:**

- Agrupar anomalías menores en reporte semanal
- Alertas inmediatas solo para anomalías críticas (>50%)
- Implementar cooldown period (no alertar mismo servicio en 24h)

### 3. Integración con Procesos FinOps

**Workflow recomendado:**

```
Detección → Análisis → Aprobación → Remediación → Validación
    ↓          ↓           ↓            ↓            ↓
  Agente    Agente    Humano      Humano/Auto    Agente
```

**Acciones automatizables:**
- ✅ Detección y análisis
- ✅ Generación de recomendaciones
- ✅ Notificaciones
- ❌ Remediación (requiere aprobación humana)

### 4. Seguridad y Compliance

**Principios:**

- Usar IAM Roles, nunca access keys
- Principio de mínimo privilegio (solo lectura de Cost Explorer)
- Cifrar variables de entorno sensibles
- Auditar accesos con CloudTrail
- No incluir credenciales en código

### 5. Optimización de Costos del Agente

**Costos estimados:**

| Componente | Costo Mensual |
|------------|---------------|
| Lambda (semanal) | $0.20 |
| Cost Explorer API | $0.01 |
| CloudWatch Logs | $0.50 |
| LLM API calls | $5-20 |
| **Total** | **$6-21/mes** |

**Optimizaciones:**

- Usar AWS Bedrock para reducir costos de LLM
- Cachear resultados de Cost Explorer (TTL 1 hora)
- Comprimir logs de CloudWatch
- Usar Lambda ARM64 (20% más barato)

---

## 🔍 Troubleshooting

### Error: "Cost Explorer API not enabled"

**Causa:** Cost Explorer no está habilitado en la cuenta.

**Solución:**
```bash
# Habilitar Cost Explorer (requiere permisos de billing)
aws ce get-cost-and-usage \
  --time-period Start=2026-02-01,End=2026-02-02 \
  --granularity DAILY \
  --metrics UnblendedCost

# Si falla, habilitar desde la consola:
# AWS Console → Billing → Cost Explorer → Enable Cost Explorer
```

### Error: "Teams webhook failed"

**Causa:** URL de webhook inválida o Teams bloqueando mensajes.

**Solución:**
```python
# Verificar webhook manualmente
import requests

webhook_url = "https://outlook.office.com/webhook/..."
test_message = {
    "text": "Test message from FinOps Guard"
}

response = requests.post(webhook_url, json=test_message)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")
```

### Error: "Lambda timeout"

**Causa:** Procesamiento toma más de 300 segundos.

**Solución:**
```hcl
# Aumentar timeout en Terraform
resource "aws_lambda_function" "finops_guard" {
  timeout     = 600  # 10 minutos
  memory_size = 1024 # Más memoria = más CPU
}
```

### Error: "No anomalies detected"

**Causa:** Umbrales muy altos o datos insuficientes.

**Solución:**
```yaml
# Ajustar configuración
anomaly_detection:
  threshold: 0.10      # Reducir a 10%
  min_cost: 5          # Reducir mínimo a $5
  baseline_days: 14    # Reducir baseline a 14 días
```

---

## 📈 Métricas y Monitoreo

### KPIs del Agente

**Métricas operacionales:**
- Tasa de detección de anomalías
- Tiempo de procesamiento por ejecución
- Tasa de éxito de notificaciones
- Cobertura de cuentas/servicios

**Métricas de negocio:**
- Ahorro identificado vs implementado
- Tiempo de respuesta a anomalías
- Reducción de costos mes a mes
- ROI del agente

### Dashboard de CloudWatch

<details>
<summary>📊 Ver configuración de dashboard</summary>

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/Lambda", "Invocations", {"stat": "Sum", "label": "Ejecuciones"}],
          [".", "Errors", {"stat": "Sum", "label": "Errores"}],
          [".", "Duration", {"stat": "Average", "label": "Duración Promedio"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "FinOps Guard - Métricas Lambda"
      }
    },
    {
      "type": "log",
      "properties": {
        "query": "SOURCE '/aws/lambda/finops-guard'\n| fields @timestamp, @message\n| filter @message like /anomaly detected/\n| stats count() by bin(5m)",
        "region": "us-east-1",
        "title": "Anomalías Detectadas (últimas 24h)"
      }
    }
  ]
}
```

</details>

---

## 🚀 Roadmap y Extensiones

### Funcionalidades Futuras

**Fase 1: Mejoras Core (Q1 2026)**
- [ ] Soporte multi-cloud (Azure, GCP)
- [ ] Detección de anomalías con ML (Amazon Forecast)
- [ ] Integración con Jira para tickets automáticos
- [ ] Dashboard web interactivo

**Fase 2: Automatización (Q2 2026)**
- [ ] Remediación automática con aprobación
- [ ] Integración con AWS Systems Manager
- [ ] Políticas de auto-scaling dinámicas
- [ ] Recomendaciones de Reserved Instances

**Fase 3: Inteligencia Avanzada (Q3 2026)**
- [ ] Predicción de costos con ML
- [ ] Análisis de tendencias a largo plazo
- [ ] Benchmarking contra industria
- [ ] Optimización continua con RL

### Extensiones Disponibles

**Integraciones:**
- Slack notifications
- PagerDuty para alertas críticas
- ServiceNow para gestión de cambios
- Datadog para métricas unificadas

**Proveedores LLM soportados:**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3)
- AWS Bedrock (Claude, Llama, Titan)
- Azure OpenAI
- Google Vertex AI

---

## 📚 Recursos Adicionales

### Documentación del Proyecto

- [Guía de Deployment en Producción](https://github.com/DavidDelOjo/FinOpsGuard/blob/main/docs/DEPLOY_CLIENT_PRODUCTION.md)
- [POC con Docker](https://github.com/DavidDelOjo/FinOpsGuard/blob/main/docs/POC_DOCKER.md)
- [Deployment Lambda](https://github.com/DavidDelOjo/FinOpsGuard/blob/main/docs/DEPLOY_LAMBDA_PROD.md)

### Frameworks y Herramientas

- [Strands Agents](https://strandsagents.com) - Plataforma de agentes multi-nodo
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/) - Framework de Strands
- [AWS Cost Explorer API](https://docs.aws.amazon.com/cost-management/latest/APIReference/API_Operations_AWS_Cost_Explorer_Service.html)
- [Microsoft Teams Webhooks](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)

### FinOps Best Practices

- [FinOps Foundation](https://www.finops.org/) - Comunidad y recursos
- [AWS Cost Optimization](https://aws.amazon.com/aws-cost-management/cost-optimization/)
- [Well-Architected Framework - Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/)

### Artículos Relacionados

- [Cómo nOps usa LangGraph para gestión de infraestructura](https://www.nops.io/blog/how-the-nops-agent-clara-uses-langgraph-to-tame-infra-chaos/) - Caso de uso similar con agentes IA
- [Framework FinOps con AWS](https://milaan.is-a.dev/blog/cloud-finops-framework/) - Arquitectura de referencia para FinOps
- [Optimización de costos con Amazon Bedrock](https://aws.amazon.com/solutions/guidance/cost-analysis-and-optimization-with-amazon-bedrock-agents/) - Guía oficial de AWS

---

## 🤝 Contribución y Soporte

### Repositorio

**GitHub:** [https://github.com/DavidDelOjo/FinOpsGuard](https://github.com/DavidDelOjo/FinOpsGuard)

### Cómo Contribuir

1. Fork del repositorio
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Reportar Issues

Para reportar bugs o solicitar features:
- Usar GitHub Issues
- Incluir logs relevantes
- Describir pasos para reproducir
- Especificar versión y entorno

---

## 📝 Checklist de Implementación

### Fase 1: Setup Inicial (1-2 días)

- [ ] Clonar repositorio
- [ ] Configurar entorno Python
- [ ] Instalar dependencias
- [ ] Configurar variables de entorno
- [ ] Habilitar Cost Explorer API
- [ ] Crear webhook de Teams
- [ ] Ejecutar prueba local

### Fase 2: Configuración (2-3 días)

- [ ] Ajustar umbrales de detección
- [ ] Personalizar prompts LLM
- [ ] Configurar cuentas AWS a monitorear
- [ ] Definir tags relevantes
- [ ] Configurar notificaciones
- [ ] Validar formato de reportes

### Fase 3: Deployment (1-2 días)

- [ ] Crear IAM Role para Lambda
- [ ] Empaquetar código Lambda
- [ ] Desplegar función Lambda
- [ ] Configurar EventBridge
- [ ] Configurar CloudWatch Logs
- [ ] Validar ejecución programada

### Fase 4: Validación (1 semana)

- [ ] Monitorear primeras ejecuciones
- [ ] Validar detección de anomalías
- [ ] Revisar calidad de insights
- [ ] Ajustar umbrales si necesario
- [ ] Validar notificaciones
- [ ] Documentar casos de uso

### Fase 5: Operación (Continuo)

- [ ] Revisar reportes semanales
- [ ] Implementar recomendaciones
- [ ] Medir ahorro real vs estimado
- [ ] Ajustar configuración
- [ ] Actualizar prompts LLM
- [ ] Escalar a más cuentas

---

## 💡 Conclusión

FinOps Guard representa una evolución en la gestión de costos cloud, combinando:

- 🤖 **Automatización inteligente** con agentes multi-nodo
- 🧠 **Análisis contextual** con LLMs de última generación
- 📊 **Visibilidad continua** de costos y anomalías
- 🎯 **Recomendaciones accionables** priorizadas por impacto
- 💰 **ROI medible** con ahorro estimado vs real

**Beneficios clave:**

- Reducción de 20-40% en costos cloud
- Detección de anomalías en <24 horas
- Ahorro de 10+ horas/semana del equipo FinOps
- Visibilidad completa de gasto por cuenta/servicio/tag
- Cultura de cost awareness en toda la organización

**Próximos pasos:**

1. Implementar en entorno de prueba
2. Validar con datos históricos
3. Ajustar configuración a tu organización
4. Desplegar en producción
5. Medir y optimizar continuamente

---

**Versión**: 1.0  
**Fecha**: Febrero 2026  
**Autor**: David Del Ojo  
**Repositorio**: [github.com/DavidDelOjo/FinOpsGuard](https://github.com/DavidDelOjo/FinOpsGuard)

---

*Esta documentación es parte de las guías de AWS. Para más información sobre otros servicios y mejores prácticas, consulta las secciones de Computación, Networking y Seguridad.*
