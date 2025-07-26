import { clerkClient } from '@clerk/express'
import User from '../models/User.js' // ✅ Replace with your actual path
import Course from '../models/Course.js'
import { v2 as cloudinary } from 'cloudinary'
import { Purchase } from '../models/Purchase.js'


// ✅ Update role to educator
export const updateRoleToEducator = async (req, res) => {
    try {
        const { userId } = await req.auth()

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            }
        })

        res.json({ success: true, message: 'You can publish a course now' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ✅ Add New Course
export const addCourse = async (req, res) => {
    try {
        const { userId } = await req.auth()
        const { courseData } = req.body
        const imageFile = req.file

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached!' })
        }

        const parsedCourseData = JSON.parse(courseData)
        parsedCourseData.educator = userId

        const newCourse = await Course.create(parsedCourseData)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        newCourse.courseThumbnail = imageUpload.secure_url
        await newCourse.save()

        res.json({ success: true, message: 'Course Added' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// ✅ Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {
        const { userId: educator } = await req.auth()

        const courses = await Course.find({ educator })
        res.json({ success: true, courses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//Get Educator Dashboard Data (Total Earning, Enrolled Students, No. of Course)

export const educatorDashboardData = async(req,res)=>{
    try {
        const { userId: educator } = await req.auth()
        const courses = await Course.find({ educator });
        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        //Calculate total earnings from purchase
        const purchases = await Purchase.find({
            courseId: {$in: courseIds},
            status: 'Completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase)=> sum + purchase.amount, 0);

        //Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for(const course of courses){
            const students = await User.find({
                _id: {$in: course.enrolledStudents}
            }, 'name imageUrl')

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({success:true, dashboardData: {
            totalEarnings, enrolledStudentsData, totalCourses
        }})

    } catch (error) {
        res.json({success:false, message: error.message})
    }
}

//Get Enrolled students data with purchase Data
export const getEnrolledStudentsData = async (req,res)=>{
    try {
        const { userId: educator } = await req.auth();
        const courses = await Course.find({ educator });
        const courseIds = courses.map(course => course._id);

        const purchases = await purchase.find({
            courseIds: {$in: courseId},
            status: 'Completed'
        }).populate('userId', 'name imageUrl').populate('courseId','courseTitle')
        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({success: true, enrolledStudents})

    } catch (error) {
        res.json({success: false,message: error.message});
    }
}

