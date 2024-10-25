import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Privacy and Data Protection</h1>
      <p>
        By using this application, you agree to the collection and processing of your data in accordance with our privacy policy. 
        Our application uses APIs to provide you with accurate and up-to-date weather information, including accessing your location 
        for personalized forecasts.
      </p>

      <h2 style={styles.subheading}>What Data We Collect:</h2>
      <ul>
        <li>
          <strong>Location Information</strong>: Your current location is collected to provide weather forecasts specific to your region. 
          This is done using your device's Geolocation API.
        </li>
        <li>
          <strong>Weather Preferences</strong>: Information like your preferred temperature units (Celsius/Fahrenheit) may be saved locally on your device.
        </li>
        <li>
          <strong>Usage Data</strong>: We may collect anonymized data on how the app is used, such as interaction logs for improving performance.
        </li>
      </ul>

      <h2 style={styles.subheading}>How We Use Your Data:</h2>
      <ul>
        <li>
          <strong>Personalized Weather Forecasts</strong>: Your location data is used strictly to provide relevant weather forecasts for your current or selected location.
        </li>
        <li>
          <strong>Performance and Analytics</strong>: Anonymized usage data may be collected to improve app functionality, performance, and user experience.
        </li>
      </ul>

      <h2 style={styles.subheading}>Data Security:</h2>
      <p>
        We are committed to ensuring that your information is secure. We have implemented suitable physical, electronic, and managerial procedures 
        to safeguard and secure the data collected.
      </p>

      <h2 style={styles.subheading}>Third-Party Services:</h2>
      <p>
        We use third-party APIs such as OpenWeatherMap for retrieving weather data and location services for determining your current position. 
        These services may collect data according to their respective privacy policies, which we encourage you to review.
      </p>

      <h2 style={styles.subheading}>Your Rights:</h2>
      <ul>
        <li>You have the right to access, update, or delete any personal information we hold about you.</li>
        <li>You can disable location services at any time through your device settings. However, this may affect some functionality of the app.</li>
      </ul>

      <h2 style={styles.subheading}>Consent:</h2>
      <p>
        By using this application, you consent to the collection and use of your data as outlined in this policy. For more information or to review 
        our full privacy policy, please visit <a href="[link to full privacy policy]">our full privacy policy</a>.
      </p>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '800px',
    margin: 'auto',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  subheading: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginTop: '20px',
  },
};

export default PrivacyPolicy;