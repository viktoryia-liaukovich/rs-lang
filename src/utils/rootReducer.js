import actions from './actions';

const getData = (key, initialValue) => {
  const data = localStorage.getItem(key);

  if (!data) {
    localStorage.setItem(key, initialValue);
  }

  let result = data;
  try {
    result = JSON.parse(data);
  } catch {
    result = data;
  }

  return result ? result : initialValue;
};

export const initialState = {
  sprintTruelyAnswers: [],
  sprintFalsyAnswers: [],
  sprintPoints: 0,
  locale: getData('lang', 'ru_RU'),
  dict: {},
  user: getData('user', null),
  darkTheme: getData('darkTheme', false),
  searchValue: '',
  authForm: {
    isFormOpen: false,
    isSignup: true,
  },
};

export default function rootReducer(state = initialState, action) {
  switch (action.type) {
    case actions.CHANGE_THEME: {
      localStorage.setItem('darkTheme', action.payload);
      return {
        ...state,
        darkTheme: action.payload,
      };
    }
    case actions.SET_LOCALE: {
      localStorage.setItem('lang', action.payload);
      return {
        ...state,
        locale: action.payload,
      };
    }
    case actions.ADD_LOCALE: {
      return {
        ...state,
        dict: action.payload,
      };
    }
    case actions.SET_USER: {
      localStorage.setItem('user', JSON.stringify(action.user));
      return {
        ...state,
        user: getData('user', null),
      };
    }
    case actions.REMOVE_USER: {
      localStorage.setItem('user', JSON.stringify(null));
      return {
        ...state,
        user: getData('user', null),
      };
    }
    case actions.SEARCH: {
      return {
        ...state,
        searchValue: action.payload,
      };
    }
    case actions.SET_AUTHFORM: {
      return {
        ...state,
        authForm: {
          ...state.authForm,
          ...action.payload,
        },
      };
    }
    case actions.SET_SPRINT_ANSWERS: {
      return {
        ...state,
        sprintTruelyAnswers: action.payload.truely,
        sprintFalsyAnswers: action.payload.falsy,
        sprintPoints: action.payload.points,
      };
    }
    default:
      return state;
  }
}
