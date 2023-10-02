import React, { createContext, useCallback, useReducer } from 'react'

const GlobalContext = createContext({
  isAuth: false,
  users: {}
})

const reducerFn = (state, { type, payload }) => {
  switch (type) {
    case 'connected':
      break
    default:
      return state
  }
}

function AppContext({ children }) {
  const [state, dispatch] = useReducer(reducerFn, GlobalContext)

  // get data in store
  const useSelect = useCallback((cb) => cb(state), [state])

  const value = {}
  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  )
}

export default AppContext
