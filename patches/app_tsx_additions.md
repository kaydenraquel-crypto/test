In your App.tsx sidebar (inside the <div className="side"> ... </div>), add:

import AiAssistantPanel from "./components/AiAssistantPanel";

...

<div className="card">
  <AiAssistantPanel symbol={symbol} market={market} timeframe={timeframe} />
</div>
