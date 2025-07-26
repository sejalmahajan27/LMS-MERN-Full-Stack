import Stripe from 'stripe'
import { Purchase } from '../models/Purchase.js'
import Course from '../models/Course.js'
import User from '../models/User.js'
import { courseProgress } from '../models/courseProgress.js'

// Get User Data
export const getUserData = async (req, res) => {
    try {
        const { userId } = await req.auth()

        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found!' })
        }

        res.json({ success: true, user })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// User Enrolled Courses with Lecture Link
export const userEnrolledCourses = async (req, res) => {
    try {
        const { userId } = await req.auth()
        const userData = await User.findById(userId).populate('enrolledCourses')

        res.json({ success: true, enrolledCourses: userData.enrolledCourses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Purchase Course
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const { origin } = req.headers
        const { userId } = await req.auth()

        const userData = await User.findById(userId)
        const courseData = await Course.findById(courseId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: "Data Not Found!" })
        }

        // ✅ Fallback for missing discount to avoid NaN
        const coursePrice = courseData.coursePrice || 0
        const discount = courseData.discount || 0

        const finalAmount = parseFloat(
            (coursePrice - (discount * coursePrice / 100)).toFixed(2)
        )

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: finalAmount
        }

        const newPurchase = await Purchase.create(purchaseData)

        // Stripe Gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const currency = process.env.CURRENCY.toLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(finalAmount * 100) // convert to paisa/cents
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })

        // ✅ FIXED: use session.url not undefined variable
        res.json({ success: true, session_url: session.url })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// update user course progress
export const updateUserCourseProgress = async (req,res)=> {
    try {
        const { userId } = await req.auth() 
        const {courseId, lectureId} = req.body
        const progressData = await courseProgress.findOne({userId, courseId})

        if (progressData) {
            if(progressData.lectureCompleted.includes(lectureId)) {
                return res.json({success: true, message: 'Lecture Already Completed!'})
            }

            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        } else {
            await courseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })
        }

        res.json({success:true, message: 'Progress Updated'})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}


//Get user course progress
export const getUserCourseProgress = async (req,res)=> {
    try {
        const { userId } = await req.auth() 
        const {courseId} = req.body
        const progressData = await courseProgress.findOne({userId, courseId})
        res.json({success:true, progressData})

    } catch (error) {
        res.json({success:false, message: error.message})
    }
}

// Add user Rating to Course
export const addUserRating = async (req,res)=> {
    const { userId } = await req.auth() 
    const {courseId, rating} = req.body;

    if(!courseId || !userId || !rating || rating < 1 || rating > 5){
        return res.json({success: false, message: 'Invalid Details' });
    }

    try {
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({success: false, message: 'Course not found'})
        }


        const user = await User.findById(userId);

        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({success: false, message: 'User has not purchased this course.'});
        }

        const existingRatingIndex = course.courseRating.findIndex(r => r.userId === userId)

        if (existingRatingIndex > -1) {
            course.courseRating[existingRatingIndex].rating = rating;
        } else {
            course.courseRating.push({userId, rating});
        }
        await course.save();
        return res.json({success: true, message:'Rating added!'})

    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}