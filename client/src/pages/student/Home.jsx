import React from 'react'
import Hero from '../../components/student/Hero'
import Compnies from '../../components/student/Compnies'
import CoursesSection from '../../components/student/CoursesSection'
import Testimonial from '../../components/student/Testimonial'
import CallToAction from '../../components/student/CallToAction'
import Footer from '../../components/student/Footer'

const Home = () => {
  return (
    <div className='flex flex-col items-center space-y-7 text-center'>
        <Hero/>
        <Compnies />
        <CoursesSection/>
        <Testimonial/>
        <CallToAction/>
        <Footer/>
    </div>
  )
}

export default Home