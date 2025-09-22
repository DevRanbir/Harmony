# Mathematical Mode Demo

When you select "Mathematical" writing style in the chat settings, the AI will automatically include chartable data in its responses. The enhanced mathematical mode now features:

## Enhanced Features
- **Extended Context Memory**: Preserves data from earlier messages (up to 10 data snippets)
- **Smart Reply Context**: When replying to data messages, includes up to 500 characters instead of 200
- **Session Memory**: Remembers important data throughout the conversation
- **Intelligent Data Detection**: Automatically identifies and preserves JSON data blocks

## How It Works
1. The AI detects when you're in mathematical mode
2. It preserves messages containing JSON data for longer context
3. When you ask questions about earlier data, it references the session memory
4. Reply feature includes more context for data-heavy messages

## Line Chart Example
```json
[
  {"month": "Jan", "sales": 1200, "profit": 300},
  {"month": "Feb", "sales": 1500, "profit": 450},
  {"month": "Mar", "sales": 1800, "profit": 600},
  {"month": "Apr", "sales": 2100, "profit": 750},
  {"month": "May", "sales": 2400, "profit": 900}
]
```

## Bar Chart Example  
```json
{
  "type": "bar",
  "title": "Quarterly Performance",
  "data": [
    {"quarter": "Q1", "revenue": 45000, "expenses": 32000},
    {"quarter": "Q2", "revenue": 52000, "expenses": 35000},
    {"quarter": "Q3", "revenue": 48000, "expenses": 33000},
    {"quarter": "Q4", "revenue": 61000, "expenses": 38000}
  ],
  "xKey": "quarter",
  "dataKeys": ["revenue", "expenses"]
}
```

## Pie Chart Example
```json
{
  "type": "pie",
  "title": "Market Share Distribution",
  "data": [
    {"name": "Product A", "value": 35},
    {"name": "Product B", "value": 25},
    {"name": "Product C", "value": 20},
    {"name": "Product D", "value": 15},
    {"name": "Others", "value": 5}
  ],
  "xKey": "name",
  "yKey": "value"
}
```

## Testing the Enhanced Memory
1. Send a message with data (like the examples above)
2. Continue the conversation with 3-4 other messages
3. Ask a question about the earlier data (e.g., "What was the sales figure for March?")
4. The AI should now have access to the data and respond accurately
5. Use the reply feature on data messages to get enhanced context

## Example Combined Response
Here's what a response with multiple charts might look like:

**Sales Performance Analysis:**

Our quarterly analysis shows strong growth across all metrics:

```json
[
  {"quarter": "Q1", "revenue": 15000, "expenses": 12000},
  {"quarter": "Q2", "revenue": 18500, "expenses": 13200},
  {"quarter": "Q3", "revenue": 22000, "expenses": 14800},
  {"quarter": "Q4", "revenue": 25500, "expenses": 16200}
]
```

The market share distribution remained stable:

```json
{
  "type": "pie",
  "title": "Market Share by Product",
  "data": [
    {"name": "Product A", "value": 45},
    {"name": "Product B", "value": 30},
    {"name": "Product C", "value": 25}
  ],
  "xKey": "name",
  "yKey": "value"
}
```

Monthly growth trends show consistent improvement:

```json
{
  "type": "area",
  "title": "Monthly Growth Rate",
  "data": [
    {"month": "Jan", "growth": 5.2},
    {"month": "Feb", "growth": 6.8},
    {"month": "Mar", "growth": 8.1},
    {"month": "Apr", "growth": 7.9},
    {"month": "May", "growth": 9.3},
    {"month": "Jun", "growth": 10.1}
  ],
  "xKey": "month",
  "yKey": "growth"
}
```

These three charts will automatically render in a beautiful masonry layout that adapts to your screen size and theme preferences.

## Multiple Charts Example
When the AI response contains multiple JSON data blocks, they will automatically be rendered in a masonry layout:

```json
[
  {"month": "Jan", "sales": 1200, "profit": 300},
  {"month": "Feb", "sales": 1500, "profit": 450},
  {"month": "Mar", "sales": 1800, "profit": 600}
]
```

```json
{
  "type": "pie", 
  "title": "Sales Distribution",
  "data": [
    {"name": "Product A", "value": 40},
    {"name": "Product B", "value": 35},
    {"name": "Product C", "value": 25}
  ],
  "xKey": "name",
  "yKey": "value"
}
```

```json
{
  "type": "bar",
  "title": "Monthly Comparison", 
  "data": [
    {"month": "Q1", "revenue": 5000},
    {"month": "Q2", "revenue": 6500},
    {"month": "Q3", "revenue": 7200}
  ],
  "xKey": "month",
  "yKey": "revenue"
}
```

## Key Features
- **Masonry Layout**: Multiple charts automatically arrange in an elegant grid
- **Transparent Backgrounds**: Charts blend seamlessly with the chat interface
- **No Hover Effects**: Clean, distraction-free presentation
- **Theme Compatibility**: Perfect contrast in both light and dark modes
- **Bookmark Support**: Charts render identically in bookmarked messages
- **Responsive Design**: Adapts beautifully to different screen sizes

The charts will automatically detect the theme and adjust colors accordingly. Dark mode uses cooler tones while light mode uses warmer tones for better readability.