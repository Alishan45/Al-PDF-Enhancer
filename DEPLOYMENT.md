# Vercel Deployment Guide

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ai-content-pdf-enhancer&env=GEMINI_API_KEY&envDescription=AI%20API%20Key%20for%20Gemini%20(pre-filled%20with%20free%20key)&envLink=https://github.com/your-username/ai-content-pdf-enhancer)

## Manual Deployment Steps

### 1. Prerequisites
- Vercel account ([sign up free](https://vercel.com))
- GitHub account
- Node.js 18+ (if deploying via CLI)

### 2. Environment Variables

The app comes with a **free Gemini API key** pre-configured. No additional setup required!

**Optional Environment Variables:**
```bash
# Only add these if you want premium models
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Deploy from GitHub (Recommended)

1. **Fork this repository** to your GitHub account
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your forked repository
   - Click "Deploy"

3. **That's it!** Your app will be deployed with the free Gemini API included.

### 4. Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### 5. Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Configuration Files

### vercel.json
```json
{
  "version": 2,
  "env": {
    "GEMINI_API_KEY": "AIzaSyAvXWuNwwBtBnnJK1N261oWbYsEpgJp2FA"
  },
  "functions": {
    "src/app/api/generate-pdf/route.ts": {
      "maxDuration": 60,
      "memory": 3008
    }
  },
  "regions": ["iad1"]
}
```

### next.config.ts
Optimized for Vercel with:
- ESLint warnings (not errors)
- Puppeteer serverless optimization
- Environment variable handling

## Troubleshooting

### PDF Generation Issues
- **Memory Limits**: PDF generation uses 3GB memory allocation
- **Timeout**: 60-second limit for PDF generation
- **Browser**: Uses @sparticuz/chromium for Vercel compatibility

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Performance Optimization
- PDF generation is optimized for serverless
- Images and assets are automatically optimized
- Static pages are pre-rendered where possible

## Monitoring

### Vercel Dashboard
- **Deployments**: Track deployment status
- **Functions**: Monitor API performance
- **Analytics**: View usage statistics
- **Logs**: Debug issues in real-time

### Key Metrics to Watch
- **Function Duration**: PDF generation should complete <60s
- **Memory Usage**: Monitor for memory spikes
- **Error Rate**: Check API error responses

## Scaling

### Free Tier Limits
- 100GB bandwidth/month
- 1000 serverless function invocations/day
- 10 second execution limit (60s for Pro)

### Pro Features ($20/month)
- Unlimited bandwidth
- Advanced analytics
- 60-second function timeout
- Priority support

## Security

### Built-in Security
- Environment variables are encrypted
- API keys are server-side only
- HTTPS by default
- CORS protection

### Best Practices
- Never expose API keys in client-side code
- Use Vercel's environment variable system
- Enable branch protection in GitHub
- Monitor usage for unusual activity

## Support

### Getting Help
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project Issues](https://github.com/your-username/ai-content-pdf-enhancer/issues)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Common Solutions
- **Build fails**: Check Node.js version (18+)
- **API errors**: Verify environment variables
- **PDF issues**: Check browser compatibility
- **Memory errors**: Upgrade to Pro plan if needed
