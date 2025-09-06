# AI Content-to-PDF Enhancer

Transform web articles and text into beautifully formatted PDFs using AI.

## 🚀 Features

- **AI-Powered Enhancement**: Uses Gemini, OpenAI, or Claude to improve content
- **PDF Generation**: Convert enhanced content to professional PDFs
- **Modern UI**: Built with Next.js 15, React 19, and Tailwind CSS
- **Theme Support**: Light/dark mode with next-themes
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **AI APIs**: Gemini, OpenAI, Anthropic Claude
- **PDF Generation**: Puppeteer with Chromium
- **Deployment**: Optimized for Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-content-pdf-enhancer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 🚀 Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Build & Deploy

### Local Build
```bash
npm run build
npm start
```

### Vercel Deployment

1. **Automatic Deployment** (Recommended):
   - Connect your GitHub repository to Vercel
   - Vercel will automatically deploy on every push

2. **Manual Deployment**:
   ```bash
   npm run deploy
   ```

3. **Production Deployment**:
   ```bash
   npm run deploy:prod
   ```

### Environment Variables on Vercel

Add these environment variables in your Vercel dashboard:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `OPENAI_API_KEY`: Your OpenAI API key (optional)
- `ANTHROPIC_API_KEY`: Your Anthropic Claude API key (optional)
- `NEXT_PUBLIC_APP_URL`: Your deployed app URL

## 🔧 Configuration

### Vercel Configuration

The project includes a `vercel.json` file with optimized settings:

- **Function Timeout**: 300s for PDF generation
- **Regions**: Optimized for US East (iad1)
- **Headers**: CORS and security headers configured
- **Environment**: Proper environment variable mapping

### Next.js Configuration

Key optimizations in `next.config.ts`:

- **Server Components**: External packages configured for Puppeteer
- **Compression**: Enabled for better performance
- **Security Headers**: X-Frame-Options, Content-Type protection
- **Image Optimization**: WebP and AVIF support

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI primitives
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── lib/                  # Utility functions
```

## 🔍 API Keys Setup

### Gemini API (Free)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to your environment variables

### OpenAI API (Paid)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to your environment variables

### Anthropic Claude API (Paid)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create a new API key
3. Add to your environment variables

## 🐛 Troubleshooting

### Common Issues

1. **PDF Generation Timeout**:
   - Increase function timeout in `vercel.json`
   - Check Puppeteer configuration

2. **Build Errors**:
   - Ensure all dependencies are installed
   - Check TypeScript configuration

3. **API Rate Limits**:
   - Monitor API usage
   - Implement proper error handling

### Performance Tips

- Use Edge Runtime where possible
- Optimize images and assets
- Monitor bundle size
- Cache API responses when appropriate

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.