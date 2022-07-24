import React from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import Main from '../Main/Main';
import Footer from '../Footer/Footer';
import Header from '../Header/Header';
import WeatherCards from '../WeatherCards/WeatherCards';
import CurrentTemperatureUnitContext from '../../contexts/CurrentTemperatureUnitContext';
import Navigation from '../Navigation/Navigation';
import Login from '../Login';
import {
  getGeolocation,
  getForecastWeather,
  filterDataFromWeatherAPI,
} from '../../utils/weatherApi';
import Register from '../Register/Register';
import Profile from '../Profile/Profile';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import ShowClothingModal from '../ShowClothingModal/ShowClothingModal';

/**
 * The main React **App** component.
 */
const App = () => {
  // Replace the below state with specific Modal e.g. isCreateClothingModalOpen, setIsCreateClothingModalOpen
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [isRegisterOpen, setisRegisterOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState({});
  const [currentUserEmail, setCurrentUserEmail] = React.useState('');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [currentTemperatureUnit, setCurrentTemperatureUnit] = React.useState('F');

  const [isShowClothingModalOpen, setIsShowClothingModalOpen] = React.useState(false);

  // logic with actual data needed in the future
  const [userAvatar, setUserAvatar] = React.useState(true);
  // set "true" to simulate `isLoggedIn = true` look of the Navigation bar
  const [userName, setUserName] = React.useState(false);

  // userLocation is a state within a useEffect as the state should only be changed once after loading
  const [userLocation, setUserLocation] = React.useState({ latitude: '', longitude: '' });
  const [weatherData, setweatherData] = React.useState();
  // to access the weatherAPI, please create an .env file in the rooter directly
  // then input REACT_APP_WEATHER_API_KEY=keyThatYouGeneratedFromTheWebsite with no quotes
  const WeatherApiKey = process.env.REACT_APP_WEATHER_API_KEY;

  React.useEffect(() => {
    getGeolocation()
      .then(({ coords }) => {
        setUserLocation({
          ...userLocation,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        localStorage.setItem(
          'userLocation',
          JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude })
        );
      })
      .catch(() => {
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation !== null) {
          const parsedLocation = JSON.parse(savedLocation);
          if (parsedLocation.latitude && parsedLocation.longitude) {
            setUserLocation({
              ...userLocation,
              latitude: parsedLocation.latitude,
              longitude: parsedLocation.longitude,
            });
          }
        } else {
          setUserLocation({ ...userLocation, latitude: '40.730610', longitude: '-73.935242' });
        }
      });
  }, []);
  // after getting the location, send the API request to weatherAPI
  React.useEffect(() => {
    if (userLocation.latitude && userLocation.longitude) {
      getForecastWeather(userLocation, WeatherApiKey)
        .then((data) => {
          setweatherData(filterDataFromWeatherAPI(data));
        })
        .catch((err) => {
          // is there better error handling here? Error may occur when the weather API has problems
          console.log(err);
        });
    }
  }, [userLocation, WeatherApiKey]);

  const handleToggleSwitchChange = () => {
    currentTemperatureUnit === 'F'
      ? setCurrentTemperatureUnit('C')
      : setCurrentTemperatureUnit('F');
  };

  // Handle mouse click or Esc key down event
  //Check if all the other modals are open using || operator
  const isAnyPopupOpen = isLoginOpen || isRegisterOpen;
  React.useEffect(() => {
    const handleClickClose = (event) => {
      if (event.target.classList.contains('modal_opened')) {
        closeAllPopups();
      }
    };

    const handleEscClose = (event) => {
      if (event.key === 'Escape') {
        closeAllPopups();
      }
    };

    if (isAnyPopupOpen) {
      document.addEventListener('click', handleClickClose);
      document.addEventListener('keydown', handleEscClose);
    }

    return () => {
      document.removeEventListener('click', handleClickClose);
      document.removeEventListener('keydown', handleEscClose);
    };
  }, [isAnyPopupOpen]);

  const closeAllPopups = () => {
    //Remove the code below & set modal's specific setState function to false
    setIsLoginOpen(false);
    setisRegisterOpen(false);
    setIsShowClothingModalOpen(false);
  };
  // mock clothingCardData for testing ClothingCard component, please test the like button
  // by changing favorited from true to false
  const clothingCardData = {
    name: 'T-shirt',
    imageUrl: 'https://hollywoodchamber.net/wp-content/uploads/2020/06/tshirt-2.jpg',
    isLiked: true,
    type: 't-shirt',
  };
  function handleLikeClick(cardData) {
    // insert logic to interact with WTWR API
    setIsLoginOpen(false);
  }

  const handleLoginSubmit = () => {
    //call the auth.login(loginEmail, loginPassword)
    //if login successful
    setCurrentUserEmail(loginEmail);
    setLoginEmail('');
    setLoginPassword('');
    setIsLoggedIn(true);
    //else catch error
  };

  const handleLogOut = () => {
    setIsLoggedIn(false);
    setCurrentUser({});
    setCurrentUserEmail('');
  };

  const handleRegisterSubmit = (credentials) => {
    // credentials to be used in API call to backend
    console.log(credentials);
  };

  return (
    <div className="page">
      <div className="page__wrapper">
        <CurrentTemperatureUnitContext.Provider
          value={{ currentTemperatureUnit, handleToggleSwitchChange }}
        >
          {/* isLoggedIn will be determined by a future user context */}
          {/* I left the userName state in for the purpose of seeing the different navigation css */}
          {/** rewrite `{userName}` to `{currentUser}` when ready */}
          {/** place login modal open state in Navigation*/}
          <Header>
            <Navigation
              isLoggedIn={isLoggedIn}
              username={userName}
              hasAvatar={userAvatar}
              handleRegisterClick={() => setisRegisterOpen(true)}
              handleLoginClick={() => setIsLoginOpen(true)}
            />
          </Header>
          <Routes>
            <Route exact path="/" element={<Main weatherData={weatherData} />}></Route>
            <Route
              exact
              path="/profile"
              element={
                <ProtectedRoute
                  handleLoginClick={() => setIsLoginOpen(true)}
                  isLoggedIn={isLoggedIn}
                >
                  <Profile cardData={clothingCardData} onCardLike={handleLikeClick} />
                </ProtectedRoute>
              }
            ></Route>
          </Routes>
          Apps
          {/* Replace the ModalWithForm below with specific modals */}
          <Login
            isOpen={isLoginOpen}
            onClose={closeAllPopups}
            onSubmit={handleLoginSubmit}
            loginEmail={loginEmail}
            setLoginEmail={setLoginEmail}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
          />
          <Register
            isOpen={isRegisterOpen}
            onClose={closeAllPopups}
            onSubmit={handleRegisterSubmit}
          />

          <ShowClothingModal 
            // clothingType={} if there is a function that returns the type of clothing is being shown in the modal
            // tempType={} //function where it returns the kind of weather condition (hot, cold, etc)
            // tempDegree={} // function or something that says what temp in degree the clothes are for
            tempUnit={'F' || setCurrentTemperatureUnit} 
                // (above) will show which unit being used by user. 'F' is a placeholder for now.
            isOpen={isShowClothingModalOpen}
            onClose={closeAllPopups}
            // handleClick={ replace with: set state of the edit modal open to true and this modal to close }
          />
          <Footer />
        </CurrentTemperatureUnitContext.Provider>
      </div>
    </div>
  );
};

export default App;
