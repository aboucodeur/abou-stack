import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/home/Home'

function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
    </Routes>
  )
}

export default AppRoutes
