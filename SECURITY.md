# Security Policy

## 🔒 Supported Versions

We actively support the following versions of NovaSignal with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes             |
| 0.2.x   | ❌ No              |
| 0.1.x   | ❌ No              |

## 🚨 Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 📧 Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email us at: **security@novasignal.trading**

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue  
- Potential impact assessment
- Any suggested fixes (optional)

### ⏰ Response Timeline

- **Initial Response**: Within 24 hours
- **Assessment**: Within 72 hours  
- **Fix Timeline**: Critical issues within 7 days, others within 30 days
- **Public Disclosure**: After fix is released and users have time to update

### 🛡️ Security Measures

NovaSignal implements several security measures:

**Data Protection**
- API keys encrypted with AES-256
- Secure credential storage
- No sensitive data in logs
- HTTPS/WSS for all communications

**Code Security**
- Dependency scanning with automated updates
- Static code analysis
- Input validation and sanitization
- Regular security audits

**Infrastructure Security**
- Code signing for all releases
- Secure CI/CD pipeline
- Automated security testing
- Regular penetration testing

### 🏆 Recognition

Security researchers who responsibly disclose vulnerabilities will be:
- Credited in our security acknowledgments (if desired)
- Listed in release notes for the fix
- Eligible for recognition in our contributor program

### 📋 Scope

**In Scope:**
- Authentication and authorization flaws
- Data leakage or exposure
- Cross-site scripting (XSS)
- SQL injection
- Remote code execution
- Privilege escalation
- API security issues

**Out of Scope:**
- Social engineering attacks
- Physical security issues  
- Third-party service vulnerabilities
- Issues requiring physical access to user devices
- Theoretical attacks without proof of concept

## 🔐 Security Best Practices for Users

**API Key Security:**
- Never share your API keys
- Use environment variables for configuration
- Regularly rotate your API keys
- Monitor API key usage

**Installation Security:**
- Only download from official releases
- Verify installer signatures
- Keep software updated
- Use reputable antivirus software

**Network Security:**
- Use secure networks for trading
- Enable firewall protection
- Keep your OS and browsers updated
- Be cautious with public Wi-Fi

## 📞 Contact Information

- **Security Email**: security@novasignal.trading
- **General Support**: support@novasignal.trading
- **GitHub Issues**: For non-security bugs only

---

**Thank you for helping keep NovaSignal secure! 🛡️**