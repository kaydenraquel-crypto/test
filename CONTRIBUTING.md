# Contributing to NovaSignal Trading Platform

Thank you for considering contributing to NovaSignal! We welcome contributions from developers, traders, designers, and documentation writers.

## 🤝 How to Contribute

### 📋 Types of Contributions

We welcome several types of contributions:

- 🐛 **Bug Reports**: Help us identify and fix issues
- ✨ **Feature Requests**: Suggest new features or improvements  
- 💻 **Code Contributions**: Submit bug fixes or new features
- 📖 **Documentation**: Improve our docs, guides, and examples
- 🎨 **Design**: UI/UX improvements and design assets
- 🧪 **Testing**: Add tests, find edge cases, test new features
- 🌍 **Translations**: Help us support multiple languages

### 🚀 Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/novasignal.git
   cd novasignal
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   npm run dev:setup
   
   # Start development servers  
   npm run dev
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   git checkout -b fix/your-bug-fix
   git checkout -b docs/your-documentation-update
   ```

## 📝 Development Guidelines

### 🏗️ Code Standards

**TypeScript/JavaScript**
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer functional components with hooks

**Python**
- Follow PEP 8 style guidelines  
- Use type hints for function signatures
- Add docstrings for all public functions
- Use meaningful variable names
- Follow FastAPI best practices

**CSS/Styling**
- Use CSS custom properties for theming
- Follow BEM methodology for class names
- Prefer CSS-in-JS for component styles
- Ensure responsive design compatibility
- Test across all supported themes

### 🧪 Testing Requirements

**Frontend Tests**
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run coverage report
npm run test:coverage
```

**Backend Tests**
```bash
# Run Python tests
npm run test:backend

# Run with coverage
npm run test:backend:coverage
```

**Integration Tests**
```bash
# Run E2E tests
npm run test:e2e
```

### 📦 Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/) for clear commit history:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix  
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(chart): add support for volume indicators
fix(websocket): resolve connection timeout issues  
docs(api): update trading endpoints documentation
style(theme): improve dark theme contrast ratios
```

### 🔄 Pull Request Process

1. **Before Submitting**
   - Ensure all tests pass
   - Update documentation if needed
   - Add tests for new features
   - Check code formatting with linter
   - Verify all themes work correctly

2. **PR Description Template**
   ```markdown
   ## 📋 Description
   Brief description of changes

   ## 🔄 Type of Change
   - [ ] Bug fix
   - [ ] New feature  
   - [ ] Documentation update
   - [ ] Performance improvement
   - [ ] Refactoring

   ## 🧪 Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   - [ ] Cross-browser testing done

   ## 📸 Screenshots (if applicable)
   Add screenshots for UI changes

   ## ✅ Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

3. **Review Process**
   - At least one maintainer review required
   - All CI checks must pass
   - Address feedback promptly
   - Maintain clean commit history

## 🐛 Reporting Bugs

### Before Reporting
- Check existing issues for duplicates
- Test with the latest version
- Try to reproduce with minimal steps

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**  
What actually happens

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 96]
- NovaSignal Version: [e.g. 1.0.0]
- API Providers: [e.g. Alpha Vantage, Binance]

**Screenshots**
Add screenshots if helpful

**Additional Context**
Any other relevant information
```

## ✨ Feature Requests

### Feature Request Template
```markdown
**Feature Summary**
Brief description of the feature

**Problem/Use Case**
What problem does this solve?

**Proposed Solution**  
How should this work?

**Alternatives Considered**
Other solutions you've thought about

**Additional Context**
Mockups, examples, references
```

## 🏗️ Architecture Guidelines

### 📁 Project Structure
```
novasignal/
├── frontend/              # React TypeScript app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts  
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/          # Utilities and helpers
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript definitions
│   └── public/           # Static assets
├── backend/              # Python FastAPI app
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Core functionality
│   │   ├── models/       # Data models
│   │   └── services/     # Business logic
│   └── tests/            # Backend tests
├── installer/            # Electron installer app
├── docs/                 # Documentation
└── .github/             # GitHub Actions workflows
```

### 🔧 Component Guidelines

**React Components**
```typescript
// Use functional components with TypeScript
interface ComponentProps {
  title: string;
  onAction: (data: any) => void;
}

export function Component({ title, onAction }: ComponentProps) {
  // Implementation
}
```

**Custom Hooks**
```typescript
// Prefix with 'use' and provide clear return types
export function useMarketData(symbol: string) {
  // Hook implementation with proper typing
  return { data, loading, error };
}
```

### 🎨 Theme Integration

All new components should support the global theme system:

```typescript
// Use theme context
import { useTheme } from '../contexts/ThemeContext';

export function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <div className="panel" style={{ 
      backgroundColor: 'var(--panel-bg-primary)',
      color: 'var(--text-primary)' 
    }}>
      {/* Component content */}
    </div>
  );
}
```

## 🛡️ Security Guidelines

### 🔐 Security Best Practices
- Never commit API keys or secrets
- Use environment variables for configuration
- Validate all user inputs
- Sanitize data before display
- Use HTTPS for all external requests
- Encrypt sensitive stored data

### 🔍 Security Review Process
- All PRs undergo security review
- Dependency updates require approval
- External API integrations need review
- User data handling must follow privacy guidelines

## 📞 Getting Help

### 💬 Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas  
- **Discord**: Real-time chat with the community
- **Email**: security@novasignal.trading (security issues)

### 📖 Resources
- [Development Setup Guide](docs/development/setup.md)
- [API Documentation](docs/api/README.md)
- [Component Library](docs/components/README.md)
- [Architecture Overview](docs/technical/architecture.md)

## 🎖️ Recognition

Contributors will be:
- Listed in our [CONTRIBUTORS.md](CONTRIBUTORS.md) file
- Featured in release notes for significant contributions
- Eligible for contributor badges and recognition
- Invited to join the core contributor team

## 📄 License

By contributing to NovaSignal, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Thank you for helping make NovaSignal better! 🚀**

*Together, we're building the future of trading platforms.*