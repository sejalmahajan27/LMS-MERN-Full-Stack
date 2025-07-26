import express from 'express'
import { addCourse, educatorDashboardData, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from '../controllers/educatorController.js'
import upload from '../configs/multer.js'
import { protectEducator } from '../middlewares/authMiddleware.js'

const educatorRouter = express.Router()

// ✅ Route to update user role to educator (no auth middleware here)
educatorRouter.get('/update-role', updateRoleToEducator)

// ✅ Route to add a course (only accessible to educators)
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse)

educatorRouter.get('/courses',protectEducator, getEducatorCourses)
educatorRouter.get('/dashboard',protectEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students',protectEducator, getEnrolledStudentsData)


export default educatorRouter
