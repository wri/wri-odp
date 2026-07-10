{{- define "wri.ingress.feCkanConfigurationSnippet" -}}
more_set_headers "server: hide";
more_set_headers "X-Content-Type-Options: nosniff";
more_set_headers "X-Xss-Protection: 1";
more_set_headers "Referrer-Policy: origin";
more_set_headers "Expect-CT: max-age=86400, enforce, report-uri='[reportURL]'";
more_set_headers "X-Permitted-Cross-Domain-Policies: none";
{{ include "wri.ingress.botDenylistConfigSnippet" . }}
{{- end -}}
