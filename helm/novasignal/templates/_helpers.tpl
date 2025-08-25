{{/*
Expand the name of the chart.
*/}}
{{- define "novasignal.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "novasignal.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "novasignal.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "novasignal.labels" -}}
helm.sh/chart: {{ include "novasignal.chart" . }}
{{ include "novasignal.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "novasignal.selectorLabels" -}}
app.kubernetes.io/name: {{ include "novasignal.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "novasignal.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "novasignal.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Redis host helper
*/}}
{{- define "novasignal.redis.host" -}}
{{- if .Values.redis.enabled }}
{{- printf "%s-redis-master" (include "novasignal.fullname" .) }}
{{- else if .Values.externalRedis.enabled }}
{{- .Values.externalRedis.host }}
{{- else }}
{{- "redis" }}
{{- end }}
{{- end }}

{{/*
Redis port helper
*/}}
{{- define "novasignal.redis.port" -}}
{{- if .Values.redis.enabled }}
{{- "6379" }}
{{- else if .Values.externalRedis.enabled }}
{{- .Values.externalRedis.port | toString }}
{{- else }}
{{- "6379" }}
{{- end }}
{{- end }}

{{/*
Database host helper
*/}}
{{- define "novasignal.database.host" -}}
{{- if .Values.postgresql.enabled }}
{{- printf "%s-postgresql" (include "novasignal.fullname" .) }}
{{- else if .Values.externalDatabase.enabled }}
{{- .Values.externalDatabase.host }}
{{- else }}
{{- "postgresql" }}
{{- end }}
{{- end }}

{{/*
Database port helper
*/}}
{{- define "novasignal.database.port" -}}
{{- if .Values.postgresql.enabled }}
{{- "5432" }}
{{- else if .Values.externalDatabase.enabled }}
{{- .Values.externalDatabase.port | toString }}
{{- else }}
{{- "5432" }}
{{- end }}
{{- end }}

{{/*
Frontend image
*/}}
{{- define "novasignal.frontend.image" -}}
{{- printf "%s/%s:%s" .Values.frontend.image.registry .Values.frontend.image.repository (.Values.frontend.image.tag | default .Chart.AppVersion) }}
{{- end }}

{{/*
Backend image
*/}}
{{- define "novasignal.backend.image" -}}
{{- printf "%s/%s:%s" .Values.backend.image.registry .Values.backend.image.repository (.Values.backend.image.tag | default .Chart.AppVersion) }}
{{- end }}

{{/*
Ingress TLS configuration
*/}}
{{- define "novasignal.ingress.tls" -}}
{{- if .Values.ingress.tls.enabled }}
- hosts:
    - {{ .Values.ingress.hostname }}
  secretName: {{ .Values.ingress.tls.secretName }}
{{- end }}
{{- end }}