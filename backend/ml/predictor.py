\
# Enhanced PyTorch LSTM forecaster with improved architecture and training
# Features: multi-layer LSTM, dropout, normalization, enhanced training

from typing import List, Dict, Any, Tuple
import numpy as np
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler

class EnhancedLSTMForecaster(nn.Module):
    def __init__(self, input_size=5, hidden_size=128, num_layers=3, dropout=0.2):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        # Multi-layer LSTM with dropout
        self.lstm = nn.LSTM(
            input_size, hidden_size, num_layers, 
            batch_first=True, dropout=dropout if num_layers > 1 else 0
        )
        
        # Attention mechanism
        self.attention = nn.MultiheadAttention(hidden_size, num_heads=8, batch_first=True)
        
        # Output layers with dropout and batch norm
        self.dropout = nn.Dropout(dropout)
        self.bn1 = nn.BatchNorm1d(hidden_size)
        self.fc1 = nn.Linear(hidden_size, 64)
        self.bn2 = nn.BatchNorm1d(64)
        self.fc2 = nn.Linear(64, 32)
        self.fc3 = nn.Linear(32, 1)
        self.relu = nn.ReLU()

    def forward(self, x):
        # LSTM forward pass
        lstm_out, (h_n, c_n) = self.lstm(x)
        
        # Apply attention
        attn_out, _ = self.attention(lstm_out, lstm_out, lstm_out)
        
        # Use last timestep
        last_output = attn_out[:, -1, :]
        
        # Forward through dense layers with normalization
        out = self.dropout(last_output)
        out = self.bn1(out)
        out = self.relu(self.fc1(out))
        out = self.bn2(out)
        out = self.relu(self.fc2(out))
        out = self.fc3(out)
        
        return out

def _calculate_technical_indicators(ohlc: List[Dict[str, Any]]) -> np.ndarray:
    """Calculate technical indicators for enhanced features"""
    data = np.array([[bar["open"], bar["high"], bar["low"], bar["close"], bar.get("volume", 0)] 
                     for bar in ohlc])
    
    if len(data) < 20:
        return data
    
    closes = data[:, 3]
    highs = data[:, 1]
    lows = data[:, 2]
    volumes = data[:, 4]
    
    # Simple moving averages
    sma_5 = np.convolve(closes, np.ones(5)/5, mode='same')
    sma_20 = np.convolve(closes, np.ones(20)/20, mode='same')
    
    # RSI calculation
    delta = np.diff(closes)
    gain = np.where(delta > 0, delta, 0)
    loss = np.where(delta < 0, -delta, 0)
    avg_gain = np.convolve(gain, np.ones(14)/14, mode='same')
    avg_loss = np.convolve(loss, np.ones(14)/14, mode='same')
    rs = avg_gain / (avg_loss + 1e-8)
    rsi = 100 - (100 / (1 + rs))
    rsi = np.concatenate([[50], rsi])  # pad first value
    
    # Bollinger Bands
    rolling_mean = np.convolve(closes, np.ones(20)/20, mode='same')
    rolling_std = np.array([np.std(closes[max(0, i-19):i+1]) for i in range(len(closes))])
    bb_upper = rolling_mean + (rolling_std * 2)
    bb_lower = rolling_mean - (rolling_std * 2)
    bb_position = (closes - bb_lower) / (bb_upper - bb_lower + 1e-8)
    
    # Volatility
    volatility = np.array([np.std(closes[max(0, i-19):i+1]) for i in range(len(closes))])
    
    # Volume rate of change
    volume_roc = np.concatenate([[0], np.diff(volumes) / (volumes[:-1] + 1e-8)])
    
    # Combine all features: OHLCV + technical indicators
    features = np.column_stack([
        data,  # OHLCV
        sma_5, sma_20, rsi, bb_position, volatility, volume_roc
    ])
    
    return features.astype(np.float32)

def _prepare_series(ohlc: List[Dict[str, Any]], lookback: int = 500) -> Tuple[np.ndarray, bool, MinMaxScaler]:
    """Prepare enhanced feature series with normalization"""
    if len(ohlc) < 50:
        # fallback: naive
        closes = np.array([bar["close"] for bar in ohlc], dtype=np.float32)
        scaler = MinMaxScaler()
        return closes, True, scaler
    
    # Extract enhanced features
    features = _calculate_technical_indicators(ohlc[-lookback:])
    
    # Normalize features
    scaler = MinMaxScaler()
    features_normalized = scaler.fit_transform(features)
    
    return features_normalized, False, scaler

def _make_sequences(features: np.ndarray, window: int = 60) -> Tuple[np.ndarray, np.ndarray]:
    """Create sequences with enhanced features"""
    X, y = [], []
    
    for i in range(len(features) - window):
        X.append(features[i:i+window])
        # Predict close price (4th column after normalization)
        y.append(features[i+window, 3])  # close price
    
    X = np.array(X)  # (N, window, features)
    y = np.array(y)[:, None]  # (N, 1)
    
    return X, y

def _horizon_to_steps(h: str, base_interval_minutes: int = 1):
    # supports "5m", "1h", "1d"
    unit = h[-1]
    val = int(h[:-1])
    if unit == "m":
        return max(1, val // base_interval_minutes)
    if unit == "h":
        return max(1, (val*60) // base_interval_minutes)
    if unit == "d":
        return max(1, (val*1440) // base_interval_minutes)
    return 1

class EarlyStopping:
    def __init__(self, patience=7, min_delta=1e-4):
        self.patience = patience
        self.min_delta = min_delta
        self.best_loss = float('inf')
        self.counter = 0
        
    def __call__(self, val_loss):
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
            return False
        else:
            self.counter += 1
            return self.counter >= self.patience

def predict_prices_multi_horizon(ohlc: List[Dict[str, Any]], horizons: List[str], base_interval: int = 1):
    features, fallback, scaler = _prepare_series(ohlc, lookback=800)
    
    if fallback:
        last = float(features[-1]) if len(features) else 0.0
        return {h: {"predicted_close": last, "note": "insufficient history; naive hold"} for h in horizons}

    # Enhanced training with validation split
    X, y = _make_sequences(features, window=60)
    
    # Train/validation split
    split_idx = int(len(X) * 0.8)
    X_train, X_val = X[:split_idx], X[split_idx:]
    y_train, y_val = y[:split_idx], y[split_idx:]
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = EnhancedLSTMForecaster(input_size=features.shape[1]).to(device)
    
    # Enhanced loss function (Huber loss for robustness)
    criterion = nn.HuberLoss(delta=0.1)
    
    # Enhanced optimizer with weight decay
    optimizer = torch.optim.AdamW(model.parameters(), lr=0.001, weight_decay=1e-4)
    
    # Learning rate scheduler
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=5
    )
    
    # Convert to tensors
    X_train_t = torch.tensor(X_train, dtype=torch.float32).to(device)
    y_train_t = torch.tensor(y_train, dtype=torch.float32).to(device)
    X_val_t = torch.tensor(X_val, dtype=torch.float32).to(device)
    y_val_t = torch.tensor(y_val, dtype=torch.float32).to(device)
    
    # Early stopping
    early_stopping = EarlyStopping(patience=10)
    
    # Enhanced training loop
    model.train()
    best_model_state = None
    
    for epoch in range(100):  # More epochs with early stopping
        # Training
        optimizer.zero_grad()
        train_pred = model(X_train_t)
        train_loss = criterion(train_pred, y_train_t)
        train_loss.backward()
        
        # Gradient clipping for stability
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        
        # Validation
        model.eval()
        with torch.no_grad():
            val_pred = model(X_val_t)
            val_loss = criterion(val_pred, y_val_t)
        
        scheduler.step(val_loss)
        
        # Early stopping check
        if early_stopping(val_loss.item()):
            break
            
        # Save best model
        if val_loss.item() < early_stopping.best_loss:
            best_model_state = model.state_dict().copy()
        
        model.train()
    
    # Load best model
    if best_model_state:
        model.load_state_dict(best_model_state)
    
    # Generate predictions for each horizon
    model.eval()
    preds = {}
    
    with torch.no_grad():
        # Start from last window in features
        last_window = features[-60:].copy()  # Use last 60 timesteps
        
        for h in horizons:
            steps = _horizon_to_steps(h, base_interval_minutes=base_interval)
            current_window = last_window.copy()
            
            # Roll forward prediction
            for _ in range(steps):
                # Prepare input
                input_tensor = torch.tensor(
                    current_window[None, :, :], dtype=torch.float32
                ).to(device)
                
                # Get prediction
                pred = model(input_tensor).cpu().numpy().squeeze()
                
                # Create next timestep features (replicate last timestep and update close price)
                next_features = current_window[-1].copy()
                next_features[3] = pred  # Update close price
                
                # Roll window forward
                current_window = np.vstack([current_window[1:], next_features])
            
            # Denormalize prediction
            dummy_features = np.zeros((1, features.shape[1]))
            dummy_features[0, 3] = pred
            denormalized = scaler.inverse_transform(dummy_features)
            predicted_close = denormalized[0, 3]
            
            preds[h] = {
                "predicted_close": float(predicted_close),
                "confidence": "enhanced_model"
            }
    
    return preds
