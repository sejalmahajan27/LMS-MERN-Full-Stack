import React from 'react'
import CourseCard from './CourseCard' // adjust path if needed

// Inline ErrorBoundary class
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in CourseCard:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <p>Something went wrong loading this course.</p>
        </div>
      )
    }

    return this.props.children
  }
}

const CoursesSection = ({ courses }) => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
      {Array.isArray(courses) && courses.map((course, index) =>
        course ? (
          <ErrorBoundary key={course._id || index}>
            <CourseCard course={course} />
          </ErrorBoundary>
        ) : null
      )}
    </div>
  )
}

export default CoursesSection
