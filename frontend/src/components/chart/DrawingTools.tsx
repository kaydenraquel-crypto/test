import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Remove,
  DonutSmall,
  CropSquare,
  ShowChart,
  Timeline,
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
  Settings,
  ColorLens,
  LineWeight,
} from '@mui/icons-material';

interface DrawingObject {
  id: string;
  type: 'trendline' | 'horizontal' | 'vertical' | 'fibonacci' | 'rectangle' | 'channel' | 'arrow';
  name: string;
  color: string;
  lineWidth: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  visible: boolean;
  locked: boolean;
  points: Array<{ time: number; price: number }>;
  properties: Record<string, any>;
  created: Date;
  modified: Date;
}

interface DrawingTool {
  id: string;
  type: DrawingObject['type'];
  name: string;
  icon: React.ReactNode;
  description: string;
  minPoints: number;
  maxPoints: number;
  category: 'lines' | 'shapes' | 'fibonacci' | 'patterns';
}

const DRAWING_TOOLS: DrawingTool[] = [
  {
    id: 'trendline',
    type: 'trendline',
    name: 'Trend Line',
    icon: <TrendingUp />,
    description: 'Draw trend lines to identify price direction',
    minPoints: 2,
    maxPoints: 2,
    category: 'lines',
  },
  {
    id: 'horizontal',
    type: 'horizontal',
    name: 'Horizontal Line',
    icon: <Remove />,
    description: 'Support and resistance levels',
    minPoints: 1,
    maxPoints: 1,
    category: 'lines',
  },
  {
    id: 'vertical',
    type: 'vertical',
    name: 'Vertical Line',
    icon: <Timeline style={{ transform: 'rotate(90deg)' }} />,
    description: 'Mark important time events',
    minPoints: 1,
    maxPoints: 1,
    category: 'lines',
  },
  {
    id: 'fibonacci',
    type: 'fibonacci',
    name: 'Fibonacci Retracement',
    icon: <DonutSmall />,
    description: 'Fibonacci retracement levels',
    minPoints: 2,
    maxPoints: 2,
    category: 'fibonacci',
  },
  {
    id: 'rectangle',
    type: 'rectangle',
    name: 'Rectangle',
    icon: <CropSquare />,
    description: 'Rectangular price ranges',
    minPoints: 2,
    maxPoints: 2,
    category: 'shapes',
  },
  {
    id: 'channel',
    type: 'channel',
    name: 'Price Channel',
    icon: <ShowChart />,
    description: 'Parallel channel lines',
    minPoints: 3,
    maxPoints: 4,
    category: 'patterns',
  },
];

const DRAWING_COLORS = [
  '#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0',
  '#00BCD4', '#FFEB3B', '#795548', '#607D8B', '#E91E63',
];

const LINE_STYLES = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

const LINE_WIDTHS = [1, 2, 3, 4, 5];

interface DrawingToolsProps {
  onToolSelect?: (tool: DrawingTool) => void;
  onDrawingCreate?: (drawing: Partial<DrawingObject>) => void;
  onDrawingUpdate?: (id: string, updates: Partial<DrawingObject>) => void;
  onDrawingDelete?: (id: string) => void;
  drawings?: DrawingObject[];
  activeTool?: string | null;
}

export function DrawingTools({
  onToolSelect,
  onDrawingCreate,
  onDrawingUpdate,
  onDrawingDelete,
  drawings = [],
  activeTool = null,
}: DrawingToolsProps) {
  const [selectedDrawing, setSelectedDrawing] = useState<DrawingObject | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('lines');

  // Group tools by category
  const toolsByCategory = DRAWING_TOOLS.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, DrawingTool[]>);

  const categories = Object.keys(toolsByCategory);

  const handleToolClick = useCallback((tool: DrawingTool) => {
    onToolSelect?.(tool);
  }, [onToolSelect]);

  const handleDrawingEdit = useCallback((drawing: DrawingObject) => {
    setSelectedDrawing(drawing);
    setEditDialogOpen(true);
  }, []);

  const handleDrawingUpdate = useCallback((updates: Partial<DrawingObject>) => {
    if (selectedDrawing && onDrawingUpdate) {
      onDrawingUpdate(selectedDrawing.id, {
        ...updates,
        modified: new Date(),
      });
      setSelectedDrawing({ ...selectedDrawing, ...updates });
    }
  }, [selectedDrawing, onDrawingUpdate]);

  const handleDrawingDelete = useCallback((drawingId: string) => {
    onDrawingDelete?.(drawingId);
    if (selectedDrawing?.id === drawingId) {
      setSelectedDrawing(null);
      setEditDialogOpen(false);
    }
  }, [onDrawingDelete, selectedDrawing]);

  const toggleDrawingVisibility = useCallback((drawing: DrawingObject) => {
    handleDrawingUpdate({ visible: !drawing.visible });
  }, [handleDrawingUpdate]);

  return (
    <Box>
      {/* Drawing Tools Palette */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎨 Drawing Tools
          </Typography>
          
          {/* Category Tabs */}
          <Box sx={{ mb: 2 }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                variant={activeCategory === category ? 'filled' : 'outlined'}
                size="small"
                sx={{ mr: 1, mb: 1 }}
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </Box>

          {/* Tool Grid */}
          <Grid container spacing={1}>
            {toolsByCategory[activeCategory]?.map((tool) => (
              <Grid item xs={6} sm={4} key={tool.id}>
                <Tooltip title={tool.description}>
                  <Button
                    fullWidth
                    variant={activeTool === tool.id ? 'contained' : 'outlined'}
                    onClick={() => handleToolClick(tool)}
                    sx={{
                      minHeight: 60,
                      flexDirection: 'column',
                      gap: 0.5,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                    }}
                  >
                    {tool.icon}
                    {tool.name}
                  </Button>
                </Tooltip>
              </Grid>
            ))}
          </Grid>

          {activeTool && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Active Tool:</strong> {DRAWING_TOOLS.find(t => t.id === activeTool)?.name}
              <br />
              Click on the chart to start drawing.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Drawings List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Chart Objects ({drawings.length})
          </Typography>
          
          {drawings.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No drawings yet. Select a tool above and start drawing on the chart.
            </Typography>
          ) : (
            <List dense>
              {drawings.map((drawing) => (
                <ListItem key={drawing.id} divider>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: drawing.color,
                        opacity: drawing.visible ? 1 : 0.3,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {drawing.name}
                        </Typography>
                        {!drawing.visible && (
                          <Chip label="Hidden" size="small" variant="outlined" />
                        )}
                        {drawing.locked && (
                          <Chip label="Locked" size="small" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Created: {drawing.created.toLocaleDateString()} • 
                        Points: {drawing.points.length}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={drawing.visible ? 'Hide' : 'Show'}>
                        <IconButton
                          size="small"
                          onClick={() => toggleDrawingVisibility(drawing)}
                        >
                          {drawing.visible ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Properties">
                        <IconButton
                          size="small"
                          onClick={() => handleDrawingEdit(drawing)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDrawingDelete(drawing.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Edit Drawing Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings />
            Edit Drawing Properties
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDrawing && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                {/* Name */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={selectedDrawing.name}
                    onChange={(e) => handleDrawingUpdate({ name: e.target.value })}
                  />
                </Grid>

                {/* Color */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Color
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {DRAWING_COLORS.map((color) => (
                      <Box
                        key={color}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: color,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: selectedDrawing.color === color ? '3px solid #fff' : '1px solid #ccc',
                          boxShadow: selectedDrawing.color === color ? '0 0 0 2px #2196F3' : 'none',
                        }}
                        onClick={() => handleDrawingUpdate({ color })}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Line Style */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Line Style</InputLabel>
                    <Select
                      value={selectedDrawing.lineStyle}
                      label="Line Style"
                      onChange={(e) => handleDrawingUpdate({ lineStyle: e.target.value as any })}
                    >
                      {LINE_STYLES.map((style) => (
                        <MenuItem key={style.value} value={style.value}>
                          {style.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Line Width */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Line Width</InputLabel>
                    <Select
                      value={selectedDrawing.lineWidth}
                      label="Line Width"
                      onChange={(e) => handleDrawingUpdate({ lineWidth: Number(e.target.value) })}
                    >
                      {LINE_WIDTHS.map((width) => (
                        <MenuItem key={width} value={width}>
                          {width}px
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Drawing Info */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    bgcolor: 'background.paper', 
                    p: 2, 
                    borderRadius: 1, 
                    border: '1px solid',
                    borderColor: 'divider',
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Drawing Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Type:</strong> {selectedDrawing.type}<br />
                      <strong>Points:</strong> {selectedDrawing.points.length}<br />
                      <strong>Created:</strong> {selectedDrawing.created.toLocaleString()}<br />
                      <strong>Modified:</strong> {selectedDrawing.modified.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setEditDialogOpen(false)}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}