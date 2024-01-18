fetch(
  "http://localhost:4200/api/deployments/ce496496-6099-4092-9cf3-7adf38aafb15/create_flow_run",
  {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9,pt;q=0.8",
      "content-type": "application/json",
      "sec-ch-ua":
        '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-prefect-ui": "true",
      Referer:
        "http://localhost:4200/deployments/deployment/ce496496-6099-4092-9cf3-7adf38aafb15",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: '{"parameters":{"api_key":"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJGaWowWDlVLWZjVWgzWVFOUWdCS2pRcEFVbnd1c1UyUGh3ZHlvM3NjZFo4IiwiaWF0IjoxNzA1NTE3Mjk3fQ.ctmUwY2MHoPYtSlOxzMlpyCfqn6RT3PfkVkCMPAInFsCWK5Mtrw_hhsvKC_AKlygEH13uxZvYPxhKyyMoSuEOv92m47lHT9n--8red-jfuj_NfEnOAXzcmfQruU-3H9AW0B-F7uhpplV8742k9WKg0dxBV1ZyFTymKZSxtGYd5XcXCQUQVkrPWPu-GaAkX3DrcO_jRUhGB7AlOqffoa_NwxcM1zJa3MoA9vtmzY_GXXr0O21sAy6kWHH2WFvnNOgbrqSBAFsD4HKRM3ok5zH8QCWTSBNM5tULHQPd-xFH-ILctuJir1hShp8eA9oHTHnPkNoBBCpWTk_i3MML_T9ewy","resource_id":"fc1cd529-1026-4795-bf6a-f4e82f6e35f4"},"state":{"type":"SCHEDULED","message":"Run from the Prefect UI","state_details":{}}}',
    method: "POST",
  },
);
