# Portfolio Data Models

## Minimum Viable Portfolio Item

For the initial implementation, we'll start with the absolute minimum fields:

### PortfolioItem
```json
{
  "id": "unique identifier (integer or UUID)",
  "stockTicker": "string - stock symbol (e.g., 'AAPL', 'GOOGL')",
  "volume": "number - quantity of shares owned"
}
```

### Example
```json
{
  "id": 1,
  "stockTicker": "AAPL",
  "volume": 100
}
```

## Future Enhancements

As the system evolves, we can add more fields:

### Enhanced PortfolioItem
```json
{
  "id": "unique identifier",
  "type": "string - 'stock', 'bond', 'cash', etc.",
  "symbol": "string - ticker symbol or identifier",
  "name": "string - full name of the asset",
  "quantity": "number - amount owned",
  "purchasePrice": "number - price per unit when purchased",
  "currentPrice": "number - current market price",
  "purchaseDate": "date - when the asset was acquired",
  "sector": "string - market sector (for stocks)",
  "maturityDate": "date - for bonds",
  "currency": "string - currency denomination"
}
```

## API Endpoints (Planned)

- `GET /api/portfolio` - Get all portfolio items
- `GET /api/portfolio/{id}` - Get specific portfolio item
- `POST /api/portfolio` - Create new portfolio item
- `PUT /api/portfolio/{id}` - Update portfolio item
- `DELETE /api/portfolio/{id}` - Delete portfolio item
- `GET /api/portfolio/performance` - Get portfolio performance data
