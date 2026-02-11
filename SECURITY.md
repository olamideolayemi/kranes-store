# Security Policy

## Reporting a Vulnerability

If you discover a security issue, do not open a public issue with exploit details.

Please report responsibly by sharing:

- Description of the vulnerability
- Impact assessment
- Steps to reproduce
- Suggested remediation (if available)

For this public demo repository, open a private communication channel with the maintainer if possible. If private contact is unavailable, open a minimal issue requesting secure contact.

## Scope Notes

Krane's Market is a demo project and is not production-hardened.

Known limitations include:

- JSON file persistence instead of hardened database infrastructure
- Simplified payment simulation (no real payment gateway)
- Minimal anti-abuse and fraud controls
- Basic auth/session handling for demo purposes

## Recommended Production Hardening

Before production use:

- Use managed database and encrypted at-rest secrets
- Add rate limiting and abuse protection
- Add full audit logging and alerting
- Enforce secure secret management and key rotation
- Add secure CI/CD checks (SAST, dependency scanning)
- Run penetration testing and threat modeling
