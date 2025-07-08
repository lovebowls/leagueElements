# League Element Configuration Wrapper

The `LeagueElementConfig` class provides a simple JavaScript API for hosting the LeagueElement with just a league ID. This abstracts attribute management and data fetching, making it easy for end users to embed leagues in their applications.

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>My League Page</title>
</head>
<body>
    <div id="league-container"></div>
    <script type="module">
        import './leagueElement.js';

        const config = new LeagueElementConfig({
            leagueId: 'your-league-id-here',
            container: '#league-container'
        });

        config.load();
    </script>
</body>
</html>
```

### Advanced Usage

```javascript
const config = new LeagueElementConfig({
    leagueId: 'my-league-123',
    container: '#league-container',
    isMobile: false,
    fontScale: 1.2,
    apiBaseUrl: 'https://www.lovebowls.co.uk/_functions',
    onError: (error) => {
        console.error('League loading failed:', error);
    },
    onLoad: (element, data) => {
        console.log('League loaded successfully!', data);
    }
});

// Load the league
await config.load();

// Later, you can reload or destroy
await config.reload();
config.destroy();
```

## Configuration Options

| Option         | Type       | Default                                    | Description                                 |
|----------------|------------|--------------------------------------------|---------------------------------------------|
| `leagueId`     | string     | **required**                               | The league ID to load from your API         |
| `container`    | string     | **required**                               | CSS selector for the container element      |
| `isMobile`     | boolean    | `false`                                    | Whether to render in mobile mode            |
| `fontScale`    | number     | `1.0`                                      | Font scale factor (0.5 to 2.0)              |
| `apiBaseUrl`   | string     | `'https://www.lovebowls.co.uk/_functions'` | Base URL for API calls                      |
| `onError`      | function   | `console.error`                            | Error callback function                     |
| `onLoad`       | function   | `console.log`                              | Success callback function                   |

## API Methods

### `load()`
Loads the league data and renders the element.

```javascript
await config.load();
```

### `reload()`
Reloads the league data.

```javascript
await config.reload();
```

### `destroy()`
Destroys the element and cleans up.

```javascript
config.destroy();
```

### `getElement()`
Gets the current league element instance.

```javascript
const element = config.getElement();
```

### `getLoadingState()`
Gets the current loading state.

```javascript
const isLoading = config.getLoadingState();
```

### `getError()`
Gets the last error, if any.

```javascript
const error = config.getError();
```

### `updateConfig(options)`
Updates the configuration and reloads if needed.

```javascript
config.updateConfig({
    isMobile: true,
    fontScale: 1.5
});
```

## Event Handling

The configuration wrapper automatically sets up event listeners and re-dispatches league events with additional context:

```javascript
document.addEventListener('league-config-event', (event) => {
    const { type, league, error, config, leagueId } = event.detail;

    switch (type) {
        case 'requestSaveLeague':
            // Handle league save requests
            console.log('Save league:', league);
            break;
        case 'requestAdminView':
            // Handle admin view requests
            console.log('Admin view for league:', leagueId);
            break;
        case 'matchClick':
            // Handle match clicks
            console.log('Match clicked:', event.detail.match);
            break;
    }
});
```

## Error Handling

The wrapper provides built-in error handling with loading and error states:

```javascript
const config = new LeagueElementConfig({
    leagueId: 'my-league',
    container: '#container',
    onError: (error) => {
        // Custom error handling
        showErrorMessage(error.message);
    },
    onLoad: (element, data) => {
        // Success handling
        showSuccessMessage('League loaded successfully!');
    }
});
```

## API Response Format

Your API endpoint should return data in this format:

```json
{
    "canEdit": true,
    "league": {
        // Your league data object
        "name": "My League",
        "teams": [...],
        "matches": [...],
        // ... other league properties
    }
}
```

## Browser Support

The configuration wrapper requires:
- ES6 modules support
- Fetch API support
- Custom Elements support

For older browsers, you may need to include polyfills.

## Troubleshooting

### Common Issues

1. **"Container element not found"**
   - Make sure the container selector exists in the DOM
   - Ensure the script runs after the DOM is loaded

2. **"Failed to fetch league data"**
   - Check your API endpoint is accessible
   - Verify the league ID is correct
   - Check CORS settings if loading from a different domain

3. **"Invalid league data received"**
   - Ensure your API returns the expected format
   - Check that the `league` property is present in the response

### Debug Mode

Enable debug logging by setting:

```javascript
window.LeagueElementConfig.debug = true;
```

This will log additional information about the loading process. 