# Reflector: Epistemic Autonomy Training Suite

A production-ready, self-guided metacognitive training suite that helps users develop epistemic autonomy—the ability to form and maintain beliefs based on evidence rather than social pressure or authority.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Features

### ✅ Phase 1 Complete
- **Baseline Mirror**: 36-item psychometric assessment across 4 constructs
- **Identity Mirror**: Value/tribe drift visualization
- **Echo-Loop Game**: Bias detection training with metacognitive feedback
- **Progress Dashboard**: 4-construct radar chart + streak tracking
- **Local-First Storage**: All data stays in your browser
- **Export Functionality**: JSON/CSV data export

### 🔄 Phase 2 Planned
- Disconfirm Game
- Schema Reclaim exercises
- Influence Map visualization
- Daily reflection prompts
- Optional cloud sync

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: Dexie.js (IndexedDB)
- **Visualizations**: Recharts
- **Icons**: Lucide React
- **Testing**: Vitest

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── mirrors/            # Assessment modules
│   ├── loops/              # Training games
│   ├── progress/           # Dashboard
│   └── settings/           # Data management
├── components/             # Reusable UI components
│   ├── assessment/         # Assessment-specific components
│   ├── visualizations/     # Charts and graphs
│   └── ui/                 # Generic UI components
├── lib/                    # Core logic
│   ├── scoring/            # Psychometric scoring engine
│   ├── store/              # Data persistence layer
│   └── hooks/              # React hooks
├── content/                # Static content
│   ├── assessments/        # Assessment items
│   ├── explainers/         # MDX micro-explainers
│   └── loops/              # Game content
└── types/                  # TypeScript definitions
```

## 🧠 Psychological Foundations

### Core Constructs
1. **Epistemic Autonomy Index (EAI)**: Independence in belief formation
2. **Reflective Flexibility (RF)**: Willingness to revise beliefs
3. **Source Awareness (SA)**: Tracking information provenance
4. **Affect Regulation in Debate (ARD)**: Managing emotional reactivity

### Research Base
- **Schema Therapy** (Young): Core emotional schemas and belief formation
- **Motivational Interviewing** (Miller & Rollnick): Non-judgmental change talk
- **Social Identity Theory** (Tajfel & Turner): In-group/out-group dynamics
- **Cognitive Psychology**: Bias detection and metacognition

## 🔒 Privacy & Ethics

### Privacy-First Design
- **Local-First**: All data stored in browser IndexedDB
- **No Tracking**: No analytics, cookies, or external requests
- **User Ownership**: Complete data export/delete capabilities
- **Transparent**: Open source with clear data handling

### Ethical Framework
- **Non-Coercive**: Users maintain full autonomy
- **Mechanism-Focused**: Critiques processes, not positions
- **Non-Partisan**: Avoids ideological framing
- **Educational**: Designed for self-reflection, not therapy

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_APP_URL
```

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run specific test file
npm test scoring-engine.test.ts
```

### Test Coverage
- ✅ Scoring engine calculations
- ✅ Reverse-coded item handling
- ✅ Confidence interval validity
- ✅ Response integrity checks
- ✅ Data persistence layer

## 📊 Usage Analytics

### Key Metrics to Track
- **Engagement**: Completion rates, time to complete
- **Retention**: 7-day, 30-day active usage
- **Impact**: Self-reported "aha" moments
- **Quality**: Response integrity flags

### Privacy-Preserving Analytics
- No personal data collection
- Aggregate usage patterns only
- User-controlled data sharing
- Local analytics dashboard

## 🔧 Development

### Adding New Assessment Items
1. Edit `src/lib/scoring/assessment-bank.ts`
2. Follow construct balance guidelines
3. Include reverse-coded items
4. Add schema therapy tags
5. Update tests

### Creating New Modules
1. Add page to `src/app/`
2. Create components in `src/components/`
3. Add content to `src/content/`
4. Update navigation
5. Add to progress tracking

### Extending the Scoring Engine
1. Modify `src/lib/scoring/scoring-engine.ts`
2. Update TypeScript types
3. Add comprehensive tests
4. Update documentation

## 🤝 Contributing

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Component-driven development
- Comprehensive testing
- Accessibility compliance

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request

## 📚 Documentation

- [Research Foundations](./RESEARCH.md)
- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)
- [Deployment Guide](./docs/deployment.md)

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Schema Therapy research by Jeffrey Young
- Motivational Interviewing by William Miller & Stephen Rollnick
- Social Identity Theory by Henri Tajfel & John Turner
- Cognitive bias research by Daniel Kahneman
- Open source community contributions

---

**Evidence over echo. Curiosity over certainty.**

Built with ❤️ for epistemic autonomy.