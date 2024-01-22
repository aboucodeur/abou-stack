import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/home/Home'
import Contact from '../pages/contact/Contact'

function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="contact" element={<Contact />} />
    </Routes>
  )
}

export default AppRoutes
