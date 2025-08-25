import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  SmartToy,
  Send,
  Mic,
  MicOff,
  Psychology,
  TrendingUp,
  ShowChart,
  Lightbulb,
  Speed,
  AutoAwesome,
  Chat,
  Analytics,
} from '@mui/icons-material';

interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const aiCapabilities = [
  {
    icon: <ShowChart />,
    title: 'Market Analysis',
    description: 'Real-time technical and fundamental analysis of markets and securities',
  },
  {
    icon: <TrendingUp />,
    title: 'Trade Recommendations',
    description: 'AI-powered trading suggestions based on market conditions and your portfolio',
  },
  {
    icon: <Psychology />,
    title: 'Risk Assessment',
    description: 'Advanced risk analysis and portfolio optimization recommendations',
  },
  {
    icon: <Lightbulb />,
    title: 'Market Insights',
    description: 'Discover hidden patterns and emerging opportunities in financial data',
  },
];

const quickPrompts = [
  'Analyze the current market sentiment for tech stocks',
  'What are the key support and resistance levels for BTC?',
  'Suggest a diversified portfolio allocation for moderate risk',
  'Explain the impact of recent Fed policy on bond markets',
  'Compare the fundamentals of AAPL vs MSFT',
];

export function SuperNova() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm SuperNova, your AI-powered trading assistant. I can help you with market analysis, trading strategies, risk assessment, and much more. What would you like to explore today?",
      timestamp: new Date(),
      suggestions: [
        'Analyze current market trends',
        'Review my portfolio performance',
        'Suggest trading opportunities',
        'Explain market indicators',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: generateAIResponse(inputMessage),
        timestamp: new Date(),
        suggestions: [
          'Tell me more about this',
          'Show me the data',
          'What are the risks?',
          'How does this affect my portfolio?',
        ],
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "Based on current market conditions and technical analysis, I can see several interesting patterns emerging. The S&P 500 has been showing strong momentum above its 50-day moving average, suggesting continued bullish sentiment. However, I notice some divergence in the VIX which might indicate increased volatility ahead.",
      "Looking at the options flow and institutional positioning, there appears to be significant support at current levels. The risk-reward ratio for long positions looks favorable, with a potential target of 15-20% upside and manageable downside risk of 8-10%.",
      "From a fundamental perspective, earnings estimates for Q1 have been revised upward by 12% across major sectors. This, combined with improving economic indicators and Fed policy clarity, creates a supportive backdrop for equity markets.",
      "I've analyzed over 2,000 data points from the past 24 hours, including sentiment analysis, technical indicators, and macroeconomic factors. The confluence suggests a high-probability setup for continued market strength in the near term.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
            }}
          >
            <Psychology />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              SuperNova AI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your intelligent trading assistant powered by advanced AI
            </Typography>
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>AI Status:</strong> Online and analyzing 2,847 data sources in real-time
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
        {/* Chat Interface */}
        <Grid xs={12} lg={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: 0 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Chat with SuperNova
              </Typography>
              
              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  mb: 2,
                  pr: 1,
                }}
              >
                {messages.map((message) => (
                  <Box key={message.id} sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-start',
                        gap: 2,
                      }}
                    >
                      {message.type === 'ai' && (
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'primary.main',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          }}
                        >
                          <Psychology fontSize="small" />
                        </Avatar>
                      )}
                      
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                          color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                          border: message.type === 'ai' ? 1 : 0,
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="body2">
                          {message.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 1,
                            opacity: 0.7,
                          }}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                    
                    {/* AI Suggestions */}
                    {message.type === 'ai' && message.suggestions && (
                      <Box sx={{ mt: 1, ml: 6, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {message.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            size="small"
                            variant="outlined"
                            clickable
                            onClick={() => handleQuickPrompt(suggestion)}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
                
                {isTyping && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      }}
                    >
                      <Psychology fontSize="small" />
                    </Avatar>
                    <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary">
                        SuperNova is analyzing...
                      </Typography>
                      <LinearProgress sx={{ mt: 1, width: 120 }} />
                    </Paper>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Ask SuperNova about markets, trading, or analysis..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  multiline
                  maxRows={3}
                />
                <IconButton
                  color={isListening ? 'error' : 'default'}
                  onClick={toggleVoice}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  {isListening ? <MicOff /> : <Mic />}
                </IconButton>
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  sx={{ alignSelf: 'flex-end', minWidth: 'auto', px: 2 }}
                >
                  <Send />
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Capabilities & Quick Actions */}
        <Grid xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            {/* AI Capabilities */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  AI Capabilities
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {aiCapabilities.map((capability, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.contrastText',
                        }}
                      >
                        {capability.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={500}>
                          {capability.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {capability.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Quick Prompts */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Prompts
                </Typography>
                <List dense>
                  {quickPrompts.map((prompt, index) => (
                    <ListItem
                      key={index}
                      button
                      onClick={() => handleQuickPrompt(prompt)}
                      sx={{ borderRadius: 1, mb: 0.5 }}
                    >
                      <ListItemText
                        primary={prompt}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'primary.main',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* AI Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  AI Performance
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Processing Speed</Typography>
                    <Chip
                      icon={<Speed fontSize="small" />}
                      label="2.3ms"
                      size="small"
                      color="success"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Accuracy Rate</Typography>
                    <Chip
                      icon={<AutoAwesome fontSize="small" />}
                      label="97.8%"
                      size="small"
                      color="primary"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Data Sources</Typography>
                    <Chip
                      icon={<Analytics fontSize="small" />}
                      label="2,847"
                      size="small"
                      color="info"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}