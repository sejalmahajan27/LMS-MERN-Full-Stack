import React from 'react'
import { assets, dummyTestimonial } from '../../assets/assets'

const Testimonial = () => {
  return (
    <div className='pb-14 px-8 md:px-0 max-w-4xl mx-auto'>
      <h2 className='text-4xl font-medium text-center text-gray-800'>Testimonials</h2>
      <p className='text-center md:text-base text-gray-500 mt-3'>
        Hear from our learners as they share their journeys of transformation, success, and how our <br />
        platform has made a difference in their lives.
      </p>

      <div className='grid grid-cols-auto gap-8 mt-14'>
        {dummyTestimonial.map((testimonial, index) => (
          <div
            key={index}
            className='text-sm text-left border border-gray-200 pb-6 rounded-lg bg-white shadow-[0px_4px_15px_0px] shadow-black/5 overflow-hidden'
          >
            <div className='flex items-center gap-4 px-5 py-4 bg-gray-500/10'>
              <img
                className='h-12 w-12 rounded-full object-cover'
                src={testimonial.image}
                alt={testimonial.name}
              />
              <div>
                <h1 className='text-lg font-medium text-gray-800'>{testimonial.name}</h1>
                <p className='text-gray-800/80 text-sm'>{testimonial.role}</p>
              </div>
            </div>

            <div className='px-5 pt-2'>
              <div className='flex gap-0.5'>
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={i < Math.floor(testimonial.rating) ? assets.star : assets.star_blank}
                    alt="star"
                    className='w-4 h-4'
                  />
                ))}
              </div>
              <p className='text-gray-500 mt-4 text-sm'>{testimonial.feedback}</p>
            </div>
            <a href="#" className='text-blue-500 underline px-5'>Read more</a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Testimonial
