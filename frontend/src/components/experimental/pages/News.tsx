import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Divider,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp,
  TrendingDown,
  AccessTime,
  Bookmark,
  BookmarkBorder,
  Share,
  MoreVert,
  FilterList,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const newsCategories = [
  { label: 'All News', count: 156 },
  { label: 'Markets', count: 42 },
  { label: 'Stocks', count: 38 },
  { label: 'Crypto', count: 24 },
  { label: 'Economy', count: 31 },
  { label: 'Earnings', count: 21 },
];

const newsData = [
  {
    id: 1,
    title: 'Tech Stocks Rally as AI Optimism Returns to Markets',
    summary: 'Major technology companies see significant gains as investors show renewed confidence in artificial intelligence sector growth prospects.',
    source: 'MarketWatch',
    author: 'Sarah Johnson',
    time: '2 hours ago',
    category: 'Stocks',
    sentiment: 'positive',
    image: null,
    saved: false,
  },
  {
    id: 2,
    title: 'Federal Reserve Signals Potential Rate Cuts in Q2 2025',
    summary: 'Fed officials hint at policy shifts amid changing economic conditions, sparking debate among economists and market analysts.',
    source: 'Financial Times',
    author: 'Michael Chen',
    time: '4 hours ago',
    category: 'Economy',
    sentiment: 'neutral',
    image: null,
    saved: true,
  },
  {
    id: 3,
    title: 'Bitcoin Breaks $50K as Institutional Adoption Accelerates',
    summary: 'Cryptocurrency markets surge following major institutional investments and regulatory clarity from key financial jurisdictions.',
    source: 'CoinDesk',
    author: 'Emma Rodriguez',
    time: '6 hours ago',
    category: 'Crypto',
    sentiment: 'positive',
    image: null,
    saved: false,
  },
  {
    id: 4,
    title: 'Apple Reports Strong Q4 Earnings, Beats Expectations',
    summary: 'iPhone maker exceeds analyst forecasts with record quarterly revenue, driven by strong international sales and services growth.',
    source: 'Reuters',
    author: 'David Kim',
    time: '1 day ago',
    category: 'Earnings',
    sentiment: 'positive',
    image: null,
    saved: true,
  },
  {
    id: 5,
    title: 'Oil Prices Decline on Oversupply Concerns',
    summary: 'Crude futures drop as OPEC+ production increases coincide with weakening global demand signals from key economic indicators.',
    source: 'Bloomberg',
    author: 'Lisa Wang',
    time: '1 day ago',
    category: 'Markets',
    sentiment: 'negative',
    image: null,
    saved: false,
  },
];

export function News() {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All News');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [savedArticles, setSavedArticles] = useState<number[]>([2, 4]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveArticle = (articleId: number) => {
    setSavedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'success.main';
      case 'negative': return 'error.main';
      default: return 'warning.main';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp fontSize="small" />;
      case 'negative': return <TrendingDown fontSize="small" />;
      default: return <AccessTime fontSize="small" />;
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Market News & Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Stay informed with real-time market news, analysis, and breaking financial updates
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search news articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                startIcon={<FilterList />}
                variant="outlined"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                Filter
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                {newsCategories.map((category) => (
                  <MenuItem
                    key={category.label}
                    onClick={() => {
                      setSelectedCategory(category.label);
                      setAnchorEl(null);
                    }}
                    selected={selectedCategory === category.label}
                  >
                    {category.label}
                    <Badge
                      badgeContent={category.count}
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* News Tabs */}
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Latest News" />
        <Tab label="Trending" />
        <Tab label="Saved Articles" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {/* Latest News */}
        <Grid container spacing={3}>
          {newsData.map((article) => (
            <Grid key={article.id} xs={12}>
              <Card sx={{ '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          icon={getSentimentIcon(article.sentiment)}
                          label={article.category}
                          size="small"
                          sx={{
                            color: getSentimentColor(article.sentiment),
                            borderColor: getSentimentColor(article.sentiment),
                          }}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {article.time}
                        </Typography>
                      </Box>
                      
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {article.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {article.summary}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {article.author.charAt(0)}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            {article.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • {article.source}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleSaveArticle(article.id)}
                        color={savedArticles.includes(article.id) ? 'primary' : 'default'}
                      >
                        {savedArticles.includes(article.id) ? <Bookmark /> : <BookmarkBorder />}
                      </IconButton>
                      <IconButton size="small">
                        <Share />
                      </IconButton>
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Trending News */}
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Trending News Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Discover the most popular and engaging financial news stories
          </Typography>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Saved Articles */}
        <Grid container spacing={3}>
          {newsData.filter(article => savedArticles.includes(article.id)).map((article) => (
            <Grid key={article.id} xs={12}>
              <Card sx={{ '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {article.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {article.summary}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Saved • {article.source} • {article.time}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleSaveArticle(article.id)}
                      color="primary"
                    >
                      <Bookmark />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Box>
  );
}