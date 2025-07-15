# Weather Forecast Application

A modern, responsive weather forecast application built with React, Vite, and the OpenWeatherMap API.

This app provides current weather conditions, a 7-day forecast, and supports multiple cities with localization in English and Spanish. It features dark mode, geolocation, and a user-friendly interface.

Link: [Weather Forecast App](https://fabaweatherapp.netlify.app/)

## Features

- **Current Weather**: Display current temperature, conditions, and location
- **7-Day Forecast**: Show daily weather summaries with detailed information
- **Search Functionality**: Search for weather in different cities
- **Multi-language Support**: English and Spanish localization
- **Dark Mode**: Light and dark theme support
- **Geolocation**: Automatic location detection
- **Saved Cities**: Save and manage multiple cities
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Error Handling**: Graceful error handling with user-friendly messages

## Tech Stack

- **Frontend**: React 18.3.1
- **Build Tool**: Vite 5.4.10
- **Package Manager**: Yarn
- **State Management**: React Context API
- **Data Fetching**: React Query (@tanstack/react-query)
- **Internationalization**: react-i18next
- **Routing**: React Router DOM
- **Testing**: Jest, React Testing Library
- **Styling**: CSS with CSS Variables for theming

## Project Structure

```
src/
├── components/         # Reusable UI components
├── containers/         # Smart components handling logic
├── hooks/             # Custom React hooks
├── services/          # API services and utility functions
├── contexts/          # Context providers for global state
├── styles/           # Global and component-specific styles
├── constants/        # Application-wide constants
├── i18n/            # Localization files
├── pages/           # Page-level components
└── App.jsx          # Main App component
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Yarn package manager

### Installation

1. Clone the repository or navigate to the project directory

2. **Set up environment variables** (REQUIRED for API access):
   Create a `.env` file in the project root with your OpenWeatherMap API key:

   ```bash
   # Create .env file manually with your API key:
   echo "VITE_OPENWEATHER_API_KEY=your_actual_api_key_here" > .env
   echo "VITE_APP_NAME=Weather Forecast App" >> .env
   echo "VITE_APP_VERSION=1.0.0" >> .env
   ```

   🔑 **You MUST get your own free API key from [OpenWeatherMap](https://openweathermap.org/api)**

   📋 **See `ENV_SETUP.md` for detailed setup instructions**

3. Install dependencies:

   ```bash
   yarn install
   ```

4. Start the development server:

   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in your browser

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn test` - Run tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage report
- `yarn lint` - Run ESLint

## API Configuration

The application uses the OpenWeatherMap API. For security reasons, the API key is now managed through environment variables.

### Environment Setup

- **Required**: You MUST create a `.env` file with your own `VITE_OPENWEATHER_API_KEY`
- **Security**: The `.env` file is gitignored and never committed to version control
- **No Fallback**: The app will not start without a valid API key in environment variables
- **Documentation**: See `ENV_SETUP.md` for complete setup instructions

### API Endpoints Used

- **Current Weather**: `https://api.openweathermap.org/data/2.5/weather`
- **5-Day Forecast**: `https://api.openweathermap.org/data/2.5/forecast`

**Note**: We use the free tier APIs only. The OneCall API now requires a paid subscription.

### Getting Your Own API Key

1. Visit [OpenWeatherMap API](https://openweathermap.org/api)
2. Create a free account
3. Copy your API key from the dashboard
4. Add it to your `.env` file as `VITE_OPENWEATHER_API_KEY=your_key_here`

## Features Implementation

### Theme Support

- Light and dark themes
- Persistent theme selection using localStorage
- CSS variables for consistent theming

### Internationalization

- English and Spanish support
- Automatic language detection
- Persistent language selection

### State Management

- React Context for global state
- Separate contexts for theme, language, and weather data
- Local storage integration for persistence

### Error Handling

- Network error handling
- API error responses
- Geolocation errors
- User-friendly error messages

## Development Guidelines

### Code Quality

- Clean and modular code with reusable components
- Proper naming conventions
- TypeScript-ready structure

### Performance

- React Query for efficient data fetching and caching
- Memoization where appropriate
- Optimized rendering

### Testing

- Unit tests with Jest and React Testing Library
- Component testing
- Integration tests for API interactions
- Target: 90%+ test coverage

### Accessibility

- Semantic HTML structure
- ARIA attributes where necessary
- Keyboard navigation support
- Screen reader friendly

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Contributing

1. Follow the existing code style and structure
2. Write tests for new features
3. Update documentation as needed
4. Ensure responsive design compatibility

## License

This project is created for educational purposes as part of a case study evaluation.
